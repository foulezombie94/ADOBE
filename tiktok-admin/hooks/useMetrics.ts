'use client'

import { useState, useEffect } from 'react'

export interface SystemMetrics {
  cpu: number
  cpuUsage?: number // Alias pour la compatibilité Dashboard
  ram: number
  ramTotal: number
  networkIn: number
  networkOut: number
  latency: number
  cacheHitRate: number
  uptime: string
  usersCount?: number // Alias pour la compatibilité Dashboard
  analytics?: {
    users: number
    videos: number
    reports: number
  }
}

/**
 * useMetrics Hook - Real-time APM Data
 * Connects to the local dashboard API to fetch system and Supabase stats.
 */
export function useMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/metrics')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        
        if (data.system) {
          setMetrics({
            ...data.system,
            cpuUsage: data.system.cpu, // Mapping CPU
            usersCount: data.analytics?.users || 0, // Mapping Users
            analytics: data.analytics // Inject real count data from Supabase
          })
        }
      } catch (err) {
        console.error("[MONITORING_HOOK_ERROR]", err)
      }
    }

    // Initial fetch
    fetchMetrics()

    // Real-time interval (5s polling for dashboard metrics)
    const interval = setInterval(fetchMetrics, 5000)

    return () => clearInterval(interval)
  }, [])

  return metrics
}
