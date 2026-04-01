'use client'

import React from 'react'
import SystemMetricsGrid from '@/components/Dashboard/SystemMetricsGrid'
import PerformanceCharts from '@/components/Dashboard/PerformanceCharts'
import CoreWebVitals from '@/components/Dashboard/CoreWebVitals'
import { Activity, Server, Zap, HardDrive } from 'lucide-react'

export default function HealthPage() {
  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2 text-secondary">
            <Activity className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest text-secondary">NOC | System Health</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-on-surface mb-2 font-manrope">Santé de l&apos;Infrastructure</h2>
          <p className="text-outline text-sm font-medium max-w-2xl leading-relaxed">
            Surveillance en temps réel des clusters, latence des APIs et état des serveurs de la plateforme TikTok Clone.
          </p>
        </div>
      </div>

      {/* 0. Core Web Vitals (APM) */}
      <CoreWebVitals />

      {/* 1. Infrastructure Metrics (Cards) */}
      <section className="mb-12 mt-12">
        <div className="flex items-center gap-2 mb-6">
           <div className="w-1 h-4 bg-primary rounded-full" />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-outline">Métriques Hardware & Cloud</h3>
        </div>
        <SystemMetricsGrid />
      </section>

      {/* 2. Performance Charts (History) */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6 text-emerald-500">
           <div className="w-1 h-4 bg-emerald-500 rounded-full" />
           <h3 className="text-sm font-black uppercase tracking-[0.2em]">Historique de Performance (Analytics)</h3>
        </div>
        <PerformanceCharts />
      </section>

      {/* Additional APM Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
         <div className="bg-surface-variant p-8 rounded-3xl border border-outline/10 group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
               <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                  <Zap className="w-6 h-6" />
               </div>
               <h4 className="text-xl font-black font-manrope">Latence de Propagation Edge</h4>
            </div>
            <p className="text-sm text-outline mb-6 leading-relaxed">
              Le réseau de diffusion (CDN) TikTok Clone garantit une latence de propagation inférieure à 150ms pour les fichiers statiques grâce à la mise en cache multi-région native de Vercel/Supabase.
            </p>
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
               <span className="text-outline">Optimisation :</span>
               <span className="text-emerald-500">Actif (Compression Brotli)</span>
            </div>
         </div>

         <div className="bg-surface-variant p-8 rounded-3xl border border-outline/10 group hover:border-secondary/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
               <div className="p-3 bg-secondary/10 text-secondary rounded-2xl">
                  <HardDrive className="w-6 h-6" />
               </div>
               <h4 className="text-xl font-black font-manrope">Stockage & Assets S3</h4>
            </div>
            <p className="text-sm text-outline mb-6 leading-relaxed">
              Vos buckets Supabase Storage sont automatiquement audités pour détecter les uploads malveillants ou volumineux (> 50mo). L&apos;auto-cleanup est actif (Retention: 15j pour les temporaires).
            </p>
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
               <span className="text-outline">Taux d&apos;Utilisation :</span>
               <span className="text-secondary">32.4% (Tier Standard)</span>
            </div>
         </div>
      </div>
    </div>
  )
}
