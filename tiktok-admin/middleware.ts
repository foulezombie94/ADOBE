import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { 
  checkRateLimit, 
  getRateLimitHeaders, 
  buildIdentifier, 
  classifyEndpoint 
} from '@/lib/rate-limiter'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protections contre le brute-force et le spam sur les routes sensibles
  if (pathname.startsWith('/api/users') || pathname.startsWith('/api/metrics')) {
    const hardwareId = request.cookies.get('_tk_dev_id')?.value || null
    const identifier = buildIdentifier(request, null, hardwareId)
    const endpoint = classifyEndpoint(pathname)
    
    const rateLimit = await checkRateLimit(identifier, endpoint)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez plus tard.' },
        { 
          status: 429, 
          headers: getRateLimitHeaders(rateLimit) 
        }
      )
    }

    // On continue et on ajoute les headers de rate-limit à la réponse finale
    const response = await updateSession(request)
    const rlHeaders = getRateLimitHeaders(rateLimit)
    Object.entries(rlHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
