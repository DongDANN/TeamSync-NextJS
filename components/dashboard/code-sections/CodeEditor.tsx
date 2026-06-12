'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { EditorState, type Extension } from '@codemirror/state'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import {
  bracketMatching, indentOnInput, foldGutter,
} from '@codemirror/language'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { autocompletion, closeBrackets } from '@codemirror/autocomplete'
import { FiSave, FiX, FiFile } from 'react-icons/fi'
import type { FileContent } from '@/lib/github'

type CodeEditorProps = {
  file: FileContent | null
  onSave?: (path: string, content: string) => void
  onClose?: () => void
  saving?: boolean
  theme?: 'light' | 'dark'
}

const languageMap: Record<string, () => Extension> = {
  typescript: () => javascript({ typescript: true }),
  javascript: () => javascript(),
  jsx: () => javascript({ jsx: true }),
  tsx: () => javascript({ jsx: true, typescript: true }),
  json: () => json(),
  css: () => css(),
  html: () => html(),
  markdown: () => markdown(),
}

export default function CodeEditor({ file, onSave, onClose, saving, theme }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [dirty, setDirty] = useState(false)
  const contentRef = useRef('')

  const handleSave = useCallback(() => {
    if (file && dirty && onSave) {
      onSave(file.path, contentRef.current)
      setDirty(false)
    }
  }, [file, dirty, onSave])

  // Build and update editor
  useEffect(() => {
    if (!editorRef.current) return

    // Destroy previous
    if (viewRef.current) {
      viewRef.current.destroy()
      viewRef.current = null
    }

    if (!file) return

    const doc = file.content
    contentRef.current = doc
    setDirty(false)

    const lang = languageMap[file.language]
    const extensions: Extension[] = [
      keymap.of([...defaultKeymap, indentWithTab]),
      bracketMatching(),
      closeBrackets(),
      indentOnInput(),
      autocompletion(),
      foldGutter(),
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          contentRef.current = update.state.doc.toString()
          setDirty(true)
        }
      }),
      placeholder('Start typing…'),
      EditorView.theme({
        '&': { fontSize: '13px', height: '100%' },
        '.cm-scroller': { fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" },
        '.cm-gutters': { borderRight: '1px solid var(--theme-border, #e5e7eb)', backgroundColor: 'transparent' },
        '.cm-activeLineGutter': { backgroundColor: 'var(--theme-fg, #000) / 5' },
        '.cm-foldGutter': { opacity: '0.4' },
        '.cm-foldPlaceholder': { backgroundColor: 'transparent', border: 'none', color: 'inherit' },
      }),
    ]

    if (lang) extensions.push(lang())
    if (theme === 'dark') extensions.push(oneDark)

    const state = EditorState.create({
      doc,
      extensions,
    })

    const view = new EditorView({ state, parent: editorRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [file?.path, theme]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle keyboard save (Ctrl+S / Cmd+S)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSave])

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <FiFile className="mx-auto h-8 w-8 text-theme-fg/20" />
          <p className="mt-2 text-sm text-theme-fg/40">Select a file to view or edit</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-theme-border/10 bg-theme-panel">
        <div className="flex items-center gap-1 px-2 py-1">
          <span className="flex items-center gap-1.5 rounded-md bg-theme-fg/5 px-2.5 py-1 text-xs font-medium text-theme-fg">
            <FiFile className="h-3 w-3 text-theme-fg/45" />
            {file.path.split('/').pop()}
            {dirty && <span className="ml-0.5 text-theme-fg/40">●</span>}
          </span>
        </div>
        <div className="flex items-center gap-1 px-2">
          {dirty && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-md bg-black px-2.5 py-1 text-[11px] font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              <FiSave className="h-3 w-3" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-theme-fg/40 hover:bg-theme-fg/5 hover:text-theme-fg"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden" ref={editorRef} />
    </div>
  )
}
