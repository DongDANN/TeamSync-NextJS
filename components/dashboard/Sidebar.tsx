'use client';

import { useState } from "react";
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
} from "react-icons/fi";
import { motion } from "framer-motion";

export type SectionKey = "Summary" | "Backlog" | "Board" | "Code" | "Timeline" | "Pages" | "Forms";

type SidebarProps = {
  selected?: SectionKey;
  setSelected?: (section: SectionKey) => void;
};

type OptionProps = {
  Icon: React.ComponentType<{ className?: string }>;
  title: SectionKey;
  selected: SectionKey;
  setSelected: (title: SectionKey) => void;
  open: boolean;
  notifs?: number;
};

const Sidebar = ({ selected: controlledSelected, setSelected: controlledSetSelected }: SidebarProps) => {
  const [open, setOpen] = useState(true);
  const [internalSelected, setInternalSelected] = useState<SectionKey>("Summary");
  const [projects, setProjects] = useState([
    "TeamSync",
    "Website Revamp",
    "Mobile App",
  ]);
  const [activeProject, setActiveProject] = useState("TeamSync");
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const selected = controlledSelected ?? internalSelected;
  const setSelected = controlledSetSelected ?? setInternalSelected;

  const handleSelectProject = (projectName: string) => {
    setActiveProject(projectName);
    setIsProjectMenuOpen(false);
  };

  const handleAddProject = () => {
    const projectName = `New Project ${projects.length + 1}`;
    setProjects((prev) => [...prev, projectName]);
    setActiveProject(projectName);
    setIsProjectMenuOpen(false);
  };

  return (
    <motion.nav
      layout
      className="sticky top-0 z-20 h-screen shrink-0 overflow-hidden border-r border-black/10 bg-white p-3"
      style={{
        width: open ? "225px" : "fit-content",
      }}
    >
      <TitleSection
        open={open}
        activeProject={activeProject}
        projects={projects}
        isProjectMenuOpen={isProjectMenuOpen}
        setIsProjectMenuOpen={setIsProjectMenuOpen}
        onSelectProject={handleSelectProject}
        onAddProject={handleAddProject}
      />

      <div className="space-y-1">
        <Option Icon={FiHome} title="Summary" selected={selected} setSelected={setSelected} open={open} />
        <Option Icon={FiList} title="Backlog" selected={selected} setSelected={setSelected} open={open} />
        <Option
          Icon={FiColumns}
          title="Board"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option Icon={FiCode} title="Code" selected={selected} setSelected={setSelected} open={open} />
        <Option
          Icon={FiClock}
          title="Timeline"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={FiFileText}
          title="Pages"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={FiClipboard}
          title="Forms"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </motion.nav>
  );
};

const Option = ({ Icon, title, selected, setSelected, open, notifs }: OptionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = selected === title;

  return (
    <motion.button
      layout
      onClick={() => setSelected(title)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex h-10 w-full items-center overflow-hidden rounded-md px-1 transition-colors ${isActive ? "text-white" : "text-black/55"}`}
    >
      <motion.span
        initial={false}
        animate={{
          scaleX: isActive || isHovered ? 1 : 0,
          opacity: isActive || isHovered ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="absolute inset-0 z-0 origin-left rounded-md bg-black"
      />
      <motion.div
        layout
        className={`relative z-10 grid h-full w-10 place-content-center text-lg transition-colors ${isActive || isHovered ? "text-white" : "text-black/55"}`}
      >
        <Icon />
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.125 }}
          className={`relative z-10 text-xs font-medium transition-colors ${isActive || isHovered ? "text-white" : "text-black/75"}`}
        >
          {title}
        </motion.span>
      )}

      {notifs && open && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          style={{ y: "-50%" }}
          transition={{ delay: 0.5 }}
          className="absolute right-2 top-1/2 z-10 grid size-5 place-content-center rounded-full bg-white text-[10px] font-medium text-black"
        >
          {notifs}
        </motion.span>
      )}
    </motion.button>
  );
};

type TitleSectionProps = {
  open: boolean;
  activeProject: string;
  projects: string[];
  isProjectMenuOpen: boolean;
  setIsProjectMenuOpen: (open: boolean) => void;
  onSelectProject: (project: string) => void;
  onAddProject: () => void;
};

const TitleSection = ({
  open,
  activeProject,
  projects,
  isProjectMenuOpen,
  setIsProjectMenuOpen,
  onSelectProject,
  onAddProject,
}: TitleSectionProps) => {
  return (
    <div className="relative mb-3 border-b border-black/10 pb-3">
      <button
        type="button"
        onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
        className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left transition-colors hover:bg-black/5"
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
              <span className="block text-xs font-semibold uppercase tracking-[0.18em]">{activeProject}</span>
              <span className="block text-[11px] text-black/45">Project</span>
            </motion.div>
          )}
        </div>
        {open && (
          <FiChevronDown
            className={`mr-2 transition-transform ${isProjectMenuOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && isProjectMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-black/15 bg-white p-1 shadow-[0_16px_30px_-20px_rgba(0,0,0,0.35)]"
        >
          {projects.map((project) => (
            <button
              key={project}
              type="button"
              onClick={() => onSelectProject(project)}
              className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${project === activeProject ? "bg-black text-white" : "text-black hover:bg-black/5"}`}
            >
              {project}
            </button>
          ))}
          <div className="my-1 border-t border-black/10" />
          <button
            type="button"
            onClick={onAddProject}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-black transition-colors hover:bg-black/5"
          >
            <FiPlus />
            Add New Project
          </button>
        </motion.div>
      )}
    </div>
  );
};

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
  );
};

type ToggleCloseProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ToggleClose = ({ open, setOpen }: ToggleCloseProps) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen((pv) => !pv)}
      className="absolute bottom-0 left-0 right-0 border-t border-black/10 transition-colors hover:bg-black/5"
    >
      <div className="flex items-center p-2">
        <motion.div layout className="grid size-10 place-content-center text-lg">
          <FiChevronsRight className={`transition-transform ${open && "rotate-180"}`} />
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
  );
};

export default Sidebar;
