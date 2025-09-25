'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { Chrome } from 'lucide-react'

export function UnifiedAuthForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSocial, setIsLoadingSocial] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (isSignUp && password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/onboarding`,
          },
        })
        if (error) throw error
        // Store email for resend functionality
        localStorage.setItem('signupEmail', email)
        // Redirect to confirmation page
        window.location.href = '/auth/sign-up-success'
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        // Redirect to workspace after successful login
        window.location.href = '/workspace/file-manager'
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google') => {
    const supabase = createClient()
    setIsLoadingSocial(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/workspace/file-manager`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsLoadingSocial(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Create a new account to get started' 
              : 'Sign in to your account to continue'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {/* Social Authentication */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              disabled={isLoadingSocial || isLoading}
              onClick={() => handleSocialLogin('google')}
            >
              <Chrome className="mr-2 h-4 w-4" />
              {isLoadingSocial ? 'Connecting...' : 'Continue with Google'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Authentication Form */}
            <form onSubmit={handleEmailAuth}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {isSignUp && (
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password">Confirm Password</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                )}
                {error && (
                  <p className={cn(
                    "text-sm",
                    error === 'Check your email for a confirmation link!' 
                      ? "text-green-600" 
                      : "text-destructive"
                  )}>
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading || isLoadingSocial}>
                  {isLoading 
                    ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                    : (isSignUp ? 'Create Account' : 'Sign In')
                  }
                </Button>
              </div>
            </form>

            {/* Toggle between sign up and sign in */}
            <div className="text-center text-sm">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:text-primary"
                    onClick={() => {
                      setIsSignUp(false)
                      setError(null)
                      setRepeatPassword('')
                    }}
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:text-primary"
                    onClick={() => {
                      setIsSignUp(true)
                      setError(null)
                    }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
