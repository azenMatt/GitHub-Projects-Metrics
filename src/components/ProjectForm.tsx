"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

export default function ProjectForm() {
  const {
    token, setToken, projectUrl, setProjectUrl,
    loading, error, loadProject,
    savedProjects, removeSavedProject,
  } = useStore();
  const [showNewUrl, setShowNewUrl] = useState(savedProjects.length === 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadProject();
  };

  const handleSelectSaved = async (url: string) => {
    setProjectUrl(url);
    await loadProject(url);
  };

  return (
    <div className="w-full space-y-5">
      {/* Saved projects */}
      {savedProjects.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
            Recent Projects
          </label>
          <div className="space-y-1.5">
            {savedProjects.map((project) => (
              <div
                key={project.url}
                className="group flex items-center gap-2"
              >
                <button
                  onClick={() => handleSelectSaved(project.url)}
                  disabled={loading}
                  className="flex-1 flex items-center gap-3 px-3 py-2.5 text-left bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all duration-150 disabled:opacity-40"
                >
                  <div className="w-5 h-5 rounded-md bg-[var(--accent-muted)] flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M2 4.5L8 1.5L14 4.5V11.5L8 14.5L2 11.5V4.5Z" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSavedProject(project.url);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-[var(--text-tertiary)] hover:text-red-400 transition-all"
                  title="Remove"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New URL form */}
      {showNewUrl || savedProjects.length === 0 ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {savedProjects.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-[var(--border)]" />
              <span className="text-xs text-[var(--text-tertiary)]">or add new</span>
              <div className="flex-1 border-t border-[var(--border)]" />
            </div>
          )}
          <div>
            <label htmlFor="projectUrl" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
              Project URL
            </label>
            <input
              id="projectUrl"
              type="url"
              required
              placeholder="https://github.com/orgs/my-org/projects/1"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="token" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
              Personal Access Token
            </label>
            <input
              id="token"
              type="password"
              required
              placeholder="ghp_... or github_pat_..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
            />
            <p className="mt-2 text-xs text-[var(--text-tertiary)] leading-relaxed">
              Classic PAT: <code className="text-[var(--text-secondary)]">project</code> + <code className="text-[var(--text-secondary)]">repo</code> scopes.
              Fine-grained: Organization projects → Read.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading project...
              </span>
            ) : (
              "Connect project"
            )}
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowNewUrl(true)}
          className="w-full py-2 px-4 text-sm font-medium text-[var(--text-secondary)] border border-dashed border-[var(--border)] rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-150"
        >
          + Add new project
        </button>
      )}

      {/* Loading indicator for saved project clicks */}
      {loading && !showNewUrl && savedProjects.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-[var(--text-tertiary)]">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading project...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs whitespace-pre-line leading-relaxed">
          {error}
        </div>
      )}
    </div>
  );
}
