import { NextResponse } from 'next/server'
import { getPRs, getCIRuns } from '@/lib/github'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userToken = session?.provider_token || undefined

  const [prs, runs] = await Promise.all([getPRs(undefined, userToken), getCIRuns(userToken)])

  const openPRs = prs.filter((p) => p.status === 'open').length
  const mergedPRs = prs.filter((p) => p.status === 'merged').length
  const ciFailures = runs.filter((r) => r.status === 'failed').length
  const passedCIs = runs.filter((r) => r.status === 'passed').length
  const ciPassRate = passedCIs + ciFailures > 0
    ? Math.round((passedCIs / (passedCIs + ciFailures)) * 100)
    : 100

  return NextResponse.json({ openPRs, mergedPRs, ciFailures, ciPassRate })
}
