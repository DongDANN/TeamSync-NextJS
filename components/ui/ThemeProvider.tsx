'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { THEMES, THEME_LIST, DEFAULT_THEME, type ThemeConfig, type ThemeId } from '@/lib/themes'

const STORAGE_KEY = 'ts-theme'

type ThemeContextValue = {
  themeId: ThemeId
  theme: ThemeConfig
  setTheme: (id: ThemeId) => void
  themes: ThemeConfig[]
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    if (saved && THEMES[saved]) {
      setThemeId(saved)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', themeId)
      localStorage.setItem(STORAGE_KEY, themeId)
    }
  }, [themeId, mounted])

  const value: ThemeContextValue = {
    themeId,
    theme: THEMES[themeId],
    setTheme: setThemeId,
    themes: THEME_LIST,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
