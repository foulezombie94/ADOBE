'use client'

import React, { useState, useEffect } from 'react'
import {
  MoreVertical,
  ShieldAlert,
  Ban,
  UserX,
  Fingerprint,
  Ghost,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  TrendingUp,
  Globe,
  Loader2,
  Activity,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  username: string
  email: string
  created_at: string
  last_ip: string | null
  hardware_id: string | null
  avatar_url: string | null
  status: 'active' | 'banned' | 'shadowbanned' | 'flagged'
  role: 'user' | 'creator' | 'admin'
  ban_reason: string | null
}

export default function UserModerationTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modifying, setModifying] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState('876000h')

  // 1. Fetch Real Users from Supabase via Admin API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users')
        if (!res.ok) throw new Error('Échec de la récupération')
        const data = await res.json()
        setUsers(data.users || [])
      } catch (err) {
        console.error("[USER_MOD_ERROR]", err)
        toast.error("Échec du chargement des utilisateurs")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // 2. Action: Update User Status (Ban, Shadowban, etc.)
  const handleUpdateStatus = async (userId: string, status: User['status'], isHardwareBan: boolean = false) => {
    setModifying(true)
    const toastId = toast.loading('Mise à jour du statut...')
    
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          status, 
          ban_reason: status !== 'active' ? banReason : null,
          banDuration: status === 'banned' ? banDuration : 'none',
          isHardwareBan
        })
      })

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status, ban_reason: banReason } : u))
        setSelectedUser(null)
        setBanReason('')
        setBanDuration('876000h') // Reset duration
        toast.success(`Statut mis à jour : ${status}${isHardwareBan ? ' (IP & Matériel)' : ''}`, { id: toastId })
      } else {
        throw new Error('Erreur API')
      }
    } catch (err) {
      console.error("[STATUS_UPDATE_ERROR]", err)
      toast.error("L'action a échoué. Vérifiez votre connexion.", { id: toastId })
    } finally {
      setModifying(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.last_ip && u.last_ip.includes(searchTerm)) ||
    (u.hardware_id && u.hardware_id.includes(searchTerm))
  )

  return (
    <div className="surface-container rounded-2xl shadow-xl overflow-hidden border border-outline/10 mb-10 min-h-[400px]">
      {/* Table Header */}
      <div className="p-8 border-b border-outline/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-xl font-black font-manrope text-on-surface">Gestion des Utilisateurs</h4>
          <p className="text-xs text-outline font-medium uppercase tracking-wider mt-1">{users.length} comptes enregistrés</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
             <input 
               type="text" 
               placeholder="Rechercher..."
               className="w-full h-10 pl-10 pr-4 bg-background border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/40 transition-all font-body text-on-surface"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <button className="p-2.5 bg-surface-variant border border-outline/10 rounded-xl hover:bg-background transition-all">
            <Filter className="w-4 h-4 text-on-surface" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm flex items-center justify-center z-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        <table className="w-full text-left">
          <thead className="bg-surface-variant/50 text-[10px] uppercase font-black tracking-widest text-outline">
            <tr>
              <th className="px-8 py-5">Utilisateur</th>
              <th className="px-8 py-5">Identifiants (Fingerprint)</th>
              <th className="px-8 py-5">Rôle</th>
              <th className="px-8 py-5">Statut</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5 text-sm">
            {filteredUsers.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-outline">
                   Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-surface-variant/30 transition-colors group">
                <td className="px-8 py-5">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/10 border border-outline/10">
                       <img src={user.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} alt="" className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <p className="font-bold text-on-surface font-manrope underline underline-offset-2 decoration-transparent group-hover:decoration-primary transition-all">{user.username}</p>
                       <p className="text-[10px] text-outline font-medium truncate max-w-[100px]">{user.id}</p>
                     </div>
                   </div>
                </td>
                <td className="px-8 py-5">
                   <div className="space-y-1">
                     <p className="text-xs font-mono text-outline flex items-center gap-2">
                       <Activity className="w-3 h-3 text-secondary" /> {user.last_ip || 'N/A'}
                     </p>
                     <p className="text-[10px] font-mono text-primary/60 flex items-center gap-2">
                       <Fingerprint className="w-3 h-3" /> {user.hardware_id || 'FINGERPRINT_PENDING'}
                     </p>
                     {user.ban_reason && (
                       <p className="text-[9px] text-error font-bold flex items-center gap-1.5 mt-1 animate-pulse">
                         <AlertTriangle className="w-2.5 h-2.5" /> Motif: {user.ban_reason}
                       </p>
                     )}
                   </div>
                </td>
                <td className="px-8 py-5">
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                    user.role === 'admin' ? "bg-rose-500/10 text-rose-500" :
                    user.role === 'creator' ? "bg-indigo-500/10 text-indigo-500" :
                    "bg-outline/10 text-outline"
                  )}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-5">
                   <StatusBadge status={user.status} />
                </td>
                <td className="px-8 py-5 text-right">
                   <button 
                     onClick={() => setSelectedUser(user)}
                     className="p-2 hover:bg-primary/10 rounded-xl group-hover:text-primary transition-all active:scale-95 border border-transparent hover:border-primary/20"
                   >
                     <ShieldAlert className="w-5 h-5" />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODERATION MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !modifying && setSelectedUser(null)} />
           <div className="relative bg-surface p-8 rounded-3xl w-full max-w-md border border-outline/20 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex items-center gap-4 mb-6">
                <div className={cn("p-3 rounded-2xl", modifying ? "bg-primary/10 text-primary animate-pulse" : "bg-error/10 text-error")}>
                  {modifying ? <Loader2 className="w-6 h-6 animate-spin" /> : <Ban className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-2xl font-black font-manrope text-on-surface"> Sanctions : {selectedUser.username}</h3>
                  <p className="text-xs text-outline font-medium">L&apos;action sera enregistrée dans les logs d&apos;audit.</p>
                </div>
             </div>

             {/* Ban Reason Input */}
             <div className="mb-6 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Motif de la sanction (Optionnel)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-outline" />
                  <textarea 
                    placeholder="Pourquoi punissez-vous cet utilisateur ?"
                    className="w-full bg-background border-outline/10 rounded-xl p-3 pl-10 text-sm min-h-[80px] focus:ring-2 focus:ring-error/20 transition-all text-on-surface"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                  />
                </div>
             </div>

             {/* DURÉE DE BANNISSEMENT */}
             <div className="mb-6 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Durée du bannissement</label>
                <div className="grid grid-cols-2 gap-2">
                   {[
                     { label: '24 Heures', val: '24h' },
                     { label: '7 Jours', val: '168h' },
                     { label: '30 Jours', val: '720h' },
                     { label: 'Définitif', val: '876000h' }
                   ].map((d) => (
                      <button
                        key={d.val}
                        onClick={() => setBanDuration(d.val)}
                        className={cn(
                          "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                          banDuration === d.val 
                            ? "bg-primary/20 border-primary text-primary" 
                            : "bg-surface-variant border-outline/10 text-outline hover:border-outline/30"
                        )}
                      >
                        {d.label}
                      </button>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-1 gap-3">
               <ModAction 
                 icon={CheckCircle2} 
                 label="Activer / Débloquer" 
                 desc="Rétablir l'accès complet" 
                 onClick={() => handleUpdateStatus(selectedUser.id, 'active')}
                 disabled={modifying}
               />
               <ModAction 
                 icon={Ban} 
                 label="Bannissement Total" 
                 desc={`Appliquer une interdiction de ${banDuration === '876000h' ? '100 ans' : banDuration}`} 
                 variant="error"
                 onClick={() => handleUpdateStatus(selectedUser.id, 'banned')}
                 disabled={modifying}
               />
               <ModAction 
                 icon={Ghost} 
                 label="Shadowban" 
                 desc="Invisible pour la communauté" 
                 variant="warning"
                 onClick={() => handleUpdateStatus(selectedUser.id, 'shadowbanned')}
                 disabled={modifying}
               />
               <div className="h-px bg-outline/10 my-2" />
               <p className="text-[10px] text-error font-black uppercase text-center opacity-50 px-4">Sécurité Réseau</p>
               <ModAction 
                 icon={Globe} 
                 label="Bannir l'IP & Hardware" 
                 desc={`ID Matériel: ${selectedUser.hardware_id || 'Inconnu'}`} 
                 variant="error"
                 onClick={() => handleUpdateStatus(selectedUser.id, 'banned', true)}
                 disabled={modifying} 
               />
             </div>

             <button 
               onClick={() => setSelectedUser(null)}
               disabled={modifying}
               className="w-full mt-6 py-3 text-xs font-bold text-outline hover:text-on-surface transition-colors disabled:opacity-50"
             >
               Annuler la procédure
             </button>
           </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: User['status'] }) {
  const configs = {
    active: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Actif' },
    banned: { icon: UserX, color: 'text-error', bg: 'bg-error/10', label: 'Banni' },
    shadowbanned: { icon: Ghost, color: 'text-zinc-500', bg: 'bg-zinc-500/10', label: 'Shadow' },
    flagged: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Suspect' },
  }
  const config = configs[status] || configs['active']
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black", config.bg, config.color)}>
      <config.icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

function ModAction({ icon: Icon, label, desc, onClick, variant = 'default', disabled = false }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-4 p-4 border rounded-2xl transition-all text-left group",
        variant === 'error' ? "border-error/10 hover:bg-error/10 hover:border-error/30" : 
        variant === 'warning' ? "border-amber-500/10 hover:bg-amber-500/10 hover:border-amber-500/30" : 
        "border-outline/10 hover:bg-primary/5 hover:border-primary/30",
        disabled && "opacity-50 cursor-not-allowed grayscale"
      )}
    >
      <div className={cn(
        "p-2 rounded-xl bg-opacity-10",
        variant === 'error' ? "bg-error text-error" : 
        variant === 'warning' ? "bg-amber-500 text-amber-500" : 
        "bg-primary text-primary"
      )}>
        <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
      </div>
      <div>
        <p className={cn("text-sm font-black font-manrope transition-colors", 
          variant === 'error' ? "text-error" : 
          variant === 'warning' ? "text-amber-500" : 
          "text-on-surface text-opacity-80 group-hover:text-opacity-100"
        )}>{label}</p>
        <p className="text-[10px] text-outline font-medium tracking-tight">{desc}</p>
      </div>
    </button>
  )
}
