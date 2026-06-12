'use client'

import { motion } from 'framer-motion'

type ModalFrameProps = {
  children: React.ReactNode
  onClose: () => void
}

export default function ModalFrame({ children, onClose }: ModalFrameProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-black/10 bg-white shadow-[0_25px_60px_-20px_rgba(0,0,0,0.35)]"
      >
        {children}
      </motion.div>
    </div>
  )
}
