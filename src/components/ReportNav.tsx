"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    label: "Burndown",
    href: "/dashboard/burndown",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M2 3V13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10L8 6L10.5 8.5L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Velocity",
    href: "/dashboard/velocity",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="8" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="6.5" y="5" width="3" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="3" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Cycle Time",
    href: "/dashboard/cycle-time",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.5V8L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Bugs",
    href: "/dashboard/bugs",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="9" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 5.5L5 3M10 5.5L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 8H1.5M14.5 8H13M3.5 11.5L2 12.5M12.5 11.5L14 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Throughput",
    href: "/dashboard/throughput",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M2 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 10V13M6 7V13M9 8V13M12 5V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 6L6 3.5L9 5L13 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Aging WIP",
    href: "/dashboard/aging-wip",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M2 4H10M2 8H13M2 12H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="13" cy="4" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Flow",
    href: "/dashboard/cfd",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M2 12C4 12 5 9 8 9C11 9 12 6 14 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2 14C4 14 5 11 8 11C11 11 12 8 14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2 10C4 10 5 7 8 7C11 7 12 4 14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Initiatives",
    href: "/dashboard/initiatives",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="1" width="5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="10" y="6" width="5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="10" y="11" width="5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6 5H8.5C9 5 9.5 4 10 2.5M6 5H8.5C9 5 9.5 6 10 7.5M6 5H8.5C9 5 9.5 8 10 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function ReportNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-0.5 -mb-px">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 transition-all duration-150 ${
              active
                ? "border-[var(--accent)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <span className={active ? "text-[var(--accent)]" : ""}>{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
