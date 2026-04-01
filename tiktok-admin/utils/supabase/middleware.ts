import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Middleware version for @supabase/ssr v0.3.0
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Rafraîchissement de la session si nécessaire
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ROUTE PROTECTION LOGIC
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth')

  if (!user && !isLoginPage && !isAuthCallback) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Admin Check (RBAC con Deep Check Fallback)
  if (user && !isLoginPage && !isAuthCallback) {
     const role = user.app_metadata?.role || user.user_metadata?.role
     
     if (role !== 'admin') {
        const { data: adminRole } = await supabase
          .from('admin_roles')
          .select('user_id')
          .eq('user_id', user.id)
          .single()

        if (!adminRole) {
          const url = request.nextUrl.clone()
          url.pathname = '/login'
          url.searchParams.set('error', 'unauthorized')
          return NextResponse.redirect(url)
        }
     }
  }

  return supabaseResponse
}
