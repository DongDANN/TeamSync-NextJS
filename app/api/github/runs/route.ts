import { NextResponse } from 'next/server'
import { getCIRuns } from '@/lib/github'

export async function GET() {
  const runs = await getCIRuns()
  return NextResponse.json(runs)
}
