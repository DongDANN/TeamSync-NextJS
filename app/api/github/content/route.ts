import { NextResponse } from 'next/server'
import { getFileContent } from '@/lib/github'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  const owner = searchParams.get('owner') || undefined
  const repo = searchParams.get('repo') || undefined

  if (!path) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userToken = session?.provider_token || undefined

  try {
    const file = await getFileContent(path, userToken, owner, repo)
    return NextResponse.json(file)
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
