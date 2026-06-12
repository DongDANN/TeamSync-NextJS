'use client'

import { useState, useMemo } from 'react'
import {
  FiFolder, FiFolderPlus, FiFile, FiChevronRight, FiChevronDown,
  FiCode, FiImage, FiFileText,
} from 'react-icons/fi'
import type { RepoEntry } from '@/lib/github'

type FileTreeProps = {
  entries: RepoEntry[]
  currentPath: string | null
  onFileSelect: (entry: RepoEntry) => void
  onClose?: () => void
}

/* ── Helpers ── */

function getFileIcon(name: string, type: 'file' | 'dir', open: boolean): React.ReactNode {
  if (type === 'dir') return open ? <FiFolderPlus className="h-3.5 w-3.5" /> : <FiFolder className="h-3.5 w-3.5" />
  const ext = name.split('.').pop()?.toLowerCase()
  if (['ts', 'tsx', 'js', 'jsx', 'json', 'css', 'html', 'md'].includes(ext || '')) return <FiCode className="h-3.5 w-3.5" />
  if (['png', 'jpg', 'svg', 'ico'].includes(ext || '')) return <FiImage className="h-3.5 w-3.5" />
  return <FiFileText className="h-3.5 w-3.5" />
}

/* ── Component ── */

export default function FileTree({ entries, currentPath, onFileSelect, onClose }: FileTreeProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['']))

  const root = useMemo(() => buildTree(entries), [entries])

  function toggleDir(path: string) {
    setExpandedDirs((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme-border/10 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-theme-fg/50">
          Files
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-theme-fg/40 hover:bg-theme-fg/5 hover:text-theme-fg lg:hidden"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {root.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            expandedDirs={expandedDirs}
            currentPath={currentPath}
            onToggle={toggleDir}
            onSelect={onFileSelect}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Tree Node ── */

type TreeNodeData = {
  name: string
  path: string
  type: 'file' | 'dir'
  size?: number
  children: TreeNodeData[]
}

type TreeNodeProps = {
  node: TreeNodeData
  depth: number
  expandedDirs: Set<string>
  currentPath: string | null
  onToggle: (path: string) => void
  onSelect: (entry: RepoEntry) => void
}

function TreeNode({ node, depth, expandedDirs, currentPath, onToggle, onSelect }: TreeNodeProps) {
  const isDir = node.type === 'dir'
  const isExpanded = expandedDirs.has(node.path)
  const isActive = node.path === currentPath

  return (
    <>
      <button
        type="button"
        onClick={() => (isDir ? onToggle(node.path) : onSelect(node))}
        className={`flex w-full items-center gap-1.5 px-2 py-1 text-left text-xs transition-colors ${
          isActive
            ? 'bg-black text-white'
            : 'text-theme-fg/70 hover:bg-theme-fg/5 hover:text-theme-fg'
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {isDir && (
          <span className="shrink-0 text-[10px] text-theme-fg/30">
            {isExpanded ? <FiChevronDown className="h-3 w-3" /> : <FiChevronRight className="h-3 w-3" />}
          </span>
        )}
        <span className={`shrink-0 ${isDir ? 'text-amber-500/70' : 'text-theme-fg/45'}`}>
          {getFileIcon(node.name, node.type, isExpanded)}
        </span>
        <span className="truncate">{node.name}</span>
      </button>

      {isDir && isExpanded && node.children.map((child) => (
        <TreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          expandedDirs={expandedDirs}
          currentPath={currentPath}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}

/* ── Tree Builder ── */

function buildTree(entries: RepoEntry[]): TreeNodeData[] {
  const root: TreeNodeData[] = []
  const map = new Map<string, TreeNodeData>()

  // Sort: dirs first, then alphabetical
  const sorted = [...entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  for (const entry of sorted) {
    // Skip root-level entries that are just the project root
    const node: TreeNodeData = {
      name: entry.name,
      path: entry.path,
      type: entry.type,
      size: entry.size,
      children: [],
    }
    map.set(entry.path, node)

    const parts = entry.path.split('/')
    if (parts.length === 1) {
      root.push(node)
    } else {
      const parentPath = parts.slice(0, -1).join('/')
      const parent = map.get(parentPath)
      if (parent) {
        parent.children.push(node)
      } else {
        root.push(node)
      }
    }
  }

  return root
}
