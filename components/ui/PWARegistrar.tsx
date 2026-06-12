'use client'

import { useEffect } from 'react'

export default function PWARegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register SW — don't block on it, just fire and forget
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration is best-effort; silence errors in dev
      })
    }
  }, [])

  return null
}
