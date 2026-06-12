import { NextResponse } from 'next/server'
import { commitFile } from '@/lib/github'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { path, content, message, owner, repo } = await request.json()

    if (!path || content === undefined || !message) {
      return NextResponse.json({ error: 'Missing required fields: path, content, message' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userToken = session?.provider_token || undefined

    const result = await commitFile(path, content, message, userToken, owner, repo)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to commit file' }, { status: 500 })
  }
}
