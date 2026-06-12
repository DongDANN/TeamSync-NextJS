'use client'

import { Fragment } from 'react'
import { FiChevronDown, FiChevronRight, FiTrash2 } from 'react-icons/fi'
import { type Issue, type IssueStatus, type IssueType, type Priority, renderTypeIcon, renderPriorityBadge, renderStatusBadge } from '@/lib/issues'
import type { TemplateConfig } from '@/lib/templates'

type IssueRowProps = {
  issue: Issue
  depth?: number
  childMap: Record<string, Issue[]>
  expandedParents: Record<string, boolean>
  config: TemplateConfig
  onToggleParent: (id: string) => void
  onClickIssue: (issue: Issue) => void
  onDeleteIssue: (id: string) => void
}

export default function IssueRow({
  issue,
  depth = 0,
  childMap,
  expandedParents,
  config,
  onToggleParent,
  onClickIssue,
  onDeleteIssue,
}: IssueRowProps) {
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
        const pctColor =
          pct === 100 ? 'text-emerald-600 bg-emerald-50 border-emerald-200/50' :
          pct > 0 ? 'text-amber-600 bg-amber-50 border-amber-200/50' :
          'text-zinc-400 bg-zinc-50 border-zinc-200/50'
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pctColor}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {pct}%
          </span>
        )
      })()
    : null

  return (
    <Fragment>
      <tr
        className={`group border-b border-black/5 text-sm transition ${depth > 0 ? 'bg-zinc-100 hover:bg-zinc-200/70' : 'hover:bg-zinc-50/80'}`}
      >
        {/* ID */}
        <td
          className={`py-3 font-mono text-xs ${depth > 0 ? 'text-black/30' : 'text-black/40'}`}
          style={{ paddingLeft: `${24 + depth * 18}px`, paddingRight: '24px' }}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggleParent(issue.id)}
                className="rounded p-0.5 text-black/30 transition hover:bg-black/5 hover:text-black"
              >
                {expanded ? <FiChevronDown className="h-3 w-3" /> : <FiChevronRight className="h-3 w-3" />}
              </button>
            ) : (
              <span className="w-4" />
            )}
            {issue.id}
          </div>
        </td>

        {/* Type */}
        <td
          className="py-3"
          style={{ paddingLeft: `${8 + depth * 18}px`, paddingRight: '8px' }}
          title={getIssueType(issue.typeId)?.label ?? issue.typeId}
        >
          {renderTypeIcon(issue.typeId)}
        </td>

        {/* Title */}
        <td
          className="cursor-pointer px-2 py-3 font-medium text-black transition hover:text-black/60"
          onClick={() => onClickIssue(issue)}
        >
          <div className="flex items-center gap-1.5" style={{ paddingLeft: depth > 0 ? `${depth * 20}px` : undefined }}>
            {depth > 0 && (
              <span className="text-[10px] font-mono text-black/20 select-none shrink-0 leading-[1]">
                ├
              </span>
            )}
            <span className="truncate">{issue.title}</span>
            {completionBadge}
          </div>
        </td>

        {/* Priority */}
        <td className="px-2 py-3">
          {renderPriorityBadge(issue.priorityId, getPriority(issue.priorityId)?.label)}
        </td>

        {/* Status */}
        <td className="px-2 py-3">{renderStatusBadge(issue.status)}</td>

        {/* Assignee */}
        <td className="px-2 py-3 text-xs text-black/60">{issue.assignee}</td>

        {/* Created */}
        <td className="px-2 py-3 font-mono text-[11px] text-black/40">{issue.createdAt}</td>

        {/* Delete */}
        <td className="px-2 py-3 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onDeleteIssue(issue.id)}
            className="rounded p-1 text-black/30 transition hover:bg-red-50 hover:text-red-600"
            title="Delete issue"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        </td>
      </tr>

      {/* Recursive children */}
      {showChildren && children.map((child) => (
        <IssueRow
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
    </Fragment>
  )
}
