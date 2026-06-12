'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiX, FiRefreshCw, FiColumns, FiAlertTriangle, FiFolder } from 'react-icons/fi'
import { motion } from 'framer-motion'
import AnimatedButton from '@/components/ui/AnimatedButton'
import { TEMPLATES, type TemplateId, type Project } from '@/lib/templates'

type NewProjectModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (project: Project) => void
  existingKeys: string[]
}

function generateKey(name: string, existingKeys: string[]): string {
  const cleaned = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
    .slice(0, 10)

  if (!cleaned) return ''
  if (!existingKeys.includes(cleaned)) return cleaned

  let suffix = 1
  while (existingKeys.includes(`${cleaned}${suffix}`)) suffix++
  return `${cleaned}${suffix}`
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  scrum: <FiRefreshCw className="h-4 w-4" />,
  kanban: <FiColumns className="h-4 w-4" />,
  'bug-tracking': <FiAlertTriangle className="h-4 w-4" />,
  general: <FiFolder className="h-4 w-4" />,
}

const ACCESS_OPTIONS = [
  { value: 'private' as const, label: 'Private', desc: 'Only invited members' },
  { value: 'team' as const, label: 'Team-wide', desc: 'Everyone on the team' },
]

export default function NewProjectModal({ open, onClose, onSubmit, existingKeys }: NewProjectModalProps) {
  const [projectName, setProjectName] = useState('')
  const [projectKey, setProjectKey] = useState('')
  const [description, setDescription] = useState('')
  const [lead, setLead] = useState('')
  const [template, setTemplate] = useState<TemplateId>('kanban')
  const [access, setAccess] = useState<'private' | 'team'>('private')
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false)

  const reset = useCallback(() => {
    setProjectName('')
    setProjectKey('')
    setDescription('')
    setLead('')
    setTemplate('kanban')
    setAccess('private')
    setKeyManuallyEdited(false)
  }, [])

  useEffect(() => {
    if (open) reset()
  }, [open, reset])

  useEffect(() => {
    if (!keyManuallyEdited && projectName) {
      setProjectKey(generateKey(projectName, existingKeys))
    }
  }, [projectName, keyManuallyEdited, existingKeys])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName.trim() || !projectKey.trim()) return

    onSubmit({
      name: projectName.trim(),
      key: projectKey.trim().toUpperCase(),
      template,
      lead: lead.trim(),
      description: description.trim(),
      access,
    })
    onClose()
  }

  if (!open) return null

  const selectedTemplate = TEMPLATES[template]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative mx-4 w-full max-w-lg rounded-2xl border border-black/15 bg-white p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold uppercase tracking-[0.12em]">Create Project</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-black/40 transition hover:bg-black/5 hover:text-black"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project name */}
          <div>
            <label htmlFor="project-name" className="block text-xs font-medium uppercase tracking-[0.08em] text-black/70">
              Project name <span className="text-red-500">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Marketing Site Redesign"
              required
              className="mt-1.5 block w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* Project key */}
          <div>
            <label htmlFor="project-key" className="block text-xs font-medium uppercase tracking-[0.08em] text-black/70">
              Project key <span className="text-red-500">*</span>
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="font-mono text-sm text-black/40">/</span>
              <input
                id="project-key"
                type="text"
                value={projectKey}
                onChange={(e) => {
                  setKeyManuallyEdited(true)
                  setProjectKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))
                }}
                placeholder="MSR"
                required
                className="block w-24 rounded-lg border border-black/15 px-3 py-2 font-mono text-sm uppercase outline-none transition focus:border-black"
              />
              <span className="text-xs text-black/40">Used in issue IDs (e.g. MSR-1)</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="project-desc" className="block text-xs font-medium uppercase tracking-[0.08em] text-black/70">
              Description
            </label>
            <textarea
              id="project-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
              className="mt-1.5 block w-full resize-none rounded-lg border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* Template — card grid */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-black/70">
              Project template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.values(TEMPLATES) as Array<(typeof TEMPLATES)[TemplateId]>).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={`rounded-lg border px-3 py-2.5 text-left transition ${
                    template === t.id
                      ? 'border-black bg-black text-white'
                      : 'border-black/15 text-black hover:border-black/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={template === t.id ? 'text-white' : 'text-black/50'}>
                      {TEMPLATE_ICONS[t.id]}
                    </span>
                    <span className="text-xs font-semibold">{t.label}</span>
                  </div>
                  <p
                    className={`mt-1 text-[10px] leading-tight ${
                      template === t.id ? 'text-white/70' : 'text-black/50'
                    }`}
                  >
                    {t.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Template preview — shows what sections will be active */}
            {selectedTemplate && (
              <div className="mt-3 rounded-lg border border-black/10 bg-zinc-50 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-black/50">
                  Sections: {selectedTemplate.sections.join(' · ')}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-black/50">
                  Default: <span className="text-black/70">{selectedTemplate.defaultView}</span>
                </p>
              </div>
            )}
          </div>

          {/* Lead + Access */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project-lead" className="block text-xs font-medium uppercase tracking-[0.08em] text-black/70">
                Project lead
              </label>
              <input
                id="project-lead"
                type="text"
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                placeholder="Your name"
                className="mt-1.5 block w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-black"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-black/70">
                Access
              </label>
              <div className="mt-1.5 flex overflow-hidden rounded-lg border border-black/15">
                {ACCESS_OPTIONS.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setAccess(a.value)}
                    className={`flex-1 px-3 py-2 text-xs font-medium transition ${
                      access === a.value ? 'bg-black text-white' : 'text-black/60 hover:bg-black/5'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-black/60 transition hover:text-black"
            >
              Cancel
            </button>
            <AnimatedButton
              type="submit"
              className="h-9 px-5 py-0 text-xs font-bold tracking-wider normal-case"
              disabled={!projectName.trim() || !projectKey.trim()}
            >
              Create Project
            </AnimatedButton>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
