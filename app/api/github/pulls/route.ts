import { NextResponse } from 'next/server'
import { getPRs } from '@/lib/github'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state') || undefined
  const prs = await getPRs(state)
  return NextResponse.json(prs)
}
