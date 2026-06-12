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

export const hasGitHubToken = (userToken?: string) => !!(userToken || githubConfig.token)

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

export type GitHubRepo = {
  name: string
  full_name: string
  owner: string
  private: boolean
  description: string | null
  default_branch: string
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

export const mockRepos: GitHubRepo[] = [
  { name: 'odysseus', full_name: 'pewdiepie-archdaemon/odysseus', owner: 'pewdiepie-archdaemon', private: false, description: 'A modern team collaboration platform', default_branch: 'main' },
  { name: 'team-api', full_name: 'pewdiepie-archdaemon/team-api', owner: 'pewdiepie-archdaemon', private: true, description: 'Backend API for TeamSync', default_branch: 'main' },
  { name: 'landing-page', full_name: 'pewdiepie-archdaemon/landing-page', owner: 'pewdiepie-archdaemon', private: false, description: 'Marketing site', default_branch: 'main' },
]

/* ── Real GitHub fetchers ── */

export async function fetchGitHubPRs(state?: string, userToken?: string): Promise<PR[]> {
  const token = userToken || githubConfig.token
  const { owner, repo } = githubConfig
  const params = state && state !== 'all' ? `?state=${state}` : ''
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls${params}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const data = await res.json()
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

export async function fetchGitHubCIRuns(userToken?: string): Promise<CIRun[]> {
  const token = userToken || githubConfig.token
  const { owner, repo } = githubConfig
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

/* ── Composite fetchers: try real API, fall back to mock ── */

export async function getPRs(state?: string, userToken?: string): Promise<PR[]> {
  if (!hasGitHubToken(userToken)) return mockPRs
  try { return await fetchGitHubPRs(state, userToken) }
  catch { return mockPRs }
}

export async function getCIRuns(userToken?: string): Promise<CIRun[]> {
  if (!hasGitHubToken(userToken)) return mockCIRuns
  try { return await fetchGitHubCIRuns(userToken) }
  catch { return mockCIRuns }
}

/* ── User Repos ── */

export async function fetchGitHubUserRepos(userToken: string): Promise<GitHubRepo[]> {
  const res = await fetch(
    'https://api.github.com/user/repos?per_page=50&sort=updated',
    { headers: { Authorization: `Bearer ${userToken}` } }
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const data = await res.json()
  return data.map((r: any) => ({
    name: r.name,
    full_name: r.full_name,
    owner: r.owner?.login || 'unknown',
    private: r.private,
    description: r.description,
    default_branch: r.default_branch,
  }))
}

export async function getUserRepos(userToken: string): Promise<GitHubRepo[]> {
  try { return await fetchGitHubUserRepos(userToken) }
  catch { return mockRepos }
}

/* ── File Browser Types & Mock Data ── */

export type FileType = 'file' | 'dir'

export type RepoEntry = {
  name: string
  path: string
  type: FileType
  size?: number
}

export type FileContent = {
  path: string
  content: string
  language: string
}

export const mockRepoTree: RepoEntry[] = [
  { name: 'src', path: 'src', type: 'dir' },
  { name: 'public', path: 'public', type: 'dir' },
  { name: 'tests', path: 'tests', type: 'dir' },
  { name: 'README.md', path: 'README.md', type: 'file', size: 284 },
  { name: 'package.json', path: 'package.json', type: 'file', size: 512 },
  { name: 'tsconfig.json', path: 'tsconfig.json', type: 'file', size: 386 },
  { name: '.gitignore', path: '.gitignore', type: 'file', size: 128 },
  { name: 'next.config.ts', path: 'next.config.ts', type: 'file', size: 187 },
  { name: 'index.html', path: 'public/index.html', type: 'file', size: 412 },
  { name: 'favicon.ico', path: 'public/favicon.ico', type: 'file', size: 0 },
  { name: 'logo.svg', path: 'public/logo.svg', type: 'file', size: 1024 },
  { name: 'main.ts', path: 'src/main.ts', type: 'file', size: 156 },
  { name: 'App.tsx', path: 'src/App.tsx', type: 'file', size: 890 },
  { name: 'components', path: 'src/components', type: 'dir' },
  { name: 'lib', path: 'src/lib', type: 'dir' },
  { name: 'styles', path: 'src/styles', type: 'dir' },
  { name: 'Header.tsx', path: 'src/components/Header.tsx', type: 'file', size: 1204 },
  { name: 'Footer.tsx', path: 'src/components/Footer.tsx', type: 'file', size: 756 },
  { name: 'utils.ts', path: 'src/lib/utils.ts', type: 'file', size: 445 },
  { name: 'globals.css', path: 'src/styles/globals.css', type: 'file', size: 1890 },
  { name: 'main.test.ts', path: 'tests/main.test.ts', type: 'file', size: 623 },
]

const mockFileContents: Record<string, string> = {
  'README.md': `# Odysseus

A modern full-stack application built with Next.js and Supabase.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Deployment

Deployed via Vercel with automatic CI/CD.
`,
  'package.json': JSON.stringify({
    name: 'odysseus',
    version: '1.0.0',
    scripts: { dev: 'next dev', build: 'next build', start: 'next start', test: 'vitest' },
    dependencies: { next: '^15.0.0', react: '^19.0.0', '@supabase/ssr': '^0.5.0' },
  }, null, 2),
  'tsconfig.json': JSON.stringify({
    compilerOptions: { target: 'ES2017', lib: ['dom', 'dom.iterable', 'esnext'], module: 'esnext', jsx: 'react-jsx', strict: true, paths: { '@/*': ['./*'] } },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, null, 2),
  '.gitignore': `node_modules
.next
.env.local
*.tsbuildinfo
next-env.d.ts`,
  'next.config.ts': `import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
}

export default nextConfig
`,
  'public/index.html': `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Odysseus</title></head>
<body><div id="root"></div><script src="/src/main.ts"></script></body>
</html>`,
  'public/logo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 39">
  <path d="M16.5 2h21.08L22.08 24.97H1L16.5 2Z" fill="currentColor"/>
  <path d="M17.42 27.1 11.42 36h22.08L49 13.03H32.7l-9.5 14.07h-5.78Z" fill="currentColor"/>
</svg>`,
  'src/main.ts': `import { createApp } from './App'

const root = document.getElementById('root')
if (root) {
  const app = createApp()
  root.appendChild(app)
}
`,
  'src/App.tsx': `import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { fetchData } from './lib/utils'
import './styles/globals.css'

export function createApp() {
  const container = document.createElement('div')
  container.className = 'app'
  container.appendChild(Header({ title: 'Odysseus' }))

  const main = document.createElement('main')
  main.textContent = 'Hello, Odysseus!'
  container.appendChild(main)
  container.appendChild(Footer())

  return container
}
`,
  'src/components/Header.tsx': `export function Header({ title }: { title: string }) {
  const header = document.createElement('header')
  header.className = 'header'

  const h1 = document.createElement('h1')
  h1.textContent = title
  header.appendChild(h1)

  const nav = document.createElement('nav')
  const links = ['Home', 'About', 'Contact']
  links.forEach(text => {
    const a = document.createElement('a')
    a.textContent = text
    a.href = '#'
    nav.appendChild(a)
  })
  header.appendChild(nav)

  return header
}
`,
  'src/components/Footer.tsx': `export function Footer() {
  const footer = document.createElement('footer')
  footer.className = 'footer'

  const p = document.createElement('p')
  p.textContent = \`© \${new Date().getFullYear()} Odysseus. All rights reserved.\`
  footer.appendChild(p)

  return footer
}
`,
  'src/lib/utils.ts': `export function fetchData(url: string): Promise<unknown> {
  return fetch(url).then(res => {
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
    return res.json()
  })
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
`,
  'src/styles/globals.css': `*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-primary: #4f46e5;
  --color-bg: #fafafa;
  --color-fg: #171717;
  font-family: 'Inter', system-ui, sans-serif;
}

body {
  background: var(--color-bg);
  color: var(--color-fg);
  line-height: 1.6;
}

.app {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.header nav {
  display: flex;
  gap: 1.5rem;
}

.header a {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
}

main {
  flex: 1;
  padding: 2rem;
}

.footer {
  text-align: center;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
}
`,
  'tests/main.test.ts': `import { describe, it, expect } from 'vitest'
import { debounce } from '../src/lib/utils'

describe('debounce', () => {
  it('should delay execution', async () => {
    let count = 0
    const fn = debounce(() => { count++ }, 100)
    fn()
    fn()
    fn()
    expect(count).toBe(0)
    await new Promise(r => setTimeout(r, 150))
    expect(count).toBe(1)
  })
})
`,
}

export async function fetchGitHubTree(
  userToken?: string,
  owner?: string,
  repo?: string
): Promise<RepoEntry[]> {
  const token = userToken || githubConfig.token
  const o = owner || githubConfig.owner
  const r = repo || githubConfig.repo
  const res = await fetch(
    `https://api.github.com/repos/${o}/${r}/git/trees/main?recursive=1`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const data = await res.json()
  return (data.tree || []).filter((e: any) => e.type === 'blob' || e.type === 'tree').map((e: any) => ({
    name: e.path.split('/').pop(),
    path: e.path,
    type: e.type === 'tree' ? 'dir' : 'file',
    size: e.size,
  }))
}

export async function fetchGitHubFileContent(
  path: string,
  userToken?: string,
  owner?: string,
  repo?: string
): Promise<FileContent> {
  const token = userToken || githubConfig.token
  const o = owner || githubConfig.owner
  const r = repo || githubConfig.repo
  const res = await fetch(
    `https://api.github.com/repos/${o}/${r}/contents/${path}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const data = await res.json()
  const content = data.content ? atob(data.content.replace(/\n/g, '')) : ''
  return { path, content, language: detectLanguage(path) }
}

function detectLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    json: 'json', css: 'css', html: 'html', md: 'markdown',
    svg: 'xml', xml: 'xml', yml: 'yaml', yaml: 'yaml',
  }
  return map[ext] || 'plain'
}

export async function getRepoTree(
  userToken?: string,
  owner?: string,
  repo?: string
): Promise<RepoEntry[]> {
  if (!hasGitHubToken(userToken)) return mockRepoTree
  try { return await fetchGitHubTree(userToken, owner, repo) }
  catch { return mockRepoTree }
}

export async function getFileContent(
  path: string,
  userToken?: string,
  owner?: string,
  repo?: string
): Promise<FileContent> {
  if (!hasGitHubToken(userToken)) {
    const content = mockFileContents[path]
    if (content) return { path, content, language: detectLanguage(path) }
    throw new Error(`File not found: ${path}`)
  }
  try { return await fetchGitHubFileContent(path, userToken, owner, repo) }
  catch { throw new Error(`File not found: ${path}`) }
}

export async function commitFile(
  path: string,
  content: string,
  message: string,
  userToken?: string,
  owner?: string,
  repo?: string
): Promise<{ success: boolean; sha?: string }> {
  if (!hasGitHubToken(userToken)) {
    mockFileContents[path] = content
    return { success: true, sha: 'mock-sha-123' }
  }
  const token = userToken || githubConfig.token
  const o = owner || githubConfig.owner
  const r = repo || githubConfig.repo

  const getRes = await fetch(
    `https://api.github.com/repos/${o}/${r}/contents/${path}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const sha = getRes.ok ? (await getRes.json()).sha : undefined

  const res = await fetch(
    `https://api.github.com/repos/${o}/${r}/contents/${path}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, content: btoa(content), sha, branch: 'main' }),
    }
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const data = await res.json()
  return { success: true, sha: data.content?.sha }
}
