'use client'

import { motion } from 'framer-motion'

type ModalFrameProps = {
  children: React.ReactNode
  onClose: () => void
}

export default function ModalFrame({ children, onClose }: ModalFrameProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex md:items-center md:justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />

      {/* Modal card — full-screen on mobile, centered card on md+ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-theme-panel md:h-auto md:max-h-[85vh] md:max-w-2xl md:rounded-2xl md:border md:border-theme-border/10 md:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.35)] md:mx-4"
      >
        {children}
      </motion.div>
    </div>
  )
}
