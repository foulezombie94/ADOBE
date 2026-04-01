'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Terminal, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  Activity, 
  Server,
  Database,
  Lock,
  Cloud,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'error' | 'security' | 'audit'
  msg: string
  service: string
}

export default function LiveLogTerminal() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Fetch Real Activity Logs from Supabase Audit Log
  const fetchLogs = async () => {
    if (isPaused) return
    try {
      const res = await fetch('/api/logs?limit=50')
      if (res.ok) {
        const data = await res.json()
        setLogs(prev => {
          // Si on a de nouveaux logs, on met à jour
          if (data.logs.length > 0 && (prev.length === 0 || data.logs[0].id !== prev[0].id)) {
            return data.logs
          }
          return prev
        })
      }
    } catch (err) {
      console.error("[LOG_FETCH_ERROR]", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    // 2. Real-time Polling (toutes les 5s)
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [isPaused])

  // Scroll to bottom on new logs
  useEffect(() => {
    if (!isPaused) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, isPaused])

  const clearLogs = () => setLogs([])

  return (
    <div className="surface-container rounded-3xl shadow-2xl overflow-hidden border border-outline/10 flex flex-col h-[500px]">
      {/* Terminal Header */}
      <div className="bg-surface-variant/80 p-5 border-b border-outline/10 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-error/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
          </div>
          <Terminal className="w-4 h-4 text-outline" />
          <h4 className="text-xs font-black font-manrope uppercase tracking-widest text-on-surface">Console d&apos;Audit en Temps Réel</h4>
          {!isPaused && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-1" />}
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-outline mr-2" />}
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border",
              isPaused 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                : "bg-surface-variant hover:bg-background text-outline border-outline/10"
            )}
          >
            {isPaused ? 'Reprendre le flux' : 'Pause'}
          </button>
          <button 
            onClick={clearLogs}
            className="p-1.5 bg-surface-variant hover:bg-error/10 hover:text-error rounded-lg transition-all text-outline"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 bg-background/50 p-6 font-mono text-[11px] overflow-y-auto custom-scrollbar selection:bg-primary/30 scroll-smooth">
        <div className="space-y-2.5">
          {logs.length === 0 && !loading && (
            <div className="flex items-center gap-2 text-outline/30 animate-pulse">
               <ChevronRight className="w-3 h-3" />
               <p>Attente de données depuis le serveur Supabase...</p>
            </div>
          )}
          {logs.map((log, i) => (
            <div key={log.id} className="group animate-in fade-in slide-in-from-left-2 duration-300">
               <div className="flex items-start gap-3">
                 <span className="text-outline/40 whitespace-nowrap pt-1 select-none flex items-center gap-1">
                   <ChevronRight className="w-2.5 h-2.5 opacity-40" />
                   {log.timestamp}
                 </span>
                 <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                   <div className={cn(
                     "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 self-start",
                     log.level === 'error' ? "bg-error/10 text-error" : 
                     log.level === 'security' ? "bg-rose-500/10 text-rose-500" :
                     log.level === 'audit' ? "bg-primary/10 text-primary" :
                     "bg-emerald-500/10 text-emerald-500"
                   )}>
                     <LevelIcon level={log.level} />
                     {log.level}
                   </div>
                   <span className="text-on-surface leading-relaxed break-all sm:break-normal">
                     {log.msg}
                   </span>
                 </div>
                 <span className="text-[9px] font-black uppercase text-outline/20 tracking-tighter self-center hidden sm:block">
                   {log.service}
                 </span>
               </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </div>
      
      {/* Terminal Status Bar */}
      <div className="bg-surface-variant/40 px-6 py-3 border-t border-outline/10 backdrop-blur-sm">
         <div className="flex justify-between items-center gap-6">
            <div className="flex items-center gap-6 text-[9px] font-bold text-outline">
               <div className="flex items-center gap-1.5">
                 <Database className="w-3 h-3" />
                 <span>Supabase: Online</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <Lock className="w-3 h-3" />
                 <span>SSL: Encrypted</span>
               </div>
               <div className="flex items-center gap-1.5 hidden sm:flex">
                 <Cloud className="w-3 h-3" />
                 <span>Region: EU-Paris</span>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 text-[9px] font-black uppercase text-secondary">
                  <Activity className="w-3 h-3" />
                  <span>{logs.length} Événements</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

function LevelIcon({ level }: { level: LogEntry['level'] }) {
  switch (level) {
    case 'security': return <Lock className="w-2.5 h-2.5" />
    case 'error': return <AlertCircle className="w-2.5 h-2.5" />
    case 'audit': return <ShieldCheck className="w-2.5 h-2.5" />
    default: return <Server className="w-2.5 h-2.5" />
  }
}
