import { NextResponse } from 'next/server'
import { getRepoTree } from '@/lib/github'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner') || undefined
  const repo = searchParams.get('repo') || undefined

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userToken = session?.provider_token || undefined

  try {
    const tree = await getRepoTree(userToken, owner, repo)
    return NextResponse.json(tree)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch repo tree' }, { status: 500 })
  }
}
