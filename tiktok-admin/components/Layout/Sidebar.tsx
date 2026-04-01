'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  LayoutDashboard,
  Activity,
  Users,
  Settings,
  Terminal,
  ShieldAlert,
  Server,
  LogOut,
  Zap,
  ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const navigation = [
  { name: 'Console Admin', href: '/', icon: LayoutDashboard },
  { name: 'Santé Système', href: '/health', icon: Activity },
  { name: 'Utilisateurs', href: '/users', icon: Users },
  { name: 'Logs Système', href: '/logs', icon: Terminal },
  { name: 'Sécurité', href: '/security', icon: ShieldAlert },
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    const toastId = toast.loading('Déconnexion...')
    await supabase.auth.signOut()
    toast.success('Déconnecté avec succès.', { id: toastId })
    router.push('/login')
    router.refresh()
  }

  // Ne pas afficher la Sidebar sur la page de login
  if (pathname === '/login') return null

  return (
    <aside className="hidden lg:flex flex-col w-72 h-full bg-surface border-r border-outline/10 bg-opacity-80 backdrop-blur-xl p-6 overflow-hidden">
      <div className="mb-10 px-4 flex items-center gap-3 group">
         <div className="p-2 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
           <Zap className="w-5 h-5 fill-primary" />
         </div>
         <div>
          <h1 className="text-xl font-black text-on-surface font-manrope tracking-tight leading-none">NOC Admin</h1>
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1 opacity-60">Digital Curator</p>
         </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-manrope font-semibold text-sm",
                isActive
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-outline hover:text-on-surface hover:bg-surface-variant"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-outline group-hover:text-on-surface")} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-4">
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-outline hover:text-error hover:bg-error/10 transition-all font-manrope font-black text-[10px] uppercase tracking-[0.2em]"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion Sécurisée
        </button>

        <div className="bg-primary-container p-5 rounded-[28px] text-white relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Réseau Opérationnel</p>
          </div>
          
          <button className="w-full py-3 bg-white text-primary text-[9px] font-black rounded-xl shadow-xl hover:bg-on-primary transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Vérifier Sécurité
          </button>
        </div>
      </div>
    </aside>
  )
}
