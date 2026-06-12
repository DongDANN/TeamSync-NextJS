'use client'

import { useState, useMemo } from 'react'
import { FiPlus, FiSearch, FiChevronDown, FiX } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { TEMPLATES, type TemplateId } from '@/lib/templates'
import {
  type Issue, type IssueStatus, type Comment, type Attachment,
  type IssueType, type Priority,
  statusColors, priorityColors, renderTypeIcon,
} from '@/lib/issues'
import {
  defaultIssues,
  defaultComments,
  defaultAttachments,
} from '@/lib/mock-data'
import AnimatedButton from '@/components/ui/AnimatedButton'
import AlertModal from '@/components/ui/AlertModal'
import IssueRow from '@/components/dashboard/backlog-sections/IssueRow'
import IssueCard from '@/components/dashboard/backlog-sections/IssueCard'
import CreateIssueModal from '@/components/dashboard/backlog-sections/CreateIssueModal'
import IssueDetailModal from '@/components/dashboard/backlog-sections/IssueDetailModal'

/* ── Props ── */

type BacklogProps = {
  template?: TemplateId
}

/* ── Component ── */

export default function Backlog({ template = 'general' }: BacklogProps) {
  const config = TEMPLATES[template]
  const prefix = config.id === 'bug-tracking' ? 'BUG' : config.id === 'kanban' ? 'TASK' : 'TSK'

  /* ── State ── */
  const [issues, setIssues] = useState<Issue[]>(defaultIssues)
  const [comments, setComments] = useState<Comment[]>(defaultComments)
  const [attachments, setAttachments] = useState<Record<string, Attachment[]>>(defaultAttachments)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)

  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createParentId, setCreateParentId] = useState<string | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; childCount: number } | null>(null)

  /* ── Derived ── */
  const childMap = useMemo(() => {
    const map: Record<string, Issue[]> = {}
    for (const issue of issues) {
      if (issue.parentId) {
        if (!map[issue.parentId]) map[issue.parentId] = []
        map[issue.parentId].push(issue)
      }
    }
    return map
  }, [issues])

  const getIssueType = (id: string): IssueType | undefined =>
    config.issueTypes.find((t) => t.id === id)

  const getPriority = (id: string): Priority | undefined =>
    config.priorities.find((p) => p.id === id)

  /* ── Filtering ── */
  const filtered = issues.filter((issue) => {
    const matchSearch =
      !search ||
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.id.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || issue.typeId === filterType
    const matchPriority = filterPriority === 'all' || issue.priorityId === filterPriority
    return matchSearch && matchType && matchPriority
  })

  /* ── Issue mutations ── */
  const handleCreate = (issue: Issue, newAttachments: Attachment[]) => {
    setIssues((prev) => [issue, ...prev])
    if (newAttachments.length > 0) {
      setAttachments((prev) => ({ ...prev, [issue.id]: newAttachments }))
    }
    setShowCreateModal(false)
  }

  const handleUpdateIssue = (id: string, updates: Partial<Issue>) => {
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)))
  }

  const handleDeleteIssue = (id: string) => {
    const children = childMap[id]
    if (children && children.length > 0) {
      setDeleteConfirm({ id, childCount: children.length })
    } else {
      setIssues((prev) => prev.filter((i) => i.id !== id))
    }
  }

  const handleDeleteWithChildren = () => {
    if (!deleteConfirm) return
    setIssues((prev) => prev.filter((i) => i.id !== deleteConfirm.id && i.parentId !== deleteConfirm.id))
    setDeleteConfirm(null)
  }

  const handleAddComment = (comment: Comment) => {
    setComments((prev) => [comment, ...prev])
  }

  const handleAddAttachments = (issueId: string, files: Attachment[]) => {
    setAttachments((prev) => ({
      ...prev,
      [issueId]: [...(prev[issueId] ?? []), ...files],
    }))
  }

  const handleRemoveAttachment = (issueId: string, attachmentId: string) => {
    setAttachments((prev) => ({
      ...prev,
      [issueId]: (prev[issueId] ?? []).filter((a) => a.id !== attachmentId),
    }))
  }

  const handleNavigateToIssue = (id: string) => {
    const issue = issues.find((i) => i.id === id)
    if (issue) setSelectedIssue(issue)
  }

  /* ── Filters ── */
  const clearFilters = () => { setFilterType('all'); setFilterPriority('all'); setSearch('') }

  /* ── Render ── */

  return (
    <section className="rounded-3xl border border-theme-border/10 bg-theme-panel">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 border-b border-theme-border/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold uppercase tracking-[0.12em]">Backlog</h2>
          <p className="mt-0.5 text-sm text-theme-fg/50">{issues.length} issue{issues.length !== 1 && 's'}</p>
        </div>
        <AnimatedButton
          type="button"
          onClick={() => { setCreateParentId(null); setShowCreateModal(true) }}
          className="h-9 gap-1.5 border! border-black px-3 py-0 text-xs font-semibold normal-case tracking-normal md:px-4"
          textClassName="flex items-center gap-1.5"
        >
          <FiPlus className="h-3.5 w-3.5" />
          Create Issue
        </AnimatedButton>
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-theme-border/10 px-6 py-3">
        <label className="relative flex-1 min-w-[200px] max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-theme-fg/35">
            <FiSearch className="h-3.5 w-3.5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues…"
            className="h-9 w-full rounded-lg border border-theme-border/15 bg-theme-panel pl-9 pr-3 text-sm outline-none transition focus:border-theme-fg"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-theme-fg/35 hover:text-theme-fg">
              <FiX className="h-3.5 w-3.5" />
            </button>
          )}
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowPriorityDropdown(false) }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-theme-border/15 px-3 text-xs font-medium text-theme-fg/70 transition hover:border-theme-border/40"
          >
            {filterType === 'all' ? 'All Types' : getIssueType(filterType)?.label ?? 'Type'}
            <FiChevronDown className="h-3 w-3" />
          </button>
          {showTypeDropdown && (
            <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-theme-border/15 bg-theme-panel p-1 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.25)]">
              <button type="button" onClick={() => { setFilterType('all'); setShowTypeDropdown(false) }}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-medium transition ${filterType === 'all' ? 'bg-black text-white' : 'text-theme-fg hover:bg-theme-fg/5'}`}>
                All Types
              </button>
              {config.issueTypes.map((t) => (
                <button key={t.id} type="button" onClick={() => { setFilterType(t.id); setShowTypeDropdown(false) }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${filterType === t.id ? 'bg-black text-white' : 'text-theme-fg hover:bg-theme-fg/5'}`}>
                  {renderTypeIcon(t.id)} {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowPriorityDropdown(!showPriorityDropdown); setShowTypeDropdown(false) }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-theme-border/15 px-3 text-xs font-medium text-theme-fg/70 transition hover:border-theme-border/40"
          >
            {filterPriority === 'all' ? 'All Priorities' : getPriority(filterPriority)?.label ?? 'Priority'}
            <FiChevronDown className="h-3 w-3" />
          </button>
          {showPriorityDropdown && (
            <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-theme-border/15 bg-theme-panel p-1 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.25)]">
              <button type="button" onClick={() => { setFilterPriority('all'); setShowPriorityDropdown(false) }}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-medium transition ${filterPriority === 'all' ? 'bg-black text-white' : 'text-theme-fg hover:bg-theme-fg/5'}`}>
                All Priorities
              </button>
              {config.priorities.map((p) => (
                <button key={p.id} type="button" onClick={() => { setFilterPriority(p.id); setShowPriorityDropdown(false) }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${filterPriority === p.id ? 'bg-black text-white' : 'text-theme-fg hover:bg-theme-fg/5'}`}>
                  <span className={`h-2 w-2 rounded-full ${priorityColors[p.id]} bg-current`} />
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {(filterType !== 'all' || filterPriority !== 'all' || search) && (
          <button type="button" onClick={clearFilters} className="text-xs text-theme-fg/40 underline transition hover:text-theme-fg">Clear filters</button>
        )}
      </div>

      {/* ── Issue tree: Cards on mobile, table on md+ ── */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 rounded-full border border-theme-border/10 bg-theme-bg p-4">
              <FiSearch className="h-6 w-6 text-theme-fg/30" />
            </div>
            <p className="text-sm font-medium text-theme-fg/60">
              {search || filterType !== 'all' || filterPriority !== 'all'
                ? 'No issues match your filters'
                : 'No issues yet'}
            </p>
            <p className="mt-1 text-xs text-theme-fg/40">
              {search || filterType !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first issue to get started'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="space-y-2 px-4 py-3 md:hidden">
              {filtered
                .filter((i) => !i.parentId)
                .map((root) => (
                  <IssueCard
                    key={root.id}
                    issue={root}
                    childMap={childMap}
                    expandedParents={expandedParents}
                    config={config}
                    onToggleParent={(id) => setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }))}
                    onClickIssue={(issue) => setSelectedIssue(issue)}
                    onDeleteIssue={handleDeleteIssue}
                  />
                ))}
              {filtered
                .filter((i) => i.parentId && !filtered.some((p) => p.id === i.parentId))
                .map((orphan) => (
                  <IssueCard
                    key={orphan.id}
                    issue={orphan}
                    childMap={childMap}
                    expandedParents={expandedParents}
                    config={config}
                    onToggleParent={(id) => setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }))}
                    onClickIssue={(issue) => setSelectedIssue(issue)}
                    onDeleteIssue={handleDeleteIssue}
                  />
                ))}
            </div>

            {/* Desktop table view */}
            <table className="hidden w-full md:table">
              <thead>
                <tr className="border-b border-theme-border/5 text-left text-[10px] font-medium uppercase tracking-[0.1em] text-theme-fg/40">
                  <th className="px-6 py-3 font-medium">ID</th>
                  <th className="px-2 py-3 font-medium">Type</th>
                  <th className="w-full px-2 py-3 font-medium">Title</th>
                  <th className="px-2 py-3 font-medium">Priority</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                  <th className="px-2 py-3 font-medium">Assignee</th>
                  <th className="px-2 py-3 font-medium">Created</th>
                  <th className="px-2 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered
                  .filter((i) => !i.parentId)
                  .map((root) => (
                    <IssueRow
                      key={root.id}
                      issue={root}
                      childMap={childMap}
                      expandedParents={expandedParents}
                      config={config}
                      onToggleParent={(id) => setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }))}
                      onClickIssue={(issue) => setSelectedIssue(issue)}
                      onDeleteIssue={handleDeleteIssue}
                    />
                  ))}
                {filtered
                  .filter((i) => i.parentId && !filtered.some((p) => p.id === i.parentId))
                  .map((orphan) => (
                    <IssueRow
                      key={orphan.id}
                      issue={orphan}
                      childMap={childMap}
                      expandedParents={expandedParents}
                      config={config}
                      onToggleParent={(id) => setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }))}
                      onClickIssue={(issue) => setSelectedIssue(issue)}
                      onDeleteIssue={handleDeleteIssue}
                    />
                  ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-theme-border/10 px-6 py-3 text-[11px] text-theme-fg/40">
        Showing {filtered.length} of {issues.length} issue{issues.length !== 1 && 's'}
      </div>

      {/* ── Create modal ── */}
      <CreateIssueModal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); setCreateParentId(null) }}
        config={config}
        prefix={prefix}
        issues={issues}
        onCreate={handleCreate}
      />

      {/* ── Detail modal ── */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          issues={issues}
          config={config}
          comments={comments}
          attachments={attachments}
          childMap={childMap}
          onUpdateIssue={handleUpdateIssue}
          onDeleteIssue={handleDeleteIssue}
          onAddComment={handleAddComment}
          onAddAttachments={handleAddAttachments}
          onRemoveAttachment={handleRemoveAttachment}
          onNavigateToIssue={handleNavigateToIssue}
          onPreviewImage={setPreviewUrl}
        />
      )}

      {/* ── Image preview lightbox ── */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setPreviewUrl(null)}
          onKeyDown={(e) => e.key === 'Escape' && setPreviewUrl(null)}
          tabIndex={0}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 rounded-lg p-1.5 text-white/60 transition hover:bg-theme-panel/10 hover:text-white"
            >
              <FiX className="h-5 w-5" />
            </button>
            <img src={previewUrl} alt="Preview" className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl" />
          </motion.div>
        </div>
      )}

      {/* ── Delete confirmation alert ── */}
      <AlertModal
        open={!!deleteConfirm}
        title="Delete issue"
        message={
          deleteConfirm
            ? `This issue has ${deleteConfirm.childCount} child issue${deleteConfirm.childCount > 1 ? 's' : ''}. Delete them too?`
            : ''
        }
        confirmLabel="Delete all"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteWithChildren}
        onCancel={() => setDeleteConfirm(null)}
      />
    </section>
  )
}
