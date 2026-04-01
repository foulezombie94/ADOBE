'use client'

import React from 'react'
import { RefreshCw, Users, Activity, Terminal, ShieldAlert, ArrowRight, Zap, Server } from 'lucide-react'
import Link from 'next/link'
import CoreWebVitals from '@/components/Dashboard/CoreWebVitals'
import { useMetrics } from '@/hooks/useMetrics'
import { cn } from '@/lib/utils'

export default function OverviewPage() {
  const metrics = useMetrics()

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2 text-primary">
            <Zap className="w-4 h-4 fill-primary" />
            <span className="text-xs font-black uppercase tracking-widest">NOC | Global Overview</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-on-surface mb-2 font-manrope text-glow-sm">Dashboard Digital Curator</h2>
          <p className="text-outline text-sm font-medium max-w-2xl leading-relaxed">
            État de santé global du <span className="text-primary font-bold">TikTok Clone Cluster</span>. 
            Accédez aux modules spécialisés pour la modération, le monitoring hardware ou l&apos;audit de sécurité.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 md:flex-none px-6 py-3 bg-surface-variant text-on-surface font-black rounded-xl shadow-sm border border-outline/10 flex items-center justify-center gap-2 hover:bg-background transition-all active:scale-95 text-[10px] uppercase tracking-widest"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* 1. Core Web Vitals (APM Highlight) */}
      <section className="mb-12">
        <CoreWebVitals />
      </section>

      {/* 2. Navigation Hub (The "Suite" Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <NavCard 
          title="Utilisateurs & Modération" 
          desc="Gérez les bannissements, le fingerprinting et la sécurité des comptes."
          href="/users"
          icon={Users}
          color="primary"
          count={metrics?.usersCount?.toString() || '...'}
          label="Comptes actifs"
        />
        <NavCard 
          title="Santé de l'Infrastructure" 
          desc="Statistiques CPU/RAM, latence réseau et état des clusters de base de données."
          href="/health"
          icon={Activity}
          color="secondary"
          count={metrics?.cpuUsage ? `${metrics.cpuUsage}%` : '...'}
          label="Charge CPU"
        />
        <NavCard 
          title="Audit & Logs Système" 
          desc="Terminal en temps réel surveillant chaque action critique et erreur serveur."
          href="/logs"
          icon={Terminal}
          color="emerald"
          count={metrics?.uptime || '...'}
          label="Temps de service"
        />
      </div>

      {/* 3. Operational Quick Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* System Info Widget */}
         <div className="bg-gradient-to-br from-indigo-900/60 to-surface border border-indigo-500/20 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 rotate-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
               <Server className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h4 className="text-xl font-black font-manrope mb-8 flex items-center gap-2">
                Identité Réseau
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h4>
              <div className="space-y-4">
                <InfoItem label="Uptime Cluster" value={metrics?.uptime || 'Calcul...'} />
                <InfoItem label="Latence Edge" value={`${metrics?.latency || 0} ms`} />
                <InfoItem label="Database Host" value="Supabase-AWS-EU-West" />
                <InfoItem label="Instance Version" value="v1.4.2-STABLE" />
              </div>
            </div>
         </div>

         {/* Security Patch Widget */}
         <div className="bg-rose-950/40 border border-rose-500/20 rounded-3xl p-8 text-white group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 -rotate-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
               <ShieldAlert className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h4 className="text-xl font-black font-manrope mb-8 flex items-center gap-2 text-rose-400">
                Alerte Sécurité
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </h4>
              <p className="text-sm text-rose-200/60 leading-relaxed mb-8">
                Le module de **Fingerprinting Matériel** est actif. Le dashboard détecte automatiquement les tentatives de réinscription post-bannissement.
              </p>
              <Link 
                href="/users"
                className="inline-flex items-center gap-3 px-6 py-3 bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-400 transition-all shadow-lg active:scale-95"
              >
                Vérifier les alertes
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
         </div>
      </div>
    </div>
  )
}

function NavCard({ title, desc, href, icon: Icon, color, count, label }: any) {
  const themes: any = {
    primary: "border-primary/10 hover:border-primary/40 text-primary",
    secondary: "border-secondary/10 hover:border-secondary/40 text-secondary",
    emerald: "border-emerald-500/10 hover:border-emerald-500/40 text-emerald-500"
  }

  return (
    <Link href={href} className={cn(
      "surface-container p-8 rounded-3xl border transition-all duration-300 group flex flex-col justify-between h-full hover:shadow-2xl hover:-translate-y-1",
      themes[color]
    )}>
      <div>
        <div className={cn("p-4 rounded-2xl bg-opacity-10 mb-6 inline-block", 
          color === 'primary' ? "bg-primary" : color === 'secondary' ? "bg-secondary" : "bg-emerald-500"
        )}>
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black font-manrope text-on-surface mb-3">{title}</h3>
        <p className="text-sm text-outline font-medium leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity">{desc}</p>
      </div>
      
      <div className="flex items-end justify-between">
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{label}</p>
            <p className="text-2xl font-black font-manrope text-on-surface tabular-nums">{count}</p>
         </div>
         <div className="p-3 bg-surface-variant rounded-xl group-hover:bg-on-surface group-hover:text-surface transition-all">
            <ArrowRight className="w-5 h-5" />
         </div>
      </div>
    </Link>
  )
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center group/item hover:bg-white/5 p-2 rounded-lg transition-colors">
      <span className="text-[10px] font-black uppercase tracking-wider text-white/40">{label}</span>
      <span className="font-mono text-sm font-bold text-white group-hover/item:text-primary transition-colors">{value}</span>
    </div>
  )
}
