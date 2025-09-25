import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Validate redirect URL to prevent open redirect attacks
  const validateRedirectUrl = (url: string, baseOrigin: string): boolean => {
    try {
      // Handle relative paths
      if (url.startsWith('/') && !url.startsWith('//')) {
        return true
      }

      // Parse as absolute URL and check origin
      const parsed = new URL(url, baseOrigin)
      return parsed.origin === baseOrigin
    } catch {
      return false
    }
  }

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/workspace/file-manager'
  if (!validateRedirectUrl(next, origin)) {
    // if redirect URL is not safe, use the default
    next = '/workspace/file-manager'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user needs onboarding
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if this is the user's first sign in after email confirmation
        const isNewUser = user.email_confirmed_at &&
                          new Date(user.email_confirmed_at).getTime() === new Date(user.created_at).getTime()

        // Also check workspace name for existing users
        const { data: workspace } = await supabase
          .from('workspaces')
          .select('name')
          .eq('id', user.id)
          .single()

        // If workspace name ends with 's Workspace', it's still the default name from handle_new_user
        const isDefaultName = workspace?.name?.endsWith('\'s Workspace') || workspace?.name?.endsWith('-workspace')

        // Route to onboarding if new user OR default workspace name
        if ((isNewUser || isDefaultName) && next === '/workspace/file-manager') {
          next = '/auth/onboarding'
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

      if (isLocalEnv) {
        // Local development
        return NextResponse.redirect(`${origin}${next}`)
      } else if (siteUrl) {
        // Use configured site URL for production
        return NextResponse.redirect(`${siteUrl}${next}`)
      } else if (forwardedHost) {
        // Fallback to forwarded host
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        // Final fallback to origin
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
