import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Save the GitHub provider token (access token) to the user's profile
      const { data: { session } } = await supabase.auth.getSession()
      const providerToken = session?.provider_token

      if (providerToken && session?.user?.id) {
        const { user } = session
        // Best-effort: save the GitHub token to the profile.
        // Column may not exist yet if migration hasn't run — that's fine.
        try {
          await (supabase.from('profiles') as any)
            .update({ github_token: providerToken, github_owner: user.user_metadata?.user_name ?? null })
            .eq('id', user.id)
        } catch {
          // Migration not run or no profile row yet — silently skip
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
