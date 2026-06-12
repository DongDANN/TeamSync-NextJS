'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiAlertTriangle, FiX } from 'react-icons/fi'

type AlertModalProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export default function AlertModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: AlertModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      // Focus the confirm button when modal opens
      setTimeout(() => confirmRef.current?.focus(), 100)

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel()
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onCancel])

  if (!open) return null

  const confirmStyles =
    variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-black text-white hover:bg-black/90'

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center" onClick={onCancel}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />

      {/* Card — full-width on mobile, centered on md+ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative mx-4 mb-0 flex w-full max-w-sm flex-col rounded-t-2xl border border-theme-border/10 bg-theme-panel p-6 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.35)] md:mb-0 md:rounded-2xl"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-theme-fg/40 transition hover:bg-theme-fg/5 hover:text-theme-fg"
        >
          <FiX className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex items-center gap-3">
          <span
            className={`grid size-10 shrink-0 place-content-center rounded-full ${
              variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-theme-fg/5 text-theme-fg/60'
            }`}
          >
            <FiAlertTriangle className="h-5 w-5" />
          </span>
          <h3 className="text-sm font-semibold tracking-[0.06em] text-theme-fg">{title}</h3>
        </div>

        {/* Message */}
        <p className="text-sm leading-relaxed text-theme-fg/65">{message}</p>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-xs font-medium text-theme-fg/50 transition hover:bg-theme-fg/5 hover:text-theme-fg"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`inline-flex h-9 items-center rounded-lg px-5 text-xs font-semibold transition disabled:opacity-40 ${confirmStyles}`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
