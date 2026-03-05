"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ReportNav from "@/components/ReportNav";
import ThemeToggle from "@/components/ThemeToggle";
import ProjectSwitcher from "@/components/ProjectSwitcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { projectData, loading } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!projectData) {
      router.push("/");
    }
  }, [projectData, router]);

  if (!projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-tertiary)]">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--background)] sticky top-0 z-10">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ProjectSwitcher />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[var(--text-tertiary)] mr-2">
              {projectData.items.length} items
            </span>
            <ThemeToggle />
          </div>
        </div>
        <div className="px-6">
          <ReportNav />
        </div>
      </header>
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full relative">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-lg">
              <svg className="animate-spin h-4 w-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-medium text-[var(--text-secondary)]">Loading project…</span>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
