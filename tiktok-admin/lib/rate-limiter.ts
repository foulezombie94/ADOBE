/**
 * Token Bucket Rate Limiter — Admin Version (v3 - Production)
 * 
 * Architecture:
 * 1. Redis (Upstash) primary: Persistent, cross-instance, survives restarts
 * 2. In-memory fallback: If Redis is unavailable, fall back gracefully
 * 3. Hardware fingerprint support: Rate limit by fingerprint, not just IP
 * 
 * Note: Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in env
 * to enable Redis. Without them, the system falls back to in-memory.
 */

// =============================================
// TYPES
// =============================================

interface RateLimitConfig {
  maxTokens: number    // Max burst capacity
  refillRate: number   // Tokens added per second
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs?: number
  limit: number
  backend: 'redis' | 'memory'
}

// =============================================
// ENDPOINT CONFIGS
// =============================================

const LIMITS: Record<string, RateLimitConfig> = {
  'api:general':     { maxTokens: 60,  refillRate: 10 },
  'api:users':       { maxTokens: 20,  refillRate: 2 },  // Strict limit for admin users exploration
  'api:metrics':     { maxTokens: 10,  refillRate: 1 },  // Very strict for heavy analytics queries
  'api:auth':        { maxTokens: 5,   refillRate: 0.1 },
}

// =============================================
// REDIS ADAPTER
// =============================================

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

async function redisCommand(command: string[]): Promise<any | null> {
  if (!REDIS_URL || !REDIS_TOKEN) return null

  try {
    const resp = await fetch(`${REDIS_URL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(2000),
    })

    if (!resp.ok) return null
    const data = await resp.json()
    return data.result
  } catch {
    return null
  }
}

async function checkRedisRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<RateLimitResult | null> {
  if (!REDIS_URL || !REDIS_TOKEN) return null

  const key = `rl:admin:${endpoint}:${identifier}`
  const now = Date.now()
  const ttlSeconds = Math.ceil(config.maxTokens / config.refillRate) + 10

  const luaScript = `
    local key = KEYS[1]
    local maxTokens = tonumber(ARGV[1])
    local refillRate = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])
    local ttl = tonumber(ARGV[4])

    local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
    local tokens = tonumber(bucket[1])
    local lastRefill = tonumber(bucket[2])

    if tokens == nil then
      tokens = maxTokens
      lastRefill = now
    end

    local elapsed = (now - lastRefill) / 1000
    tokens = math.min(maxTokens, tokens + elapsed * refillRate)
    lastRefill = now

    local allowed = 0
    if tokens >= 1 then
      tokens = tokens - 1
      allowed = 1
    end

    redis.call('HMSET', key, 'tokens', tostring(tokens), 'lastRefill', tostring(lastRefill))
    redis.call('EXPIRE', key, ttl)

    return {allowed, math.floor(tokens)}
  `

  try {
    const result = await redisCommand([
      'EVAL', luaScript, '1', key,
      config.maxTokens.toString(),
      config.refillRate.toString(),
      now.toString(),
      ttlSeconds.toString(),
    ])

    if (result && Array.isArray(result)) {
      const allowed = result[0] === 1
      const remaining = result[1]

      return {
        allowed,
        remaining,
        retryAfterMs: allowed ? undefined : Math.ceil((1 / config.refillRate) * 1000),
        limit: config.maxTokens,
        backend: 'redis',
      }
    }
  } catch {
    // Redis failed
  }

  return null
}

// =============================================
// IN-MEMORY FALLBACK
// =============================================

interface MemoryBucket {
  tokens: number
  lastRefill: number
}

const memoryBuckets = new Map<string, MemoryBucket>()
let lastCleanup = Date.now()
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
const BUCKET_MAX_AGE_MS = 10 * 60 * 1000

function cleanupMemoryBuckets() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  const keysToDelete: string[] = []
  memoryBuckets.forEach((bucket, key) => {
    if (now - bucket.lastRefill > BUCKET_MAX_AGE_MS) {
      keysToDelete.push(key)
    }
  })
  
  if (keysToDelete.length > 0) {
    console.log(`[RateLimiter] Cleaning up ${keysToDelete.length} stale buckets`)
    keysToDelete.forEach(key => memoryBuckets.delete(key))
  }
}

// Auto-cleanup interval for background maintenance
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupMemoryBuckets, CLEANUP_INTERVAL_MS)
}

function checkMemoryRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupMemoryBuckets()

  const key = `${endpoint}:${identifier}`
  const now = Date.now()

  let bucket = memoryBuckets.get(key)
  if (!bucket) {
    bucket = { tokens: config.maxTokens, lastRefill: now }
    memoryBuckets.set(key, bucket)
  }

  const elapsed = (now - bucket.lastRefill) / 1000
  bucket.tokens = Math.min(config.maxTokens, bucket.tokens + elapsed * config.refillRate)
  bucket.lastRefill = now

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      limit: config.maxTokens,
      backend: 'memory',
    }
  }

  const tokensNeeded = 1 - bucket.tokens
  const retryAfterMs = Math.ceil((tokensNeeded / config.refillRate) * 1000)

  return {
    allowed: false,
    remaining: 0,
    retryAfterMs,
    limit: config.maxTokens,
    backend: 'memory',
  }
}

// =============================================
// PUBLIC API
// =============================================

export function buildIdentifier(
  req: Request,
  userId?: string | null,
  fingerprint?: string | null
): string {
  if (fingerprint && fingerprint.length >= 8) {
    return `fp:${fingerprint}`
  }
  if (userId) {
    return `uid:${userId}`
  }
  return `ip:${getClientIP(req)}`
}

export async function checkRateLimit(identifier: string, endpoint: string): Promise<RateLimitResult> {
  const config = LIMITS[endpoint] || LIMITS['api:general']

  if (REDIS_URL && REDIS_TOKEN) {
    const redisResult = await checkRedisRateLimit(identifier, endpoint, config)
    if (redisResult) return redisResult
  }

  return checkMemoryRateLimit(identifier, endpoint, config)
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Backend': result.backend,
  }

  if (!result.allowed && result.retryAfterMs) {
    headers['Retry-After'] = Math.ceil(result.retryAfterMs / 1000).toString()
    headers['X-RateLimit-Reset'] = new Date(Date.now() + result.retryAfterMs).toISOString()
  }

  return headers
}

export function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

export function classifyEndpoint(pathname: string): string {
  if (pathname.includes('/api/metrics')) return 'api:metrics'
  if (pathname.includes('/api/users')) return 'api:users'
  if (pathname.includes('/api/auth')) return 'api:auth'
  return 'api:general'
}
