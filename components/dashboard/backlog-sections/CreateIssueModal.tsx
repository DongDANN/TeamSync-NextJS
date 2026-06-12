'use client'

import { useState, useRef } from 'react'
import { FiX, FiPaperclip } from 'react-icons/fi'
import { type Issue, type Attachment, formatFileSize, getFileIcon, getPlaceholderUrl } from '@/lib/issues'
import type { TemplateConfig } from '@/lib/templates'
import ModalFrame from './ModalFrame'

type CreateIssueModalProps = {
  open: boolean
  onClose: () => void
  config: TemplateConfig
  prefix: string
  issues: Issue[]
  onCreate: (issue: Issue, attachments: Attachment[]) => void
}

let nextId = 11
let nextAttachmentId = 3

export default function CreateIssueModal({
  open,
  onClose,
  config,
  prefix,
  issues,
  onCreate,
}: CreateIssueModalProps) {
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newType, setNewType] = useState(config.issueTypes[0]?.id ?? 'task')
  const [newPriority, setNewPriority] = useState(config.priorities[1]?.id ?? 'medium')
  const [newParentId, setNewParentId] = useState<string | null>(null)
  const [newAttachments, setNewAttachments] = useState<Attachment[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const resetForm = () => {
    setNewTitle('')
    setNewDescription('')
    setNewType(config.issueTypes[0]?.id ?? 'task')
    setNewPriority(config.priorities[1]?.id ?? 'medium')
    setNewParentId(null)
    setNewAttachments([])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleFilePick = () => fileRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const newOnes: Attachment[] = files.map((f) => ({
      id: `a${nextAttachmentId++}`,
      fileName: f.name,
      fileSize: f.size,
      fileType: f.type,
      url: URL.createObjectURL(f),
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: 'You',
    }))
    setNewAttachments((prev) => [...prev, ...newOnes])
    if (e.target) e.target.value = ''
  }

  const removeAttachment = (id: string) => {
    setNewAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleCreate = () => {
    if (!newTitle.trim()) return
    const issue: Issue = {
      id: `${prefix}-${nextId++}`,
      title: newTitle.trim(),
      typeId: newType,
      priorityId: newPriority,
      status: 'open',
      assignee: 'Unassigned',
      description: newDescription.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      parentId: newParentId,
    }
    onCreate(issue, newAttachments)
    resetForm()
  }

  const canHaveChildren = (typeId: string) => typeId !== 'subtask'

  const isImage = (a: Attachment) => a.fileType.startsWith('image/')

  const resolveUrl = (a: Attachment) => a.url === 'placeholder' ? getPlaceholderUrl(a.fileName) : a.url

  return (
    <ModalFrame onClose={handleClose}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-theme-border/10 px-6 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.1em]">Create Issue</h3>
        <button
          type="button"
          onClick={handleClose}
          className="rounded-lg p-1.5 text-theme-fg/40 transition hover:bg-theme-fg/5 hover:text-theme-fg"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto px-6 py-5">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-theme-fg/50">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done?"
              onKeyDown={(e) => { if (e.key === 'Escape') handleClose() }}
              autoFocus
              className="mt-1 block w-full rounded-lg border border-theme-border/15 px-3 py-2 text-sm font-medium outline-none transition focus:border-theme-fg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-theme-fg/50">Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe the issue…"
              rows={3}
              className="mt-1 block w-full resize-none rounded-lg border border-theme-border/15 px-3 py-2 text-sm outline-none transition focus:border-theme-fg"
            />
          </div>

          {/* Type + Priority + Parent */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-theme-fg/50">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-theme-border/15 px-3 py-2 text-sm outline-none transition focus:border-theme-fg"
              >
                {config.issueTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-theme-fg/50">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-theme-border/15 px-3 py-2 text-sm outline-none transition focus:border-theme-fg"
              >
                {config.priorities.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-theme-fg/50">Parent Issue</label>
              <select
                value={newParentId ?? ''}
                onChange={(e) => setNewParentId(e.target.value || null)}
                className="mt-1 block w-full rounded-lg border border-theme-border/15 px-3 py-2 text-sm outline-none transition focus:border-theme-fg"
              >
                <option value="">None (top-level)</option>
                {issues
                  .filter((i) => canHaveChildren(i.typeId))
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.id} — {i.title.slice(0, 48)}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-theme-fg/50">Attachments</label>
            <div className="mt-1">
              <button
                type="button"
                onClick={handleFilePick}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-theme-border/15 px-3 text-xs font-medium text-theme-fg/60 transition hover:border-theme-border/40"
              >
                <FiPaperclip className="h-3.5 w-3.5" />
                Add files
              </button>
              <input ref={fileRef} type="file" multiple onChange={handleFileChange} className="hidden" />
              {newAttachments.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {newAttachments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-lg border border-theme-border/10 bg-theme-panel px-3 py-2">
                      <div className="flex items-center gap-2 overflow-hidden min-w-0">
                        <span className="shrink-0">{getFileIcon(a.fileType)}</span>
                        <span className="truncate text-xs font-medium text-theme-fg">{a.fileName}</span>
                        <span className="shrink-0 text-[10px] text-theme-fg/40">{formatFileSize(a.fileSize)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(a.id)}
                        className="rounded p-0.5 text-theme-fg/30 hover:text-red-600 shrink-0 ml-2"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-theme-border/10 px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          className="rounded-lg px-4 py-2 text-xs font-medium text-theme-fg/50 transition hover:text-theme-fg"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={!newTitle.trim()}
          className="inline-flex h-9 items-center rounded-lg bg-black px-5 text-xs font-semibold text-white transition hover:bg-black/90 disabled:opacity-40"
        >
          Create
        </button>
      </div>
    </ModalFrame>
  )
}
