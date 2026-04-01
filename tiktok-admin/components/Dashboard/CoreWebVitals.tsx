'use client'

import React from 'react'
import { Timer, Zap, Layout, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CoreWebVitals() {
  const vitals = [
    { name: 'LCP', label: 'Largest Contentful Paint', value: '1.2s', status: 'good' },
    { name: 'FID', label: 'First Input Delay', value: '18ms', status: 'good' },
    { name: 'CLS', label: 'Cumulative Layout Shift', value: '0.04', status: 'good' },
    { name: 'INP', label: 'Interaction to Next Paint', value: '45ms', status: 'warning' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {vitals.map((v) => (
        <div key={v.name} className="surface-container p-4 rounded-xl border border-outline/5 hover:border-primary/20 transition-all group">
          <div className="flex justify-between items-center mb-1">
             <span className="text-[10px] font-black uppercase tracking-widest text-outline">{v.name}</span>
             <div className={cn(
               "w-1.5 h-1.5 rounded-full",
               v.status === 'good' ? 'bg-emerald-500' : 'bg-amber-500'
             )} />
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-lg font-black font-manrope text-on-surface">{v.value}</h4>
            <span className="text-[9px] text-outline font-medium truncate opacity-60">{v.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
