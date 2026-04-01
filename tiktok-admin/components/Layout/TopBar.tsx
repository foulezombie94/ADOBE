'use client'

import React from 'react'
import { Search, Bell, Terminal, ChevronDown, ShieldCheck } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function TopBar() {
  const pathname = usePathname()

  // Ne pas afficher la TopBar sur la page de login
  if (pathname === '/login') return null

  return (
    <header className="h-20 border-b border-outline/10 bg-surface/50 backdrop-blur-xl flex items-center justify-between px-8 z-30 font-manrope">
      {/* Global Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-all" />
          <input
            type="text"
            placeholder="Rechercher utilisateur, log ou IP critique..."
            className="w-full h-12 pl-12 pr-4 bg-background/50 border border-outline/5 rounded-2xl text-xs placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 transition-all font-body text-on-surface"
          />
        </div>
      </div>

      {/* Actions & User */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-outline border-r border-outline/10 pr-6">
          <button className="p-2.5 hover:bg-surface-variant/50 rounded-xl transition-all relative group border border-transparent hover:border-outline/5">
            <Bell className="w-5 h-5 group-hover:text-primary" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full pointer-events-none ring-2 ring-surface animate-pulse" />
          </button>
          <button className="p-2.5 hover:bg-surface-variant/50 rounded-xl transition-all group border border-transparent hover:border-outline/5">
            <Terminal className="w-5 h-5 group-hover:text-on-surface" />
          </button>
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 cursor-pointer group p-1.5 hover:bg-surface-variant/30 rounded-2xl transition-all border border-transparent hover:border-outline/5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-on-surface leading-none mb-1">Super Admin</p>
            <div className="flex items-center gap-1.5 justify-end">
               <ShieldCheck className="w-3 h-3 text-primary" />
               <p className="text-[9px] text-outline font-black uppercase tracking-[0.15em] opacity-70">NOC Controller</p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Admin"
              alt="Admin Avatar"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/10 group-hover:ring-primary/40 transition-all"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-surface rounded-full" />
          </div>
          <ChevronDown className="w-4 h-4 text-outline group-hover:text-on-surface transition-colors ml-1" />
        </div>
      </div>
    </header>
  )
}
