'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FiGitBranch, FiGitPullRequest, FiCheckCircle, FiXCircle, FiClock,
  FiChevronDown, FiChevronRight, FiMessageSquare, FiGitMerge,
  FiRefreshCw, FiUser, FiCalendar, FiFileText, FiSidebar,
  FiChevronLeft, FiGithub,
} from 'react-icons/fi'
import type { TemplateId } from '@/lib/templates'
import type { PR, CIRun, GitHubStats, RepoEntry, FileContent, GitHubRepo } from '@/lib/github'
import FileTree from '../code-sections/FileTree'
import CodeEditor from '../code-sections/CodeEditor'
import { createClient } from '@/lib/supabase/client'

/* ── Props ── */

type CodeProps = {
  template?: TemplateId
}

/* ── Helpers ── */

const prStatusIcon: Record<PR['status'], React.ReactNode> = {
  open: <FiGitPullRequest className="h-4 w-4 text-green-600" />,
  merged: <FiGitMerge className="h-4 w-4 text-purple-600" />,
  closed: <FiXCircle className="h-4 w-4 text-red-500" />,
}

const reviewBadge: Record<PR['reviewStatus'], { label: string; class: string }> = {
  'approved': { label: 'Approved', class: 'bg-emerald-50 text-emerald-700 border-emerald-200/50' },
  'changes-requested': { label: 'Changes', class: 'bg-red-50 text-red-700 border-red-200/50' },
  'pending': { label: 'Pending', class: 'bg-amber-50 text-amber-700 border-amber-200/50' },
  'draft': { label: 'Draft', class: 'bg-zinc-50 text-zinc-500 border-zinc-200/50' },
}

const ciIcon: Record<CIRun['status'], { icon: React.ReactNode; class: string }> = {
  passed: { icon: <FiCheckCircle className="h-4 w-4" />, class: 'text-emerald-600' },
  failed: { icon: <FiXCircle className="h-4 w-4" />, class: 'text-red-600' },
  running: { icon: <FiRefreshCw className="h-4 w-4 animate-spin" />, class: 'text-blue-600' },
  pending: { icon: <FiClock className="h-4 w-4" />, class: 'text-zinc-400' },
}

type CodeTab = 'prs' | 'ci' | 'editor'

const TABS: { id: CodeTab; label: string; icon: React.ReactNode }[] = [
  { id: 'prs', label: 'Pull Requests', icon: <FiGitPullRequest className="h-4 w-4" /> },
  { id: 'ci', label: 'CI Pipeline', icon: <FiRefreshCw className="h-4 w-4" /> },
  { id: 'editor', label: 'Editor', icon: <FiFileText className="h-4 w-4" /> },
]

/* ── Component ── */

export default function Code({ template }: CodeProps) {
  const [activeTab, setActiveTab] = useState<CodeTab>('prs')
  const [prFilter, setPrFilter] = useState<'all' | 'open' | 'merged'>('open')
  const [expandedPR, setExpandedPR] = useState<string | null>(null)

  // Data
  const [prs, setPrs] = useState<PR[]>([])
  const [runs, setRuns] = useState<CIRun[]>([])
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(true)

  // File browser
  const [treeEntries, setTreeEntries] = useState<RepoEntry[]>([])
  const [currentFile, setCurrentFile] = useState<FileContent | null>(null)
  const [treeOpen, setTreeOpen] = useState(true)
  const [fileLoading, setFileLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Repo selector
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<{ owner: string; repo: string } | null>(null)
  const [githubConnected, setGithubConnected] = useState<boolean | null>(null) // null = checking
  const [repoMenuOpen, setRepoMenuOpen] = useState(false)

  // Load PRs & CI data
  useEffect(() => {
    async function load() {
      try {
        const [prsRes, runsRes, statsRes] = await Promise.all([
          fetch('/api/github/pulls'),
          fetch('/api/github/runs'),
          fetch('/api/github/stats'),
        ])
        const [prsData, runsData, statsData] = await Promise.all([
          prsRes.json(),
          runsRes.json(),
          statsRes.json(),
        ])
        setPrs(prsData)
        setRuns(runsData)
        setStats(statsData)
      } catch {
        // Data failed to load — show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Load repos when Editor tab activates
  useEffect(() => {
    if (activeTab !== 'editor') return

    fetch('/api/github/repos')
      .then((res) => {
        if (res.status === 401) {
          setGithubConnected(false)
          return []
        }
        if (!res.ok) {
          setGithubConnected(false)
          return []
        }
        setGithubConnected(true)
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data)
          if (data.length > 0 && !selectedRepo) {
            setSelectedRepo({ owner: data[0].owner, repo: data[0].name })
          }
        }
      })
      .catch(() => setGithubConnected(false))
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load file tree when repo changes
  useEffect(() => {
    if (activeTab !== 'editor' || !selectedRepo) return
    const params = new URLSearchParams({ owner: selectedRepo.owner, repo: selectedRepo.repo })
    fetch(`/api/github/tree?${params}`)
      .then((res) => res.json())
      .then(setTreeEntries)
      .catch(() => {})
  }, [activeTab, selectedRepo]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = useCallback(async (entry: RepoEntry) => {
    if (entry.type !== 'file') return
    setFileLoading(true)
    try {
      const params = new URLSearchParams({ path: entry.path })
      if (selectedRepo) {
        params.set('owner', selectedRepo.owner)
        params.set('repo', selectedRepo.repo)
      }
      const res = await fetch(`/api/github/content?${params}`)
      const data: FileContent = await res.json()
      setCurrentFile(data)
    } catch {
      // Error loading file
    } finally {
      setFileLoading(false)
    }
  }, [selectedRepo])

  const handleSave = useCallback(async (path: string, content: string) => {
    setSaving(true)
    try {
      await fetch('/api/github/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          content,
          message: `Update ${path}`,
          owner: selectedRepo?.owner,
          repo: selectedRepo?.repo,
        }),
      })
    } catch {
      // Error saving
    } finally {
      setSaving(false)
    }
  }, [selectedRepo])

  const handleConnectGitHub = () => {
    const supabase = createClient()
    supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${location.origin}/auth/callback?next=/dashboard` },
    })
  }

  const filteredPRs = useMemo(
    () => prs.filter((p) => prFilter === 'all' || p.status === prFilter),
    [prs, prFilter]
  )

  const handleTabChange = (tab: CodeTab) => {
    setActiveTab(tab)
    if (tab !== 'editor') {
      setCurrentFile(null)
    }
  }

  /* ── Render ── */

  if (loading) {
    return (
      <section className="flex h-full items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <FiRefreshCw className="h-6 w-6 animate-spin text-theme-fg/30" />
          <p className="text-sm text-theme-fg/40">Loading code data…</p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-5">
      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 rounded-2xl border border-theme-border/10 bg-theme-panel p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition ${
              activeTab === tab.id
                ? 'bg-black text-white shadow-sm'
                : 'text-theme-fg/50 hover:text-theme-fg'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Stats row (PRs and CI tabs only) ── */}
      {activeTab !== 'editor' && stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Open PRs', value: stats.openPRs, icon: FiGitPullRequest, color: 'text-green-600 bg-green-50 border-green-200/50' },
            { label: 'Merged', value: stats.mergedPRs, icon: FiGitMerge, color: 'text-purple-600 bg-purple-50 border-purple-200/50' },
            { label: 'CI Failures', value: stats.ciFailures, icon: FiXCircle, color: 'text-red-600 bg-red-50 border-red-200/50' },
            { label: 'CI Pass Rate', value: `${stats.ciPassRate}%`, icon: FiCheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200/50' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-2xl border border-theme-border/10 bg-theme-panel p-4"
            >
              <span className={`grid size-10 shrink-0 place-content-center rounded-xl border ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-theme-fg/45">{stat.label}</p>
                <p className="text-lg font-bold text-theme-fg">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PRs Tab ── */}
      {activeTab === 'prs' && (
        <div className="rounded-2xl border border-theme-border/10 bg-theme-panel">
          <div className="flex items-center justify-between border-b border-theme-border/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <FiGitPullRequest className="h-5 w-5 text-theme-fg/60" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.1em]">Pull Requests</h3>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-theme-border/10 bg-theme-bg p-0.5">
              {(['open', 'merged', 'all'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setPrFilter(f)}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] transition ${
                    prFilter === f
                      ? 'bg-black text-white'
                      : 'text-theme-fg/50 hover:text-theme-fg'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-theme-border/5">
            {filteredPRs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiGitPullRequest className="h-8 w-8 text-theme-fg/20" />
                <p className="mt-2 text-sm font-medium text-theme-fg/40">No PRs match this filter</p>
              </div>
            ) : (
              filteredPRs.map((pr) => (
                <div key={pr.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedPR(expandedPR === pr.id ? null : pr.id)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-theme-fg/[0.02]"
                  >
                    <span className="shrink-0">{prStatusIcon[pr.status]}</span>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="truncate text-sm font-medium text-theme-fg">{pr.title}</span>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${reviewBadge[pr.reviewStatus].class}`}>
                        {reviewBadge[pr.reviewStatus].label}
                      </span>
                    </div>
                    <span className="hidden shrink-0 text-[11px] text-theme-fg/40 sm:block">
                      {pr.branch}
                    </span>
                    <div className="flex shrink-0 items-center gap-2 text-theme-fg/35">
                      <FiMessageSquare className="h-3 w-3" />
                      <span className="text-[11px]">{pr.comments}</span>
                    </div>
                    <span className="hidden shrink-0 text-[11px] text-theme-fg/35 md:block">{pr.author}</span>
                    {expandedPR === pr.id ? (
                      <FiChevronDown className="h-4 w-4 shrink-0 text-theme-fg/30" />
                    ) : (
                      <FiChevronRight className="h-4 w-4 shrink-0 text-theme-fg/30" />
                    )}
                  </button>

                  {expandedPR === pr.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-theme-border/5 bg-theme-bg px-5 py-4"
                    >
                      <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                        <div>
                          <span className="text-theme-fg/40">Author</span>
                          <p className="mt-0.5 font-medium text-theme-fg flex items-center gap-1.5">
                            <FiUser className="h-3 w-3 text-theme-fg/40" />
                            {pr.author}
                          </p>
                        </div>
                        <div>
                          <span className="text-theme-fg/40">Branch</span>
                          <p className="mt-0.5 font-medium text-theme-fg flex items-center gap-1.5">
                            <FiGitBranch className="h-3 w-3 text-theme-fg/40" />
                            {pr.branch}
                          </p>
                        </div>
                        <div>
                          <span className="text-theme-fg/40">Target</span>
                          <p className="mt-0.5 font-medium text-theme-fg">{pr.targetBranch}</p>
                        </div>
                        <div>
                          <span className="text-theme-fg/40">Created</span>
                          <p className="mt-0.5 font-medium text-theme-fg flex items-center gap-1.5">
                            <FiCalendar className="h-3 w-3 text-theme-fg/40" />
                            {pr.createdAt}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── CI Tab ── */}
      {activeTab === 'ci' && (
        <div className="rounded-2xl border border-theme-border/10 bg-theme-panel">
          <div className="flex items-center gap-3 border-b border-theme-border/10 px-5 py-4">
            <FiRefreshCw className="h-5 w-5 text-theme-fg/60" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em]">CI Pipeline</h3>
          </div>

          <div className="divide-y divide-theme-border/5">
            {runs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiRefreshCw className="h-8 w-8 text-theme-fg/20" />
                <p className="mt-2 text-sm font-medium text-theme-fg/40">No CI runs found</p>
              </div>
            ) : (
              runs.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <span className={ciIcon[run.status].class}>
                    {ciIcon[run.status].icon}
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="text-sm font-medium text-theme-fg">{run.pipeline}</span>
                    <span className="text-[11px] text-theme-fg/40 font-mono">{run.commit}</span>
                  </div>
                  <span className="hidden shrink-0 text-[11px] text-theme-fg/45 md:block">{run.branch}</span>
                  <span className="shrink-0 text-[11px] text-theme-fg/40">{run.duration}</span>
                  <span className="hidden shrink-0 text-[11px] text-theme-fg/40 sm:block">{run.createdAt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Editor Tab ── */}
      {activeTab === 'editor' && (
        <>
          {githubConnected === false ? (
            /* ── GitHub not connected — show prompt ── */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-theme-border/10 bg-theme-panel py-16">
              <div className="mb-4 grid size-16 place-content-center rounded-2xl border border-theme-border/10 bg-theme-bg">
                <FiGithub className="h-7 w-7 text-theme-fg/30" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-theme-fg">Connect GitHub</h3>
              <p className="mb-5 max-w-xs text-center text-xs text-theme-fg/45">
                Connect your GitHub account to browse repos, view files, and edit code directly from TeamSync.
              </p>
              <button
                type="button"
                onClick={handleConnectGitHub}
                className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-85"
              >
                <FiGithub className="h-4 w-4" />
                Continue with GitHub
              </button>
            </div>
          ) : (
            /* ── Editor UI ── */
            <div className="flex h-[65vh] min-h-[400px] gap-3">
              {/* File tree panel */}
              <motion.div
                layout
                className={`rounded-2xl border border-theme-border/10 bg-theme-panel overflow-hidden flex flex-col ${
                  treeOpen ? 'w-56 shrink-0' : 'w-0'
                }`}
              >
                {/* Repo selector */}
                {repos.length > 0 && selectedRepo && (
                  <div className="relative border-b border-theme-border/10">
                    <button
                      type="button"
                      onClick={() => setRepoMenuOpen(!repoMenuOpen)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-theme-fg transition-colors hover:bg-theme-fg/5"
                    >
                      <FiGithub className="h-3.5 w-3.5 shrink-0 text-theme-fg/40" />
                      <span className="truncate">{selectedRepo.repo}</span>
                      <FiChevronDown className={`ml-auto h-3 w-3 shrink-0 text-theme-fg/30 transition-transform ${repoMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {repoMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute left-0 right-0 top-full z-20 max-h-48 overflow-y-auto border-b border-theme-border/10 bg-theme-panel shadow-lg"
                      >
                        {repos.map((r) => (
                          <button
                            key={r.full_name}
                            type="button"
                            onClick={() => {
                              setSelectedRepo({ owner: r.owner, repo: r.name })
                              setRepoMenuOpen(false)
                              setCurrentFile(null)
                            }}
                            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                              r.name === selectedRepo.repo
                                ? 'bg-black text-white'
                                : 'text-theme-fg/70 hover:bg-theme-fg/5'
                            }`}
                          >
                            <FiGitBranch className="h-3 w-3 shrink-0" />
                            <span className="truncate">{r.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}

                {treeOpen && (
                  <div className="flex-1 overflow-hidden">
                    <FileTree
                      entries={treeEntries}
                      currentPath={currentFile?.path ?? null}
                      onFileSelect={handleFileSelect}
                      onClose={() => setTreeOpen(false)}
                    />
                  </div>
                )}
              </motion.div>

              {/* Editor panel */}
              <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-theme-border/10 bg-theme-panel">
                <div className="flex items-center gap-2 border-b border-theme-border/10 px-3 py-2 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setTreeOpen(!treeOpen)}
                    className="rounded-md p-1.5 text-theme-fg/40 hover:bg-theme-fg/5 hover:text-theme-fg"
                  >
                    {treeOpen ? <FiChevronLeft className="h-4 w-4" /> : <FiSidebar className="h-4 w-4" />}
                  </button>
                  {currentFile && (
                    <span className="truncate text-xs font-medium text-theme-fg">
                      {currentFile.path}
                    </span>
                  )}
                </div>

                {fileLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <FiRefreshCw className="h-5 w-5 animate-spin text-theme-fg/30" />
                  </div>
                ) : (
                  <CodeEditor
                    file={currentFile}
                    onSave={handleSave}
                    onClose={() => setCurrentFile(null)}
                    saving={saving}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
