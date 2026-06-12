import { FiAlertCircle, FiCheckCircle, FiCircle, FiTarget, FiLayers, FiEdit3, FiPaperclip } from 'react-icons/fi'
import type { IssueType, Priority } from '@/lib/templates'

export type { IssueType, Priority }

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

export type IssueStatus = 'open' | 'in-progress' | 'in-review' | 'done' | 'closed'

export type Issue = {
  id: string
  title: string
  typeId: string
  priorityId: string
  status: IssueStatus
  assignee: string
  description: string
  createdAt: string
  parentId: string | null
}

export type Comment = {
  id: string
  issueId: string
  author: string
  body: string
  parentId: string | null
  createdAt: string
}

export type Attachment = {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  url: string
  uploadedAt: string
  uploadedBy: string
}

/* ──────────────────────────────────────────────
   Status helpers
   ────────────────────────────────────────────── */

export const STATUS_OPTIONS: { key: IssueStatus; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'in-review', label: 'In Review' },
  { key: 'done', label: 'Done' },
  { key: 'closed', label: 'Closed' },
]

export const statusColors: Record<IssueStatus, string> = {
  'open': 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  'in-review': 'bg-purple-100 text-purple-700',
  'done': 'bg-emerald-100 text-emerald-700',
  'closed': 'bg-zinc-100 text-zinc-500',
}

export function renderStatusBadge(status: IssueStatus): React.ReactNode {
  const label = STATUS_OPTIONS.find((o) => o.key === status)?.label ?? status
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ${statusColors[status]}`}>
      {label}
    </span>
  )
}

/* ──────────────────────────────────────────────
   Type icons
   ────────────────────────────────────────────── */

export const typeIcons: Record<string, React.ReactNode> = {
  epic: <FiLayers className="h-3.5 w-3.5 text-purple-600" />,
  story: <FiTarget className="h-3.5 w-3.5 text-emerald-600" />,
  task: <FiCheckCircle className="h-3.5 w-3.5 text-blue-600" />,
  subtask: <FiCircle className="h-3.5 w-3.5 text-zinc-400" />,
  bug: <FiAlertCircle className="h-3.5 w-3.5 text-red-600" />,
  improvement: <FiEdit3 className="h-3.5 w-3.5 text-cyan-600" />,
}

export function renderTypeIcon(typeId: string): React.ReactNode {
  return typeIcons[typeId] ?? <FiCheckCircle className="h-3.5 w-3.5" />
}

/* ──────────────────────────────────────────────
   Priority helpers
   ────────────────────────────────────────────── */

export const priorityColors: Record<string, string> = {
  p0: 'text-red-600',
  p1: 'text-orange-500',
  p2: 'text-yellow-600',
  p3: 'text-gray-500',
  blocker: 'text-red-700',
  critical: 'text-red-600',
  major: 'text-orange-500',
  minor: 'text-yellow-600',
  trivial: 'text-gray-400',
  high: 'text-red-600',
  medium: 'text-yellow-600',
  low: 'text-gray-500',
}

export function renderPriorityBadge(priorityId: string, label?: string): React.ReactNode {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${priorityColors[priorityId] ?? 'text-gray-500'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? priorityId}
    </span>
  )
}

/* ──────────────────────────────────────────────
   File / attachment helpers
   ────────────────────────────────────────────── */

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getFileIcon(_fileType: string): React.ReactNode {
  return <FiPaperclip className="h-3.5 w-3.5" />
}

export function getPlaceholderUrl(fileName: string): string {
  const label = encodeURIComponent(fileName.replace(/.[^.]+$/, ''))
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='14' fill='%239ca3af'%3E${label}%3C/text%3E%3C/svg%3E`
}

/* ──────────────────────────────────────────────
   Can-have-children check
   ────────────────────────────────────────────── */

export function canHaveChildren(typeId: string): boolean {
  return typeId !== 'subtask'
}
