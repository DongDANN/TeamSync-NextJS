'use client'

import { Fragment } from 'react'
import { FiChevronDown, FiChevronRight, FiTrash2 } from 'react-icons/fi'
import { type Issue, type IssueType, type Priority, renderTypeIcon, renderPriorityBadge, renderStatusBadge } from '@/lib/issues'
import type { TemplateConfig } from '@/lib/templates'

type IssueCardProps = {
  issue: Issue
  depth?: number
  childMap: Record<string, Issue[]>
  expandedParents: Record<string, boolean>
  config: TemplateConfig
  onToggleParent: (id: string) => void
  onClickIssue: (issue: Issue) => void
  onDeleteIssue: (id: string) => void
}

export default function IssueCard({
  issue,
  depth = 0,
  childMap,
  expandedParents,
  config,
  onToggleParent,
  onClickIssue,
  onDeleteIssue,
}: IssueCardProps) {
  const children = childMap[issue.id] ?? []
  const hasChildren = children.length > 0 && issue.typeId !== 'subtask'
  const expanded = expandedParents[issue.id] === undefined ? false : expandedParents[issue.id]
  const showChildren = hasChildren && expanded

  const getIssueType = (id: string): IssueType | undefined =>
    config.issueTypes.find((t) => t.id === id)

  const getPriority = (id: string): Priority | undefined =>
    config.priorities.find((p) => p.id === id)

  /* ── Completion percentage for parent rows ── */
  const completionBadge = hasChildren
    ? (() => {
        const done = children.filter((c) => c.status === 'done' || c.status === 'closed').length
        const pct = Math.round((done / children.length) * 100)
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            pct === 100 ? 'text-emerald-600 bg-emerald-50 border border-emerald-200/50' :
            pct > 0   ? 'text-amber-600 bg-amber-50 border border-amber-200/50' :
                        'text-zinc-400 bg-zinc-50 border border-zinc-200/50'
          }`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {pct}%
          </span>
        )
      })()
    : null

  return (
    <Fragment>
      <div
        className={`rounded-xl border border-theme-border/10 bg-theme-panel ${
          depth > 0 ? 'ml-4 border-l-2 border-l-theme-border/20' : ''
        }`}
      >
        {/* Top row: type + priority + ID */}
        <div className="flex items-center justify-between gap-2 px-3 pt-3">
          <div className="flex items-center gap-1.5">
            {renderTypeIcon(issue.typeId)}
            <span className="text-[11px] text-theme-fg/50 font-medium">
              {getIssueType(issue.typeId)?.label ?? issue.typeId}
            </span>
            <span className="mx-0.5 text-theme-fg/20">·</span>
            {renderPriorityBadge(issue.priorityId, getPriority(issue.priorityId)?.label)}
          </div>
          <div className="flex items-center gap-1.5">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggleParent(issue.id)}
                className="rounded p-0.5 text-theme-fg/30 transition hover:bg-theme-fg/5 hover:text-theme-fg"
              >
                {expanded ? <FiChevronDown className="h-3 w-3" /> : <FiChevronRight className="h-3 w-3" />}
              </button>
            ) : null}
            <span className="font-mono text-[10px] text-theme-fg/40">{issue.id}</span>
          </div>
        </div>

        {/* Title — tappable */}
        <button
          type="button"
          onClick={() => onClickIssue(issue)}
          className="w-full px-3 pt-1.5 text-left"
        >
          <span className="text-sm font-medium text-theme-fg leading-snug line-clamp-2">
            {issue.title}
          </span>
        </button>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-theme-fg/40">
            {renderStatusBadge(issue.status)}
            {issue.status !== 'open' && issue.status !== 'closed' && (
              <>
                <span className="text-theme-fg/15">·</span>
                <span>{issue.assignee}</span>
              </>
            )}
            <span className="text-theme-fg/15">·</span>
            <span className="font-mono">{issue.createdAt}</span>
          </div>
          <button
            type="button"
            onClick={() => onDeleteIssue(issue.id)}
            className="rounded p-1 text-theme-fg/30 transition hover:bg-red-50 hover:text-red-600"
            title="Delete issue"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Completion badge for parents */}
        {completionBadge && (
          <div className="border-t border-theme-border/5 px-3 py-1.5">
            {completionBadge}
          </div>
        )}
      </div>

      {/* Recursive children */}
      {showChildren && (
        <div className="space-y-2 pt-1">
          {children.map((child) => (
            <IssueCard
              key={child.id}
              issue={child}
              depth={depth + 1}
              childMap={childMap}
              expandedParents={expandedParents}
              config={config}
              onToggleParent={onToggleParent}
              onClickIssue={onClickIssue}
              onDeleteIssue={onDeleteIssue}
            />
          ))}
        </div>
      )}
    </Fragment>
  )
}
