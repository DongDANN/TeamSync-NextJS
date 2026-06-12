'use client';

import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiLogOut, FiSearch, FiSettings, FiUser, FiX } from "react-icons/fi";
import { motion } from "motion/react";
import AnimatedButton from "@/components/ui/AnimatedButton";

type HeaderDashboardProps = {
  title?: string;
  userName?: string;
};

type DropdownItemProps = {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick?: () => void;
};

const DropdownItem = ({ icon: Icon, children, onClick }: DropdownItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-left text-sm"
    >
      <motion.span
        initial={false}
        animate={{ scaleX: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="absolute inset-0 z-0 origin-left rounded-xl bg-black"
      />
      <span
        className={`relative z-10 transition-colors duration-200 ${isHovered ? "text-white" : "text-black"}`}
      >
        <Icon />
      </span>
      <span
        className={`relative z-10 transition-colors duration-200 ${isHovered ? "text-white" : "text-black"}`}
      >
        {children}
      </span>
    </button>
  );
};

export default function HeaderDashboard({ title = "Dashboard", userName = "Admin User" }: HeaderDashboardProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuMobileRef = useRef<HTMLDivElement>(null);
  const menuDesktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const inMobile = menuMobileRef.current?.contains(event.target as Node);
      const inDesktop = menuDesktopRef.current?.contains(event.target as Node);
      if (inMobile || inDesktop) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AU";

  return (
    <header className="flex flex-col gap-3 border-b border-black/10 bg-white px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-4">
      {/* Row 1 on mobile: title left, profile right */}
      <div className="flex min-w-0 items-center justify-between gap-2 lg:w-1/4 lg:justify-start">
        <h1 className="truncate text-xl font-bold uppercase tracking-[0.12em] text-black sm:text-2xl">
          {title}
        </h1>

        {/* Profile — only visible on mobile/tablet, hidden on lg */}
        <div className="relative shrink-0 lg:hidden" ref={menuMobileRef}>
          <AnimatedButton
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="h-10 gap-1.5 border! border-black px-2 py-0 text-sm font-semibold normal-case tracking-normal"
            textClassName="flex items-center gap-1.5"
          >
            <span className="grid size-7 shrink-0 place-content-center rounded-full border border-black bg-white text-[11px] font-semibold text-black">
              {initials}
            </span>
            <FiChevronDown className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
          </AnimatedButton>

          {open && (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-56 rounded-2xl border border-black bg-white p-2 shadow-[0_18px_45px_-24px_rgba(0,0,0,0.45)]">
              <DropdownItem icon={FiUser}>My Profile</DropdownItem>
              <DropdownItem icon={FiSettings}>Settings</DropdownItem>
              <DropdownItem icon={FiLogOut}>Sign Out</DropdownItem>
            </div>
          )}
        </div>
      </div>

      {/* Row 2 on mobile: search full width */}
      <div className="lg:flex lg:w-2/4 lg:justify-center">
        <label className="relative block w-full max-w-xl min-w-0">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-black/40">
            <FiSearch />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search team members, tasks, or projects"
            className="h-11 w-full rounded-full border border-black/15 bg-white pl-11 pr-11 text-sm text-black outline-none transition focus:border-black"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-black/45 transition hover:text-black"
            >
              <FiX />
            </button>
          )}
        </label>
      </div>

      {/* Profile — desktop only */}
      <div className="hidden justify-end lg:flex lg:w-1/4">
        <div className="relative" ref={menuDesktopRef}>
          <AnimatedButton
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="h-11 min-w-44 justify-between gap-2 border! border-black px-2.5 py-0 text-sm font-semibold normal-case tracking-normal"
            textClassName="flex w-full items-center justify-between gap-2"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="grid size-7 shrink-0 place-content-center rounded-full border border-black bg-white text-[11px] font-semibold text-black">
                {initials}
              </span>
              <span className="truncate text-sm">{userName}</span>
            </span>
            <FiChevronDown className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
          </AnimatedButton>

          {open && (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-56 rounded-2xl border border-black bg-white p-2 shadow-[0_18px_45px_-24px_rgba(0,0,0,0.45)]">
              <DropdownItem icon={FiUser}>My Profile</DropdownItem>
              <DropdownItem icon={FiSettings}>Settings</DropdownItem>
              <DropdownItem icon={FiLogOut}>Sign Out</DropdownItem>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
