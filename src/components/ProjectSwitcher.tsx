"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function ProjectSwitcher() {
  const { projectData, savedProjects, loadProject, loading, projectUrl, setProjectUrl, clearToken } = useStore();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const otherProjects = savedProjects.filter(
    (p) => p.url !== projectUrl
  );

  const handleAddProject = async () => {
    if (!newUrl.trim()) return;
    setOpen(false);
    setAdding(false);
    setNewUrl("");
    await loadProject(newUrl.trim());
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 -ml-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
        title="Switch project"
      >
        <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </div>
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {projectData?.title ?? "Select project"}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          className={`text-[var(--text-tertiary)] transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-50">
          {/* Current project */}
          {projectData && (
            <div className="px-3 py-2.5 border-b border-[var(--border)] bg-[var(--accent-muted)]">
              <div className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider mb-1">
                Current project
              </div>
              <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                {projectData.title}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] truncate">
                {projectUrl}
              </div>
            </div>
          )}

          {/* Other saved projects */}
          {otherProjects.length > 0 && (
            <>
              <div className="px-3 pt-2 pb-1">
                <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  Saved projects
                </span>
              </div>
              <div className="py-1 max-h-48 overflow-y-auto">
                {otherProjects.map((project) => (
                  <button
                    key={project.url}
                    onClick={async () => {
                      setOpen(false);
                      await loadProject(project.url);
                    }}
                    disabled={loading}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[var(--hover-bg)] transition-colors disabled:opacity-40"
                  >
                    <div className="w-5 h-5 rounded-md bg-[var(--hover-bg)] flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" fill="var(--text-tertiary)"/>
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {project.title}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] truncate">
                        {project.url}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Add new project */}
          <div className="border-t border-[var(--border)]">
            {adding ? (
              <form
                onSubmit={(e) => { e.preventDefault(); handleAddProject(); }}
                className="p-3 flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://github.com/orgs/…/projects/…"
                  className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                />
                <button
                  type="submit"
                  disabled={loading || !newUrl.trim()}
                  className="px-3 py-1.5 text-xs font-medium bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Load
                </button>
              </form>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-[var(--hover-bg)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[var(--accent)]">
                  <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-sm font-medium text-[var(--accent)]">
                  Add project
                </span>
              </button>
            )}
          </div>
          {/* Forget token */}
          <div className="border-t border-[var(--border)]">
            <button
              onClick={() => {
                setOpen(false);
                clearToken();
                router.push("/");
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-red-500/10 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-red-400">
                <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-medium text-red-400">
                Forget token
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
