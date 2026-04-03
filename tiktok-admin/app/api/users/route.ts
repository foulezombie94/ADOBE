import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET - Admin User Management (DEBUG MODE)
 * On utilise select('*') pour identifier si une colonne spécifique manquait.
 */
export async function GET() {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // LOG CRITIQUE DANS LE TERMINAL
      console.error("DEBUG SUPABASE (GET):", error);
      return NextResponse.json({ 
        error: error.message,
        details: error.hint,
        code: error.code 
      }, { status: 400 });
    }

    return NextResponse.json({ users }, { status: 200 })
  } catch (err: any) {
    console.error("CRASH SERVEUR (GET):", err);
    return NextResponse.json({ error: "Erreur Serveur Interne" }, { status: 500 });
  }
}

/**
 * PATCH - Update User Status & Moderation
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId, status, ban_reason, banDuration: reqBanDuration, isHardwareBan } = await req.json()

    if (!userId || !status) {
      return NextResponse.json({ error: 'Missing userId or status' }, { status: 400 })
    }

    // 0. GESTION DU BANNISSEMENT MATÉRIEL (HARDCORE)
    if (status === 'banned' && isHardwareBan) {
      try {
        // Récupérer les identifiants de l'utilisateur actuel
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('last_ip, hardware_id')
          .eq('id', userId)
          .single()

        if (userData?.last_ip || userData?.hardware_id) {
          await supabaseAdmin.from('banned_hardware').upsert({
            ip: userData.last_ip || null,
            hardware_id: userData.hardware_id || null,
            original_user_id: userId,
            reason: ban_reason || 'Bannissement réseau/matériel'
          }, { onConflict: 'ip' })
          
          console.log(`🛡️ SÉCURITÉ : IP ${userData.last_ip} et HW ${userData.hardware_id} bannis.`);
        }
      } catch (hwErr) {
        console.error("ERREUR BAN MATÉRIEL:", hwErr);
      }
    } else if (status === 'active') {
      // DÉBAN MATÉRIEL : Supprimer l'entrée pour autoriser à nouveau l'appareil/IP
      try {
        const { error: delError } = await supabaseAdmin
          .from('banned_hardware')
          .delete()
          .eq('original_user_id', userId);
        
        if (!delError) {
          console.log(`✅ SÉCURITÉ : Bannissement matériel supprimé pour l'utilisateur ${userId}`);
        }
      } catch (delCatch) {
        console.error("ERREUR SUPPRESSION BAN MATÉRIEL:", delCatch);
      }
    }

    // 1. Calcul de la date de fin de bannissement
    let bannedUntil = null;
    if (status === 'banned') {
      const now = new Date();
      if (reqBanDuration === '24h') now.setHours(now.getHours() + 24);
      else if (reqBanDuration === '168h') now.setHours(now.getHours() + 168);
      else if (reqBanDuration === '720h') now.setHours(now.getHours() + 720);
      else now.setFullYear(now.getFullYear() + 100); // Définitif
      bannedUntil = now.toISOString();
    }

    // 2. Mise à jour de la table publique
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ 
        status: status,
        ban_reason: ban_reason || null,
        banned_until: bannedUntil 
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error("DEBUG SUPABASE (PATCH):", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 3. Synchronisation avec la couche AUTHENTIFICATION (Supabase Auth Admin)
    try {
      const banDuration = status === 'active' ? 'none' : (reqBanDuration || '876000h');
      
      // On met à jour les app_metadata pour que les JWT Claims soient corrects AU PROCHAIN REFRESH
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { 
          ban_duration: banDuration,
          app_metadata: { 
            status: status,
            ban_reason: status === 'active' ? null : (ban_reason || 'N/A')
          }
        }
      );

      if (authError) {
        console.error("ERREUR SYNC AUTH:", authError);
      }
    } catch (authCatch) {
      console.error("CRASH SYNC AUTH:", authCatch);
    }

    // 3. Log d'audit enrichi
    await supabaseAdmin.from('audit_log').insert({
      action: `ADMIN_MOD_${status.toUpperCase()}_SYNC`,
      resource_type: 'user',
      resource_id: userId,
      metadata: { status, ban_reason, ban_duration: reqBanDuration || 'N/A', auth_sync: true }
    })

    return NextResponse.json({ success: true, user: data }, { status: 200 })
  } catch (err: any) {
    console.error("CRASH SERVEUR (PATCH):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
