'use client'

import { useState, useRef } from 'react'
import {
  FiX, FiSave, FiTrash2, FiUser, FiCalendar, FiHash,
  FiMessageSquare, FiCornerDownRight, FiSend, FiPaperclip, FiLink, FiLayers, FiPlus,
} from 'react-icons/fi'
import {
  type Issue, type IssueStatus, type Comment, type Attachment,
  STATUS_OPTIONS, renderTypeIcon, renderStatusBadge, renderPriorityBadge,
  formatFileSize, getFileIcon, getPlaceholderUrl, canHaveChildren,
} from '@/lib/issues'
import type { TemplateConfig, IssueType, Priority } from '@/lib/templates'
import ModalFrame from './ModalFrame'

/* ──────────────────────────────────────────────
   Props
   ────────────────────────────────────────────── */

type IssueDetailModalProps = {
  issue: Issue
  onClose: () => void
  issues: Issue[]
  config: TemplateConfig
  comments: Comment[]
  attachments: Record<string, Attachment[]>
  childMap: Record<string, Issue[]>
  onUpdateIssue: (id: string, updates: Partial<Issue>) => void
  onDeleteIssue: (id: string) => void
  onAddComment: (comment: Comment) => void
  onAddAttachments: (issueId: string, files: Attachment[]) => void
  onRemoveAttachment: (issueId: string, attachmentId: string) => void
  onNavigateToIssue: (id: string) => void
  onPreviewImage: (url: string) => void
}

let nextCommentId = 5
let nextAttachmentId = 3

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

export default function IssueDetailModal({
  issue,
  onClose,
  issues,
  config,
  comments,
  attachments,
  childMap,
  onUpdateIssue,
  onDeleteIssue,
  onAddComment,
  onAddAttachments,
  onRemoveAttachment,
  onNavigateToIssue,
  onPreviewImage,
}: IssueDetailModalProps) {
  /* ── Edit fields ── */
  const [title, setTitle] = useState(issue.title)
  const [description, setDescription] = useState(issue.description)
  const [typeId, setTypeId] = useState(issue.typeId)
  const [priorityId, setPriorityId] = useState(issue.priorityId)
  const [status, setStatus] = useState<IssueStatus>(issue.status)
  const [assignee, setAssignee] = useState(issue.assignee)
  const [dirty, setDirty] = useState(false)

  /* ── Comment inputs ── */
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [commentFiles, setCommentFiles] = useState<Attachment[]>([])
  const commentFileRef = useRef<HTMLInputElement>(null)

  const markDirty = () => { if (!dirty) setDirty(true) }

  const getIssueType = (id: string): IssueType | undefined =>
    config.issueTypes.find((t) => t.id === id)

  const getPriority = (id: string): Priority | undefined =>
    config.priorities.find((p) => p.id === id)

  const getParentChain = (id: string): Issue[] => {
    const chain: Issue[] = []
    let current = issues.find((i) => i.id === id)
    while (current?.parentId) {
      const parent = issues.find((i) => i.id === current!.parentId)
      if (parent) chain.unshift(parent)
      current = parent
    }
    return chain
  }

  const handleSave = () => {
    if (!title.trim()) return
    onUpdateIssue(issue.id, { title: title.trim(), description, typeId, priorityId, status, assignee })
    setDirty(false)
  }

  const handleDelete = () => {
    if (confirm('Delete this issue?')) {
      onDeleteIssue(issue.id)
      onClose()
    }
  }

  /* ── Comments ── */
  const handleAddComment = () => {
    if (!newComment.trim()) return
    const comment: Comment = {
      id: `c${nextCommentId++}`,
      issueId: issue.id,
      author: 'You',
      body: newComment.trim(),
      parentId: null,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    onAddComment(comment)
    if (commentFiles.length > 0) {
      onAddAttachments(comment.id, commentFiles)
    }
    setNewComment('')
    setCommentFiles([])
  }

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim()) return
    const comment: Comment = {
      id: `c${nextCommentId++}`,
      issueId: issue.id,
      author: 'You',
      body: replyText.trim(),
      parentId,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    onAddComment(comment)
    setReplyText('')
    setReplyTo(null)
  }

  /* ── Attachments ── */
  const handleDetailFilePick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = () => {
      const files = Array.from(input.files ?? [])
      const newOnes: Attachment[] = files.map((f) => ({
        id: `a${nextAttachmentId++}`,
        fileName: f.name,
        fileSize: f.size,
        fileType: f.type,
        url: URL.createObjectURL(f),
        uploadedAt: new Date().toISOString().slice(0, 10),
        uploadedBy: 'You',
      }))
      onAddAttachments(issue.id, newOnes)
      markDirty()
    }
    input.click()
  }

  const handleCommentFilePick = () => commentFileRef.current?.click()

  const handleCommentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setCommentFiles((prev) => [...prev, ...newOnes])
    if (e.target) e.target.value = ''
  }

  /* ── Child issues ── */
  const children = childMap[issue.id] ?? []

  const isImage = (a: Attachment) => a.fileType.startsWith('image/')
  const resolveUrl = (a: Attachment) => a.url === 'placeholder' ? getPlaceholderUrl(a.fileName) : a.url

  const renderAttachmentRow = (a: Attachment, onRemove?: () => void) => {
    const imgUrl = resolveUrl(a)
    return (
      <li key={a.id} className="flex items-center justify-between rounded-lg border border-black/10 bg-white px-3 py-2">
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          {isImage(a) ? (
            <button type="button" onClick={() => onPreviewImage(imgUrl)} className="shrink-0">
              <img src={imgUrl} alt={a.fileName} className="h-10 w-10 rounded-md border border-black/10 object-cover transition hover:opacity-80" />
            </button>
          ) : (
            <span className="shrink-0">{getFileIcon(a.fileType)}</span>
          )}
          <button
            type="button"
            onClick={() => isImage(a) && onPreviewImage(imgUrl)}
            className={`truncate text-xs font-medium ${isImage(a) ? 'text-blue-600 hover:underline' : 'text-black'} min-w-0 text-left`}
          >
            {a.fileName}
          </button>
          <span className="shrink-0 text-[10px] text-black/40">{formatFileSize(a.fileSize)}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-[10px] text-black/40">{a.uploadedBy}</span>
          {onRemove && (
            <button type="button" onClick={onRemove} className="rounded p-0.5 text-black/30 hover:text-red-600">
              <FiX className="h-3 w-3" />
            </button>
          )}
        </div>
      </li>
    )
  }

  const issueComments = comments.filter((c) => c.issueId === issue.id)

  return (
    <ModalFrame onClose={onClose}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-black/40">{issue.id}</span>
          {renderStatusBadge(status)}
        </div>
        <div className="flex items-center gap-1">
          {dirty && (
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-black px-3 text-xs font-semibold text-white transition hover:bg-black/90"
            >
              <FiSave className="h-3 w-3" />
              Save
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-black/40 transition hover:bg-black/5 hover:text-black"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="overflow-y-auto px-6 py-5">
        <div className="space-y-6">
          {/* Breadcrumb parent chain */}
          {(() => {
            const chain = getParentChain(issue.id)
            if (chain.length === 0) return null
            return (
              <nav className="flex items-center gap-1 text-xs flex-wrap">
                {chain.map((parent) => (
                  <span key={parent.id} className="flex items-center gap-1">
                    <span className="text-black/20 mx-0.5 select-none">/</span>
                    <button
                      type="button"
                      onClick={() => onNavigateToIssue(parent.id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-black/50 transition hover:bg-zinc-100 hover:text-black"
                    >
                      <span className="shrink-0">{renderTypeIcon(parent.typeId)}</span>
                      <span>{parent.id}</span>
                    </button>
                  </span>
                ))}
                <span className="text-black/20 mx-0.5 select-none">/</span>
                <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-black">
                  <span className="shrink-0">{renderTypeIcon(issue.typeId)}</span>
                  <span>{issue.id}</span>
                </span>
              </nav>
            )
          })()}

          {/* Title */}
          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-black/50">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); markDirty() }}
              className="mt-1 block w-full rounded-lg border border-black/15 px-3 py-2 text-sm font-medium outline-none transition focus:border-black"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-black/50">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => { setDescription(e.target.value); markDirty() }}
              placeholder="Add a description…"
              className="mt-1 block w-full resize-none rounded-lg border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-black/50">Type</label>
              <select
                value={typeId}
                onChange={(e) => { setTypeId(e.target.value); markDirty() }}
                className="mt-1 block w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-black"
              >
                {config.issueTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-black/50">Priority</label>
              <select
                value={priorityId}
                onChange={(e) => { setPriorityId(e.target.value); markDirty() }}
                className="mt-1 block w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-black"
              >
                {config.priorities.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-black/50">Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value as IssueStatus); markDirty() }}
                className="mt-1 block w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-black"
              >
                {STATUS_OPTIONS.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-black/50">Assignee</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => { setAssignee(e.target.value); markDirty() }}
                placeholder="Unassigned"
                className="mt-1 block w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-black"
              />
            </div>
          </div>

          {/* Parent (read-only) */}
          {issue.parentId && (() => {
            const parent = issues.find((i) => i.id === issue.parentId)
            if (!parent) return null
            return (
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-black/50">Parent Issue</label>
                <button
                  type="button"
                  onClick={() => onNavigateToIssue(parent.id)}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg border border-black/15 bg-zinc-50 px-3 py-2.5 text-sm text-left transition hover:bg-zinc-100"
                >
                  {renderTypeIcon(parent.typeId)}
                  <span className="font-medium text-black">{parent.title}</span>
                  <span className="font-mono text-[11px] text-black/40">{parent.id}</span>
                </button>
              </div>
            )
          })()}

          {/* Attachments */}
          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.08em] text-black/50">
              Attachments
              {(attachments[issue.id]?.length ?? 0) > 0 && (
                <span className="ml-1 text-black/40">({attachments[issue.id].length})</span>
              )}
            </label>
            <div className="mt-1">
              <button
                type="button"
                onClick={handleDetailFilePick}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/15 px-3 text-xs font-medium text-black/60 transition hover:border-black/40"
              >
                <FiPaperclip className="h-3.5 w-3.5" />
                Add files
              </button>
              {(attachments[issue.id]?.length ?? 0) > 0 && (
                <ul className="mt-2 space-y-1">
                  {attachments[issue.id].map((a) => renderAttachmentRow(a, () => onRemoveAttachment(issue.id, a.id)))}
                </ul>
              )}
            </div>
          </div>

          {/* Read-only metadata */}
          <div className="rounded-lg border border-black/10 bg-zinc-50 px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-black/50">
              <span className="inline-flex items-center gap-1.5"><FiHash className="h-3 w-3" />{issue.id}</span>
              <span className="inline-flex items-center gap-1.5"><FiCalendar className="h-3 w-3" />Created {issue.createdAt}</span>
              <span className="inline-flex items-center gap-1.5"><FiUser className="h-3 w-3" />{assignee || 'Unassigned'}</span>
              <span className="inline-flex items-center gap-1.5"><FiLink className="h-3 w-3" />{issue.parentId ? `Child of ${issue.parentId}` : 'Top-level'}</span>
              <span className="inline-flex items-center gap-1.5"><FiMessageSquare className="h-3 w-3" />{issueComments.length}</span>
            </div>
          </div>

          {/* Child issues */}
          {(children.length > 0 || canHaveChildren(issue.typeId)) && (
            <div className="border-t border-black/10 pt-4">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-black/50">
                <FiLayers className="h-3.5 w-3.5" />
                Child Issues
                <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-normal">{children.length}</span>
              </h3>

              {children.length > 0 && (
                <>
                  <div className="mt-3 mb-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${(children.filter((c) => c.status === 'done' || c.status === 'closed').length / children.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-black/50">
                      {children.filter((c) => c.status === 'done' || c.status === 'closed').length}/{children.length} done
                    </span>
                  </div>
                  <div className="space-y-1">
                    {children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center gap-3 rounded-lg border border-black/10 bg-zinc-50 px-3 py-2 cursor-pointer transition hover:bg-zinc-100"
                        onClick={() => onNavigateToIssue(child.id)}
                      >
                        {renderTypeIcon(child.typeId)}
                        <span className="flex-1 truncate text-xs font-medium text-black">{child.title}</span>
                        <span className="font-mono text-[10px] text-black/40">{child.id}</span>
                        {renderStatusBadge(child.status)}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {canHaveChildren(issue.typeId) && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    // The parent should set the parentId when creating from here
                    // This requires coordination — handled via onClose + external state
                  }}
                  className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-black/20 px-3 text-xs font-medium text-black/50 transition hover:border-black/40 hover:text-black"
                >
                  <FiPlus className="h-3 w-3" />
                  Add child issue
                </button>
              )}
            </div>
          )}

          {/* Delete */}
          <div className="border-t border-black/10 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
            >
              <FiTrash2 className="h-3.5 w-3.5" />
              Delete issue
            </button>
          </div>

          {/* Comments */}
          <div className="border-t border-black/10 pt-6">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-black/50">
              <FiMessageSquare className="h-3.5 w-3.5" />
              Comments
              <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-normal">{issueComments.length}</span>
            </h3>

            {/* New comment */}
            <div className="mt-4">
              <div className="flex gap-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment…"
                  rows={2}
                  className="flex-1 block resize-none rounded-lg border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-black"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-semibold text-white transition hover:bg-black/90 disabled:opacity-40 self-end"
                >
                  <FiSend className="h-3.5 w-3.5" />
                  Send
                </button>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCommentFilePick}
                  className="inline-flex h-7 items-center gap-1 rounded-lg border border-black/15 px-2.5 text-[10px] font-medium text-black/50 transition hover:border-black/40"
                >
                  <FiPaperclip className="h-3 w-3" />
                  Attach files
                </button>
                <input ref={commentFileRef} type="file" multiple onChange={handleCommentFileChange} className="hidden" />
                {commentFiles.length > 0 && (
                  <>
                    <span className="text-[10px] text-black/40">{commentFiles.length} file{commentFiles.length > 1 ? 's' : ''} attached</span>
                    <ul className="flex gap-1 ml-1">
                      {commentFiles.map((a) => (
                        <li key={a.id} className="flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5">
                          <span className="text-[10px] text-black/60 truncate max-w-[80px]">{a.fileName}</span>
                          <button onClick={() => setCommentFiles((prev) => prev.filter((x) => x.id !== a.id))} className="text-black/30 hover:text-red-600">
                            <FiX className="h-2.5 w-2.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Comment threads */}
            <div className="mt-6 space-y-4">
              {issueComments.filter((c) => c.parentId === null).map((comment) => {
                const replies = issueComments.filter((c) => c.parentId === comment.id)
                const isReplying = replyTo === comment.id
                const commentAttachments = attachments[comment.id] ?? []

                return (
                  <div key={comment.id}>
                    <div className="rounded-lg border border-black/10 bg-zinc-50 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="grid size-6 place-content-center rounded-full bg-black text-[10px] font-semibold text-white">
                            {comment.author.charAt(0)}
                          </span>
                          <span className="text-xs font-semibold text-black">{comment.author}</span>
                          <span className="text-[10px] text-black/40">{comment.createdAt}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setReplyTo(isReplying ? null : comment.id); setReplyText('') }}
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-black/40 transition hover:text-black"
                        >
                          <FiCornerDownRight className="h-3 w-3" />
                          Reply
                        </button>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-black/80">{comment.body}</p>

                      {/* Comment attachments */}
                      {commentAttachments.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {commentAttachments.map((a) => {
                            const imgUrl = resolveUrl(a)
                            return (
                              <li key={a.id} className="flex items-center gap-2 rounded-md border border-black/5 bg-white px-2.5 py-1.5">
                                {isImage(a) ? (
                                  <button type="button" onClick={() => onPreviewImage(imgUrl)} className="shrink-0">
                                    <img src={imgUrl} alt={a.fileName} className="h-8 w-8 rounded border border-black/5 object-cover transition hover:opacity-80" />
                                  </button>
                                ) : (
                                  <span className="shrink-0">{getFileIcon(a.fileType)}</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => isImage(a) && onPreviewImage(imgUrl)}
                                  className={`truncate text-xs ${isImage(a) ? 'text-blue-600 hover:underline' : 'text-black'} min-w-0 text-left`}
                                >
                                  {a.fileName}
                                </button>
                                <span className="shrink-0 text-[10px] text-black/40">{formatFileSize(a.fileSize)}</span>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>

                    {/* Reply input */}
                    {isReplying && (
                      <div className="ml-8 mt-2 flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply…"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddReply(comment.id) }
                            if (e.key === 'Escape') setReplyTo(null)
                          }}
                          autoFocus
                          className="flex-1 rounded-lg border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-black"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddReply(comment.id)}
                          disabled={!replyText.trim()}
                          className="rounded-lg bg-black px-3 text-xs font-semibold text-white transition hover:bg-black/90 disabled:opacity-40"
                        >
                          Reply
                        </button>
                      </div>
                    )}

                    {/* Replies */}
                    {replies.length > 0 && (
                      <div className="ml-8 mt-2 space-y-2">
                        {replies.map((reply) => (
                          <div key={reply.id} className="rounded-lg border border-black/5 bg-white px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="grid size-5 place-content-center rounded-full bg-black/70 text-[9px] font-semibold text-white">
                                {reply.author.charAt(0)}
                              </span>
                              <span className="text-xs font-semibold text-black">{reply.author}</span>
                              <span className="text-[10px] text-black/40">{reply.createdAt}</span>
                            </div>
                            <p className="mt-1.5 whitespace-pre-wrap text-sm text-black/80">{reply.body}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              {issueComments.length === 0 && (
                <p className="py-4 text-center text-xs text-black/40">No comments yet. Start the discussion.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalFrame>
  )
}
