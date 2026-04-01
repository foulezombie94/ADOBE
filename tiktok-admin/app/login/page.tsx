'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const error = searchParams.get('error')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        toast.error(loginError.message)
      } else {
        toast.success('Accès autorisé ! Bienvenue, Admin.')
        // Utilisation d'un Hard Redirect pour s'assurer que le middleware voit les nouveaux cookies
        window.location.href = '/'
      }
    } catch (err) {
      toast.error('Une erreur technique est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-manrope">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-[450px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-surface-variant/40 rounded-3xl border border-outline/10 mb-6 group transition-all hover:border-primary/40">
             <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
               <Zap className="w-8 h-8 fill-primary" />
             </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface mb-2 font-manrope">NOC : TikTok Admin</h1>
          <p className="text-outline text-sm font-medium tracking-wide">COCKPIT DE SURVEILLANCE & MODÉRATION</p>
        </div>

        {/* Login Form Container */}
        <div className="bg-surface/40 backdrop-blur-2xl p-10 rounded-[40px] border border-outline/10 shadow-2xl relative">
          
          {error === 'unauthorized' && (
             <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl flex items-center gap-3 text-error animate-in slide-in-from-top-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-black uppercase tracking-wider">Accès Refusé : Droits Admin Manquants</p>
             </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline ml-1">Terminal ID (Email)</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  autoFocus
                  required
                  placeholder="admin@tiktok-cockpit.com"
                  className="w-full h-14 pl-12 pr-4 bg-background/50 border border-outline/10 rounded-2xl text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary/20 transition-all text-on-surface font-medium outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline ml-1">Clé d&apos;Accès (Password)</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-secondary transition-colors" />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-4 bg-background/50 border border-outline/10 rounded-2xl text-sm focus:ring-2 focus:ring-secondary/40 focus:border-secondary/20 transition-all text-on-surface font-medium outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-16 bg-primary text-on-primary font-black rounded-2xl shadow-xl shadow-primary/10 flex items-center justify-center gap-3 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 uppercase tracking-widest text-xs",
                loading && "bg-surface-variant text-outline"
              )}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Authentification NOC
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-10 pt-8 border-t border-outline/5 text-center">
             <p className="text-[10px] text-outline font-black uppercase tracking-widest leading-loose">
               Usage Interne Exclusivement<br />
               Toutes les sessions sont loggées (Audit SOC)
             </p>
          </div>
        </div>

        {/* Floating Helper Link */}
        <div className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-outline/40">
           Digital Curator Engine v1.4.0
        </div>
      </div>
    </div>
  )
}
