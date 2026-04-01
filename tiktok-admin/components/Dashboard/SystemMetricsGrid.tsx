'use client'

import React from 'react'
import { Cpu, MemoryStick, Activity, Globe, TrendingUp, Zap, Loader2, Users, Video, ShieldAlert } from 'lucide-react'
import { useMetrics } from '@/hooks/useMetrics'
import { cn } from '@/lib/utils'

export default function SystemMetricsGrid() {
  const metrics = useMetrics()

  // Loading State
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10 min-h-[160px]">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="surface-container p-6 rounded-2xl animate-pulse flex items-center justify-center border border-outline/5">
            <Loader2 className="w-6 h-6 animate-spin text-outline/20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-10 mb-10">
      {/* 1. Infrastructure Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* CPU Health Card */}
        <MetricCard
          label="Charge CPU"
          value={`${metrics.cpu.toFixed(1)}%`}
          subValue="Real-time Load"
          icon={Cpu}
          progress={metrics.cpu}
          status={metrics.cpu > 80 ? 'critical' : metrics.cpu > 50 ? 'warning' : 'healthy'}
          colorClass="bg-primary"
        />

        {/* RAM Card */}
        <MetricCard
          label="Mémoire RAM"
          value={`${metrics.ram.toFixed(1)} GB`}
          subValue={`/ ${metrics.ramTotal} GB`}
          icon={MemoryStick}
          progress={(metrics.ram / metrics.ramTotal) * 100}
          status="healthy"
          colorClass="bg-secondary"
        />

        {/* Latency Card */}
        <MetricCard
          label="Latence API"
          value={`${metrics.latency.toFixed(0)} ms`}
          subValue="Moyenne glissante"
          icon={Zap}
          progress={metrics.latency / 2} // Assuming 0-200ms scale
          status={metrics.latency > 150 ? 'critical' : metrics.latency > 50 ? 'warning' : 'healthy'}
          colorClass="bg-amber-500"
        />

        {/* Network health */}
        <div className="bg-primary p-6 rounded-2xl shadow-xl flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe className="w-24 h-24" />
          </div>
          
          <div className="flex justify-between items-start text-white relative z-10">
            <div className="p-3 bg-white/20 backdrop-blur-lg rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Cache Hit Rate</p>
              <p className="text-xl font-black font-manrope">{metrics.cacheHitRate.toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="mt-6 relative z-10">
            <div className="flex items-center gap-2 mb-2">
               <TrendingUp className="w-3 h-3 text-emerald-400" />
               <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Uptime: {metrics.uptime}</p>
            </div>
            <div className="flex items-end gap-1.5 h-10">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-full bg-white/30 rounded-full transition-all duration-500" 
                  style={{ height: `${Math.random() * 80 + 20}%` }} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Business Analytics (Supabase Real Data) */}
      {metrics.analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <AnalyticsMiniCard 
             icon={Users} 
             label="Utilisateurs" 
             value={metrics.analytics.users.toString()} 
             color="text-primary" 
             bg="bg-primary/10" 
           />
           <AnalyticsMiniCard 
             icon={Video} 
             label="Vidéos" 
             value={metrics.analytics.videos.toString()} 
             color="text-secondary" 
             bg="bg-secondary/10" 
           />
           <AnalyticsMiniCard 
             icon={ShieldAlert} 
             label="Signalements" 
             value={metrics.analytics.reports.toString()} 
             color="text-error" 
             bg="bg-error/10" 
           />
        </div>
      )}
    </div>
  )
}

function AnalyticsMiniCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="surface-container p-6 rounded-2xl shadow-lg border border-outline/5 flex items-center gap-5 group hover:border-primary/20 transition-all">
      <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", bg, color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-outline tracking-widest">{label}</p>
        <h3 className="text-2xl font-black font-manrope">{value}</h3>
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
  subValue: string
  icon: React.ElementType
  progress: number
  status: 'healthy' | 'warning' | 'critical'
  colorClass: string
}

function MetricCard({ label, value, subValue, icon: Icon, progress, status, colorClass }: MetricCardProps) {
  const statusColors = {
    healthy: 'text-emerald-500',
    warning: 'text-amber-500',
    critical: 'text-error'
  }

  const statusLabels = {
    healthy: 'Optimal',
    warning: 'Sous charge',
    critical: 'Critique'
  }

  return (
    <div className="surface-container p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-outline/5 relative group overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-3 rounded-xl bg-opacity-10", colorClass.replace('bg-', 'text-'))} style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <Icon className={cn("w-6 h-6", colorClass.replace('bg-', 'text-'))} />
        </div>
        <div className="flex items-center gap-2">
           <span className={cn("text-[10px] font-black uppercase tracking-widest", statusColors[status])}>{statusLabels[status]}</span>
           <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-sm", status === 'healthy' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-error')} />
        </div>
      </div>
      
      <div>
        <p className="text-xs font-bold text-outline uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-baseline gap-2 mb-4">
          <h3 className="text-2xl font-black text-on-surface font-manrope">{value}</h3>
          <span className="text-[10px] text-outline font-medium">{subValue}</span>
        </div>
        
        <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-700 ease-out", colorClass)} 
            style={{ width: `${Math.min(100, Math.max(5, progress))}%` }} 
          />
        </div>
      </div>
    </div>
  )
}
