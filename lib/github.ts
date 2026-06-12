/* ──────────────────────────────────────────────
   GitHub API types & configuration
   Ready for a real token. Mock data included
   for development until you set GITHUB_TOKEN.
   ────────────────────────────────────────────── */

/* ── Config ── */

export const githubConfig = {
  owner: process.env.GITHUB_OWNER || 'pewdiepie-archdaemon',
  repo: process.env.GITHUB_REPO || 'odysseus',
  token: process.env.GITHUB_TOKEN || '',
}

export const hasGitHubToken = () => !!githubConfig.token

/* ── Types ── */

export type PRStatus = 'open' | 'merged' | 'closed'

export type ReviewStatus = 'approved' | 'changes-requested' | 'pending' | 'draft'

export type PR = {
  id: string
  title: string
  author: string
  branch: string
  targetBranch: string
  status: PRStatus
  reviewStatus: ReviewStatus
  comments: number
  createdAt: string
  updatedAt: string
}

export type CIStatus = 'passed' | 'failed' | 'running' | 'pending'

export type CIRun = {
  id: string
  pipeline: string
  branch: string
  status: CIStatus
  commit: string
  duration: string
  createdAt: string
  author: string
}

export type GitHubStats = {
  openPRs: number
  mergedPRs: number
  ciFailures: number
  ciPassRate: number
}

/* ── Mock data (used when no token is configured) ── */

export const mockPRs: PR[] = [
  { id: 'PR-42', title: 'Add team dashboard summary widgets', author: 'Alex', branch: 'feat/dashboard-widgets', targetBranch: 'main', status: 'open', reviewStatus: 'approved', comments: 5, createdAt: '2026-06-10', updatedAt: '2026-06-13' },
  { id: 'PR-41', title: 'Fix notification badge alignment on Safari', author: 'Jordan', branch: 'fix/notif-safari', targetBranch: 'main', status: 'open', reviewStatus: 'changes-requested', comments: 8, createdAt: '2026-06-09', updatedAt: '2026-06-12' },
  { id: 'PR-40', title: 'Refactor auth middleware', author: 'Taylor', branch: 'refactor/auth-middleware', targetBranch: 'main', status: 'open', reviewStatus: 'pending', comments: 2, createdAt: '2026-06-11', updatedAt: '2026-06-11' },
  { id: 'PR-39', title: 'Update API rate limit config', author: 'Alex', branch: 'chore/rate-limits', targetBranch: 'main', status: 'merged', reviewStatus: 'approved', comments: 3, createdAt: '2026-06-08', updatedAt: '2026-06-10' },
  { id: 'PR-38', title: 'Add dark mode color tokens', author: 'Jordan', branch: 'feat/dark-mode-tokens', targetBranch: 'main', status: 'merged', reviewStatus: 'approved', comments: 6, createdAt: '2026-06-05', updatedAt: '2026-06-09' },
  { id: 'PR-37', title: 'WIP: Real-time collaboration', author: 'Taylor', branch: 'feat/realtime-collab', targetBranch: 'main', status: 'open', reviewStatus: 'draft', comments: 1, createdAt: '2026-06-07', updatedAt: '2026-06-07' },
  { id: 'PR-36', title: 'Deprecated API cleanup', author: 'Mia', branch: 'chore/deprecate-apis', targetBranch: 'main', status: 'closed', reviewStatus: 'pending', comments: 0, createdAt: '2026-06-03', updatedAt: '2026-06-04' },
]

export const mockCIRuns: CIRun[] = [
  { id: 'CI-128', pipeline: 'Build & Test', branch: 'feat/dashboard-widgets', status: 'passed', commit: '8a3f2b1', duration: '4m 32s', createdAt: '2026-06-13', author: 'Alex' },
  { id: 'CI-127', pipeline: 'Build & Test', branch: 'fix/notif-safari', status: 'failed', commit: 'b7e91d4', duration: '3m 18s', createdAt: '2026-06-12', author: 'Jordan' },
  { id: 'CI-126', pipeline: 'Build & Test', branch: 'main', status: 'passed', commit: 'a1b2c3d', duration: '5m 01s', createdAt: '2026-06-12', author: 'Alex' },
  { id: 'CI-125', pipeline: 'Lint & Format', branch: 'feat/dashboard-widgets', status: 'passed', commit: '8a3f2b1', duration: '1m 12s', createdAt: '2026-06-13', author: 'Alex' },
  { id: 'CI-124', pipeline: 'Lint & Format', branch: 'fix/notif-safari', status: 'running', commit: 'b7e91d4', duration: '—', createdAt: '2026-06-13', author: 'Jordan' },
  { id: 'CI-123', pipeline: 'Deploy Staging', branch: 'main', status: 'passed', commit: 'a1b2c3d', duration: '2m 45s', createdAt: '2026-06-12', author: 'Deploy Bot' },
]

/* ── Real GitHub fetchers (ready when a token is set) ── */

export async function fetchGitHubPRs(state?: string): Promise<PR[]> {
  const { owner, repo, token } = githubConfig
  const params = state && state !== 'all' ? `?state=${state}` : ''
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls${params}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const data = await res.json()
  // Map GitHub API response to our PR type
  return data.map((pr: any) => ({
    id: `PR-${pr.number}`,
    title: pr.title,
    author: pr.user?.login || 'unknown',
    branch: pr.head?.ref || '',
    targetBranch: pr.base?.ref || '',
    status: pr.merged ? 'merged' : pr.state === 'closed' ? 'closed' : 'open',
    reviewStatus: (pr.draft ? 'draft' : 'pending') as ReviewStatus,
    comments: pr.comments || 0,
    createdAt: pr.created_at?.slice(0, 10) || '',
    updatedAt: pr.updated_at?.slice(0, 10) || '',
  }))
}

export async function fetchGitHubCIRuns(): Promise<CIRun[]> {
  const { owner, repo, token } = githubConfig
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=10`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const data = await res.json()
  return (data.workflow_runs || []).map((run: any) => ({
    id: `CI-${run.run_number}`,
    pipeline: run.name || run.workflow_id?.toString() || 'Unknown',
    branch: run.head_branch || '',
    status: run.conclusion === 'success' ? 'passed' : run.conclusion === 'failure' ? 'failed' : run.status === 'in_progress' ? 'running' : 'pending' as CIStatus,
    commit: run.head_sha?.slice(0, 7) || '',
    duration: run.updated_at && run.run_started_at
      ? `${Math.round((new Date(run.updated_at).getTime() - new Date(run.run_started_at).getTime()) / 1000 / 60)}m`
      : '—',
    createdAt: run.created_at?.slice(0, 10) || '',
    author: run.actor?.login || 'unknown',
  }))
}

/* ── Composite fetcher: tries real API, falls back to mock ── */

export async function getPRs(state?: string): Promise<PR[]> {
  if (!hasGitHubToken()) return mockPRs
  try { return await fetchGitHubPRs(state) }
  catch { return mockPRs }
}

export async function getCIRuns(): Promise<CIRun[]> {
  if (!hasGitHubToken()) return mockCIRuns
  try { return await fetchGitHubCIRuns() }
  catch { return mockCIRuns }
}
