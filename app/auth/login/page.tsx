'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AnimatedButton from '@/components/ui/AnimatedButton'
import FallingGridBackground from '@/components/layout/FallingGridBackground'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="relative flex min-h-screen items-center overflow-x-hidden bg-zinc-100">
      <FallingGridBackground />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-300 -translate-x-1/2 sm:block" />
      <div className="relative mx-auto w-full max-w-200 px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-black/15 bg-white/88 p-10 backdrop-blur-[1.5px]">
          <Link href="/" className="no-underline">
            <h1 className="text-3xl font-bold">TeamSync</h1>
          </Link>
          <br />
          <p>Sign in to your account</p>
          <p className="text-sm text-gray">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-gray-500">
              Sign up here
            </Link>
            .
          </p>

          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <AnimatedButton
              className="h-11 w-full py-0 normal-case"
              type="button"
              onClick={() => handleOAuth('github')}
            >
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.7.5.8 5.4.8 11.7c0 5 3.2 9.2 7.6 10.7.6.1.8-.3.8-.6v-2.4c-3.1.7-3.8-1.3-3.8-1.3-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.8 2.1 3.3 1.5.1-.7.4-1.2.7-1.5-2.4-.3-5-1.2-5-5.4 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-3 0 0 .9-.3 3 .1.9-.2 1.8-.3 2.7-.3.9 0 1.8.1 2.7.3 2.1-.4 3-.1 3-.1.6 1.6.2 2.7.1 3 .7.8 1.1 1.8 1.1 3 0 4.2-2.6 5.1-5 5.4.4.3.8 1 .8 2.1v3.1c0 .3.2.7.8.6 4.4-1.5 7.6-5.7 7.6-10.7C23.2 5.4 18.3.5 12 .5z" />
                </svg>
                <span>Continue with GitHub</span>
              </span>
            </AnimatedButton>
            <AnimatedButton
              className="h-11 w-full py-0 normal-case"
              type="button"
              onClick={() => handleOAuth('google')}
            >
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21.8 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.5c-.2 1.2-.9 2.2-1.9 2.9v2.4h3c1.8-1.7 2.8-4.1 2.8-7z" />
                  <path d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3-2.4c-.8.5-1.9.9-3.6.9-2.7 0-4.9-1.8-5.7-4.3H3.1v2.5C4.8 19.7 8.1 22 12 22z" />
                  <path d="M6.3 13.8c-.2-.5-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.7H3.1C2.4 9 2 10.4 2 12s.4 3 1.1 4.3l3.2-2.5z" />
                  <path d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9C16.9 2.8 14.7 2 12 2 8.1 2 4.8 4.3 3.1 7.7l3.2 2.5C7.1 7.7 9.3 5.9 12 5.9z" />
                </svg>
                <span>Continue with Google</span>
              </span>
            </AnimatedButton>
          </div>

          <hr className="my-6 border-t border-gray-300" />

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="mt-2" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full min-h-9 rounded-md border border-black p-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-gray-500">
                  Forgot?
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full min-h-9 rounded-md border border-black p-2 pr-10 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-black/60 transition hover:text-black"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c5.2 0 9.3 4.4 10 7-.2.9-.9 2.3-2 3.7" />
                      <path d="M6.2 6.2C3.9 7.8 2.4 10.1 2 12c.7 2.6 4.8 7 10 7 1.3 0 2.5-.3 3.6-.8" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <br />
            <AnimatedButton
              className="mx-auto h-11 w-full py-0 text-sm font-bold tracking-wider"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </AnimatedButton>
          </form>
        </div>
      </div>
    </div>
  )
}
