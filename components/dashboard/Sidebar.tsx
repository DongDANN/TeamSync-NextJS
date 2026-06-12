'use client'

import { useState, useEffect } from 'react'
import {
  FiClock,
  FiPlus,
  FiCode,
  FiColumns,
  FiChevronDown,
  FiChevronsRight,
  FiClipboard,
  FiFileText,
  FiHome,
  FiList,
  FiRefreshCw,
  FiAlertTriangle,
  FiFolder,
  FiMonitor,
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import { type Project, type SectionKey, TEMPLATES, type TemplateId } from '@/lib/templates'
import NewProjectModal from './NewProjectModal'
import { useTheme } from '@/components/ui/ThemeProvider'
import type { ThemeId, ThemeConfig } from '@/lib/themes'

type SidebarProps = {
  selected?: SectionKey
  setSelected?: (section: SectionKey) => void
  onActiveTemplateChange?: (template: TemplateId) => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

type OptionProps = {
  Icon: React.ComponentType<{ className?: string }>
  title: SectionKey
  selected: SectionKey
  setSelected: (title: SectionKey) => void
  open: boolean
  notifs?: number
}

const SECTION_ICONS: Record<SectionKey, React.ComponentType<{ className?: string }>> = {
  Summary: FiHome,
  Backlog: FiList,
  Board: FiColumns,
  Code: FiCode,
  Timeline: FiClock,
  Pages: FiFileText,
  Forms: FiClipboard,
}

const TEMPLATE_ICONS: Record<TemplateId, React.ComponentType<{ className?: string }>> = {
  scrum: FiRefreshCw,
  kanban: FiColumns,
  'bug-tracking': FiAlertTriangle,
  general: FiFolder,
}

const defaultProjects: Project[] = [
  { name: 'TeamSync', key: 'TS', template: 'general', lead: '', description: '', access: 'team' },
  { name: 'Website Revamp', key: 'WR', template: 'kanban', lead: '', description: '', access: 'team' },
  { name: 'Mobile App', key: 'MA', template: 'scrum', lead: '', description: '', access: 'private' },
]

const Sidebar = ({ selected: controlledSelected, setSelected: controlledSetSelected, onActiveTemplateChange, isMobileOpen, onMobileClose }: SidebarProps) => {
  const [open, setOpen] = useState(true)
  const [internalSelected, setInternalSelected] = useState<SectionKey>('Summary')
  const [projects, setProjects] = useState<Project[]>(defaultProjects)
  const [activeProjectKey, setActiveProjectKey] = useState('TS')
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const { themeId, setTheme, themes } = useTheme()

  const selected = controlledSelected ?? internalSelected
  const setSelected = controlledSetSelected ?? setInternalSelected

  const activeProject = projects.find((p) => p.key === activeProjectKey) ?? projects[0]
  const activeTemplate = activeProject ? TEMPLATES[activeProject.template] : null
  const visibleSections = activeTemplate?.sections ?? (Object.keys(SECTION_ICONS) as SectionKey[])

  useEffect(() => {
    if (activeProject) onActiveTemplateChange?.(activeProject.template)
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectProject = (projectKey: string) => {
    setActiveProjectKey(projectKey)
    setIsProjectMenuOpen(false)
    const project = projects.find((p) => p.key === projectKey)
    if (project) onActiveTemplateChange?.(project.template)
  }

  const handleCreateProject = (project: Project) => {
    setProjects((prev) => [...prev, project])
    setActiveProjectKey(project.key)
    onActiveTemplateChange?.(project.template)
  }

  const handleNavClick = (section: SectionKey) => {
    setSelected(section)
    onMobileClose?.()
  }

  const navContent = (
    <>
      <TitleSection
        open={open}
        activeProject={activeProject}
        projects={projects}
        isProjectMenuOpen={isProjectMenuOpen}
        setIsProjectMenuOpen={setIsProjectMenuOpen}
        onSelectProject={handleSelectProject}
        onOpenNewProject={() => setShowNewProjectModal(true)}
      />

      <div className="flex-1 space-y-1 overflow-y-auto">
        {visibleSections.map((section) => (
          <Option
            key={section}
            Icon={SECTION_ICONS[section]}
            title={section}
            selected={selected}
            setSelected={handleNavClick}
            open={open}
          />
        ))}
      </div>

      <ThemeToggle
        open={open}
        showPicker={showThemePicker}
        setShowPicker={setShowThemePicker}
        themeId={themeId}
        themes={themes}
        onSelect={(id) => { setTheme(id); setShowThemePicker(false) }}
      />
    </>
  )

  return (
    <>
      {/* Mobile drawer overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" onClick={onMobileClose}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 flex h-screen w-[280px] flex-col overflow-hidden border-r border-theme-border/10 bg-theme-panel p-3 shadow-xl"
          >
            {navContent}
            {/* Mobile: hide closes the drawer */}
            <ToggleClose open={open} setOpen={setOpen} onCloseDrawer={onMobileClose} />
          </motion.aside>
        </div>
      )}

      {/* Desktop sidebar — hidden on mobile, sticky inline on lg+ */}
      <motion.nav
        layout
        className="sticky top-0 z-20 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-theme-border/10 bg-theme-panel p-3 lg:flex"
        style={{ width: open ? '225px' : 'fit-content' }}
      >
        {navContent}
        {/* Desktop: hide toggles collapse as before */}
        <ToggleClose open={open} setOpen={setOpen} />
      </motion.nav>

      <NewProjectModal
        open={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onSubmit={handleCreateProject}
        existingKeys={projects.map((p) => p.key)}
      />
    </>
  )
}

const Option = ({ Icon, title, selected, setSelected, open, notifs }: OptionProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const isActive = selected === title

  return (
    <motion.button
      layout
      onClick={() => setSelected(title)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex h-10 w-full items-center overflow-hidden rounded-md px-1 transition-colors ${
        isActive ? 'text-white' : 'text-theme-fg/55'
      }`}
    >
      <motion.span
        initial={false}
        animate={{
          scaleX: isActive || isHovered ? 1 : 0,
          opacity: isActive || isHovered ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="absolute inset-0 z-0 origin-left rounded-md bg-black"
      />
      <motion.div
        layout
        className={`relative z-10 grid h-full w-10 place-content-center text-lg transition-colors ${
          isActive || isHovered ? 'text-white' : 'text-theme-fg/55'
        }`}
      >
        <Icon />
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.125 }}
          className={`relative z-10 text-xs font-medium transition-colors ${
            isActive || isHovered ? 'text-white' : 'text-theme-fg/75'
          }`}
        >
          {title}
        </motion.span>
      )}

      {notifs && open && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ y: '-50%' }}
          transition={{ delay: 0.5 }}
          className="absolute right-2 top-1/2 z-10 grid size-5 place-content-center rounded-full bg-white text-[10px] font-medium text-black"
        >
          {notifs}
        </motion.span>
      )}
    </motion.button>
  )
}

type TitleSectionProps = {
  open: boolean
  activeProject: Project
  projects: Project[]
  isProjectMenuOpen: boolean
  setIsProjectMenuOpen: (open: boolean) => void
  onSelectProject: (key: string) => void
  onOpenNewProject: () => void
}

const TitleSection = ({
  open,
  activeProject,
  projects,
  isProjectMenuOpen,
  setIsProjectMenuOpen,
  onSelectProject,
  onOpenNewProject,
}: TitleSectionProps) => {
  const TemplateIcon = TEMPLATE_ICONS[activeProject.template]

  return (
    <div className="relative mb-3 border-b border-theme-border/10 pb-3">
      <button
        type="button"
        onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
        className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left transition-colors hover:bg-theme-fg/5"
      >
        <div className="flex items-center gap-2">
          <Logo />
          {open && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.125 }}
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
                {activeProject.name}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-theme-fg/45">
                <span className="font-mono text-[10px]">{activeProject.key}</span>
                <span>·</span>
                <span>Project</span>
              </span>
            </motion.div>
          )}
        </div>
        {open && (
          <FiChevronDown
            className={`mr-2 transition-transform ${isProjectMenuOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {open && isProjectMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-theme-border/15 bg-theme-panel p-1 shadow-[0_16px_30px_-20px_rgba(0,0,0,0.35)]"
        >
          {projects.map((project) => {
            const Icon = TEMPLATE_ICONS[project.template]
            return (
              <button
                key={project.key}
                type="button"
                onClick={() => onSelectProject(project.key)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                  project.key === activeProject.key
                    ? 'bg-black text-white'
                    : 'text-theme-fg hover:bg-theme-fg/5'
                }`}
              >
                <Icon className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">{project.name}</span>
                <span className="font-mono text-[10px] opacity-60">{project.key}</span>
              </button>
            )
          })}
          <div className="my-1 border-t border-theme-border/10" />
          <button
            type="button"
            onClick={onOpenNewProject}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-theme-fg transition-colors hover:bg-theme-fg/5"
          >
            <FiPlus />
            Add New Project
          </button>
        </motion.div>
      )}
    </div>
  )
}

const Logo = () => {
  return (
    <motion.div
      layout
      className="grid size-10 shrink-0 place-content-center rounded-md border border-black bg-black"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 50 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-white"
      >
        <path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z" />
        <path d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z" />
      </svg>
    </motion.div>
  )
}

type ThemeToggleProps = {
  open: boolean
  showPicker: boolean
  setShowPicker: (v: boolean) => void
  themeId: ThemeId
  themes: ThemeConfig[]
  onSelect: (id: ThemeId) => void
}

const ThemeToggle = ({ open, showPicker, setShowPicker, themeId, themes, onSelect }: ThemeToggleProps) => {
  const current = themes.find((t) => t.id === themeId)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="relative flex h-10 w-full items-center overflow-hidden rounded-md px-1 text-xs font-medium text-theme-fg/55 transition-colors hover:bg-theme-fg/5"
      >
        <span className="grid size-10 shrink-0 place-content-center text-lg">
          <FiMonitor className="h-3.5 w-3.5" />
        </span>
        {open && (
          <>
            <span className="flex-1 text-left">Theme</span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: current?.accent ?? '#888' }}
              />
              <span className="text-[10px] uppercase tracking-wider text-theme-fg/40">
                {current?.label ?? 'Light'}
              </span>
            </span>
          </>
        )}
      </button>

      {open && showPicker && (
        <div className="border-t border-theme-border/10 px-2 py-2">
          <div className="grid grid-cols-4 gap-1.5">
            {themes.map((t) => {
              const active = t.id === themeId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelect(t.id)}
                  className={`group relative flex flex-col items-center gap-1 rounded-lg p-1.5 text-[9px] uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-theme-accent text-white shadow-sm'
                      : 'text-theme-fg/50 hover:bg-theme-panel hover:text-theme-fg/80'
                  }`}
                  title={t.label}
                >
                  <span
                    className="inline-block size-4 rounded-full ring-1 ring-inset ring-black/10"
                    style={{ backgroundColor: t.accent }}
                  />
                  <span className="truncate max-w-full leading-tight">{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

type ToggleCloseProps = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onCloseDrawer?: () => void
}

const ToggleClose = ({ open, setOpen, onCloseDrawer }: ToggleCloseProps) => {
  return (
    <motion.button
      layout
      onClick={() => onCloseDrawer ? onCloseDrawer() : setOpen((pv) => !pv)}
      className="border-t border-theme-border/10 transition-colors hover:bg-theme-fg/5"
    >
      <div className="flex items-center p-2">
        <motion.div layout className="grid size-10 place-content-center text-lg">
          <FiChevronsRight className={`transition-transform ${open && 'rotate-180'}`} />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-xs font-medium"
          >
            Hide
          </motion.span>
        )}
      </div>
    </motion.button>
  )
}

export default Sidebar
