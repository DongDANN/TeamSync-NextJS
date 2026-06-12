import { NextResponse } from 'next/server'
import { getCIRuns } from '@/lib/github'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userToken = session?.provider_token || undefined

  const runs = await getCIRuns(userToken)
  return NextResponse.json(runs)
}
