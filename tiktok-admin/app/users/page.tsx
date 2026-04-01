'use client'

import React from 'react'
import UserModerationTable from '@/components/Dashboard/UserModerationTable'
import { Users, ShieldAlert, Fingerprint } from 'lucide-react'

export default function UsersModerationPage() {
  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Users className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">NOC | Security Hub</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-on-surface mb-2 font-manrope">Gestion des Utilisateurs</h2>
          <p className="text-outline text-sm font-medium max-w-2xl leading-relaxed">
            Surveillez les comptes, gérez les sanctions (Bans/Shadowbans) et identifiez les récidives via le <span className="text-primary font-bold">Fingerprinting Matériel</span>.
          </p>
        </div>
        
        {/* Quick Stats Summary */}
        <div className="flex gap-4">
           <div className="bg-surface-variant p-4 rounded-2xl border border-outline/10 flex items-center gap-4">
              <div className="p-2 bg-error/10 text-error rounded-xl">
                 <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-outline opacity-60">Signalements</p>
                <p className="text-lg font-black font-manrope">Actif</p>
              </div>
           </div>
        </div>
      </div>

      {/* Main Moderation Table */}
      <UserModerationTable />

      {/* Admin Policy Reminder */}
      <div className="mt-10 p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-5 items-start">
         <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
         <div>
           <h4 className="text-sm font-black text-amber-500 font-manrope uppercase tracking-wider mb-2">Protocole de Modération (Phase 2)</h4>
           <ul className="text-xs text-outline space-y-2 list-disc pl-5">
             <li>Toute action de bannissement est <strong>irréversible</strong> sans validation de niveau 'Super Admin'.</li>
             <li>Le Shadowban rend l&apos;utilisateur invisible pour l&apos;ensemble de la communauté (FYP/Profil) mais lui permet de continuer d&apos;utiliser l&apos;application sans se douter de sa sanction.</li>
             <li>Le Fingerprint Matériel (Hardware ID) est utilisé pour identifier les utilisateurs tentant de contourner les sanctions par changement d&apos;IP.</li>
           </ul>
         </div>
      </div>
    </div>
  )
}
