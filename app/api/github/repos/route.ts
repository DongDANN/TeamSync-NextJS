import { NextResponse } from 'next/server'
import { getUserRepos } from '@/lib/github'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userToken = session?.provider_token

  if (!userToken) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 401 })
  }

  try {
    const repos = await getUserRepos(userToken)
    return NextResponse.json(repos)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch repos' }, { status: 500 })
  }
}
