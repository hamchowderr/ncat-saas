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
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
