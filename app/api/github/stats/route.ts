import { NextResponse } from 'next/server'
import { getPRs, getCIRuns } from '@/lib/github'

export async function GET() {
  const [prs, runs] = await Promise.all([getPRs(), getCIRuns()])

  const openPRs = prs.filter((p) => p.status === 'open').length
  const mergedPRs = prs.filter((p) => p.status === 'merged').length
  const ciFailures = runs.filter((r) => r.status === 'failed').length
  const passedCIs = runs.filter((r) => r.status === 'passed').length
  const ciPassRate = passedCIs + ciFailures > 0
    ? Math.round((passedCIs / (passedCIs + ciFailures)) * 100)
    : 100

  return NextResponse.json({ openPRs, mergedPRs, ciFailures, ciPassRate })
}
