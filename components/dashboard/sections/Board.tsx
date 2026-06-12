'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useDraggable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { FiPlus, FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { TEMPLATES, type TemplateId } from '@/lib/templates'
import {
  type Issue, type IssueStatus, type Comment, type Attachment,
  STATUS_OPTIONS, renderTypeIcon, renderPriorityBadge, renderStatusBadge, statusColors,
} from '@/lib/issues'
import {
  defaultIssues,
  defaultComments,
  defaultAttachments,
} from '@/lib/mock-data'
import AnimatedButton from '@/components/ui/AnimatedButton'
import IssueDetailModal from '@/components/dashboard/backlog-sections/IssueDetailModal'
import CreateIssueModal from '@/components/dashboard/backlog-sections/CreateIssueModal'

/* ── Props ── */

type BoardProps = {
  template?: TemplateId
}

/* ── Draggable Card ── */

type BoardCardProps = {
  issue: Issue
  priorityLabel?: string
  onClick?: () => void
}

function BoardCard({ issue, priorityLabel, onClick }: BoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
    data: { issue, currentStatus: issue.status },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      {...attributes}
      {...listeners}
      style={style}
      onClick={(e) => {
        if (!isDragging && onClick) {
          e.stopPropagation()
          onClick()
        }
      }}
      className={`rounded-xl border bg-theme-panel p-3 shadow-sm transition-shadow ${
        isDragging
          ? 'z-50 opacity-40 shadow-lg'
          : 'cursor-grab border-theme-border/10 hover:border-theme-border/25 hover:shadow-md active:cursor-grabbing'
      }`}
    >
      {/* Top row: type icon + ID + priority */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {renderTypeIcon(issue.typeId)}
          <span className="font-mono text-[10px] text-theme-fg/40">{issue.id}</span>
        </div>
        {renderPriorityBadge(issue.priorityId, priorityLabel)}
      </div>

      {/* Title */}
      <p className="mt-1.5 text-sm font-medium text-theme-fg leading-snug line-clamp-2">
        {issue.title}
      </p>

      {/* Bottom row: assignee only (status shown by column) */}
      <div className="mt-2 flex items-center gap-2">
        <span className="truncate text-[11px] text-theme-fg/45">{issue.assignee}</span>
      </div>
    </motion.div>
  )
}

/* ── Drag Overlay Card ── */

function DragPreviewCard({ issue, priorityLabel }: { issue: Issue; priorityLabel?: string }) {
  return (
    <div className="w-[272px] rounded-xl border border-theme-accent/40 bg-theme-panel p-3 shadow-xl rotate-2 scale-105">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {renderTypeIcon(issue.typeId)}
          <span className="font-mono text-[10px] text-theme-fg/40">{issue.id}</span>
        </div>
        {renderPriorityBadge(issue.priorityId, priorityLabel)}
      </div>
      <p className="mt-1.5 text-sm font-medium text-theme-fg leading-snug line-clamp-2">
        {issue.title}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="truncate text-[11px] text-theme-fg/45">{issue.assignee}</span>
      </div>
    </div>
  )
}

/* ── Droppable Column ── */

type BoardColumnProps = {
  status: IssueStatus
  label: string
  issues: Issue[]
  colorClass: string
  isDragOver: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
  onClickIssue: (issue: Issue) => void
  getPriorityLabel: (id: string) => string | undefined
}

function BoardColumn({
  status,
  label,
  issues,
  colorClass,
  isDragOver,
  isCollapsed,
  onToggleCollapse,
  onClickIssue,
  getPriorityLabel,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${status}`,
    data: { status },
  })

  const draggingOver = isOver || isDragOver

  return (
    <div
      ref={setNodeRef}
      className="flex w-[280px] shrink-0 flex-col rounded-2xl border-2 bg-theme-panel transition-all duration-200 md:w-72"
      style={{
        scrollSnapAlign: 'start',
        borderColor: draggingOver ? 'var(--theme-accent)' : 'var(--theme-border)',
        opacity: draggingOver ? 1 : 0.95,
      }}
    >
      {/* Column header */}
      <div className="flex shrink-0 items-center justify-between border-b border-theme-border/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded p-0.5 text-theme-fg/30 transition hover:text-theme-fg/60"
          >
            {isCollapsed ? <FiChevronRight className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />}
          </button>
          <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-theme-fg/80">
            {label}
          </h3>
          <span className={`inline-flex size-5 items-center justify-center rounded-md border text-[10px] font-semibold ${colorClass}`}>
            {issues.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      {!isCollapsed && (
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {issues.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 text-center transition-colors duration-200"
              style={{
                borderColor: draggingOver ? 'var(--theme-accent)' : 'var(--theme-border)',
                backgroundColor: draggingOver
                  ? `color-mix(in srgb, var(--theme-accent) 8%, transparent)`
                  : 'transparent',
              }}
            >
              <p className="text-xs font-medium" style={{ color: draggingOver ? 'var(--theme-accent)' : 'var(--theme-fg)' }}>
                {draggingOver ? 'Drop here' : 'No issues'}
              </p>
            </div>
          ) : (
            issues.map((issue) => (
              <BoardCard
                key={issue.id}
                issue={issue}
                priorityLabel={getPriorityLabel(issue.priorityId)}
                onClick={() => onClickIssue(issue)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ── Column color derived from status palette ── */

function statusBadgeStyle(status: IssueStatus): string {
  // Pick the border color from the status palette
  switch (status) {
    case 'open':         return 'border-blue-200 bg-blue-50 text-blue-600'
    case 'in-progress':  return 'border-amber-200 bg-amber-50 text-amber-600'
    case 'in-review':    return 'border-purple-200 bg-purple-50 text-purple-600'
    case 'done':         return 'border-emerald-200 bg-emerald-50 text-emerald-600'
    case 'closed':       return 'border-zinc-200 bg-zinc-50 text-zinc-500'
  }
}

/* ── Main Component ── */

export default function Board({ template = 'general' }: BoardProps) {
  const config = TEMPLATES[template]
  const prefix = config.id === 'bug-tracking' ? 'BUG' : config.id === 'kanban' ? 'TASK' : 'TSK'

  /* ── State ── */
  const [issues, setIssues] = useState<Issue[]>(defaultIssues)
  const [comments, setComments] = useState<Comment[]>(defaultComments)
  const [attachments, setAttachments] = useState<Record<string, Attachment[]>>(defaultAttachments)
  const [activeDragIssue, setActiveDragIssue] = useState<Issue | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null)
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set())
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  /* ── Sensors (pointer + touch for mobile) ── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  )

  /* ── Derived columns — one per canonical status, always shown ── */
  const columns = useMemo(() => {
    return STATUS_OPTIONS.map((opt) => ({
      status: opt.key,
      label: opt.label,
      issues: issues.filter((i) => !i.parentId && i.status === opt.key),
      colorClass: statusBadgeStyle(opt.key),
    }))
  }, [issues])

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

  const getPriority = (id: string) => config.priorities.find((p) => p.id === id)

  /* ── DnD handlers ── */

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as string
    const issue = issues.find((i) => i.id === id)
    if (issue) setActiveDragIssue(issue)
  }, [issues])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragIssue(null)
    setDragOverStatus(null)

    if (!over) return

    const issueId = active.id as string
    const droppableId = over.id as string
    const targetStatus = droppableId.startsWith('col-')
      ? droppableId.slice(4) as IssueStatus
      : null

    if (targetStatus) {
      const current = issues.find((i) => i.id === issueId)
      if (current && current.status !== targetStatus) {
        setIssues((prev) =>
          prev.map((i) => (i.id === issueId ? { ...i, status: targetStatus } : i))
        )
      }
    }
  }, [issues])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    setDragOverStatus(
      over && (over.id as string).startsWith('col-')
        ? (over.id as string).slice(4)
        : null
    )
  }, [])

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
      setIssues((prev) => prev.filter((i) => i.id !== id && i.parentId !== id))
    } else {
      setIssues((prev) => prev.filter((i) => i.id !== id))
    }
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

  const toggleColumnCollapse = (colStatus: string) => {
    setCollapsedColumns((prev) => {
      const next = new Set(prev)
      if (next.has(colStatus)) next.delete(colStatus)
      else next.add(colStatus)
      return next
    })
  }

  return (
    <section className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-theme-border/10 px-4 py-4 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold uppercase tracking-[0.12em]">Board</h2>
          <p className="mt-0.5 text-sm text-theme-fg/50">{issues.length} issue{issues.length !== 1 && 's'}</p>
        </div>
        <AnimatedButton
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="h-9 gap-1.5 border! border-black px-3 py-0 text-xs font-semibold normal-case tracking-normal md:px-4"
          textClassName="flex items-center gap-1.5"
        >
          <FiPlus className="h-3.5 w-3.5" />
          Create Issue
        </AnimatedButton>
      </div>

      {/* Board columns — dynamically built from issue statuses */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div
          ref={boardRef}
          className="flex flex-1 gap-4 overflow-x-auto p-4 sm:p-6"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {columns.length === 0 && (
            <div className="flex w-full items-center justify-center">
              <p className="text-sm text-theme-fg/40">No issues to display on the board.</p>
            </div>
          )}

          {columns.map((col) => {
            const isCollapsed = collapsedColumns.has(col.status)

            return (
              <BoardColumn
                key={col.status}
                status={col.status}
                label={col.label}
                issues={col.issues}
                colorClass={col.colorClass}
                isDragOver={dragOverStatus === col.status}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => toggleColumnCollapse(col.status)}
                onClickIssue={(issue) => setSelectedIssue(issue)}
                getPriorityLabel={(id) => getPriority(id)?.label}
              />
            )
          })}
        </div>

        {/* Drag overlay */}
        <DragOverlay dropAnimation={null}>
          {activeDragIssue && (
            <DragPreviewCard
              issue={activeDragIssue}
              priorityLabel={getPriority(activeDragIssue.priorityId)?.label}
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* ── Create modal ── */}
      <CreateIssueModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
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
    </section>
  )
}
