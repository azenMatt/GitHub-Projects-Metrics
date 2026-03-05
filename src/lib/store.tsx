"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { ProjectData } from "./github/types";
import { ProjectRef, parseProjectUrl } from "./github/parser";
import { fetchProject } from "./github/client";

export interface SavedProject {
  url: string;
  title: string;
}

interface ProjectStore {
  token: string;
  setToken: (t: string) => void;
  clearToken: () => void;
  projectUrl: string;
  setProjectUrl: (u: string) => void;
  projectData: ProjectData | null;
  loading: boolean;
  error: string | null;
  loadProject: (url?: string) => Promise<void>;
  savedProjects: SavedProject[];
  removeSavedProject: (url: string) => void;
}

const StoreContext = createContext<ProjectStore | null>(null);

const PAT_KEY = "gh_projects_metrics_pat";
const SAVED_PROJECTS_KEY = "gh_projects_metrics_saved";

function loadSavedProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(SAVED_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSavedProjects(projects: SavedProject[]) {
  localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(projects));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(PAT_KEY);
    if (saved) setTokenState(saved);
    setSavedProjects(loadSavedProjects());
  }, []);

  const setToken = useCallback((t: string) => {
    setTokenState(t);
    localStorage.setItem(PAT_KEY, t);
  }, []);

  const clearToken = useCallback(() => {
    setTokenState("");
    localStorage.removeItem(PAT_KEY);
  }, []);

  const addSavedProject = useCallback((url: string, title: string) => {
    setSavedProjects((prev) => {
      const filtered = prev.filter((p) => p.url !== url);
      const next = [{ url, title }, ...filtered];
      persistSavedProjects(next);
      return next;
    });
  }, []);

  const removeSavedProject = useCallback((url: string) => {
    setSavedProjects((prev) => {
      const next = prev.filter((p) => p.url !== url);
      persistSavedProjects(next);
      return next;
    });
  }, []);

  const loadProject = useCallback(async (overrideUrl?: string) => {
    const urlToLoad = overrideUrl ?? projectUrl;
    setLoading(true);
    setError(null);
    try {
      let ref: ProjectRef;
      try {
        ref = parseProjectUrl(urlToLoad);
      } catch (e) {
        throw new Error((e as Error).message);
      }
      const data = await fetchProject(token, ref);
      setProjectData(data);
      setProjectUrl(urlToLoad);
      addSavedProject(urlToLoad, data.title);
    } catch (e) {
      setError((e as Error).message);
      setProjectData(null);
    } finally {
      setLoading(false);
    }
  }, [token, projectUrl, addSavedProject]);

  return (
    <StoreContext.Provider
      value={{
        token,
        setToken,
        clearToken,
        projectUrl,
        setProjectUrl,
        projectData,
        loading,
        error,
        loadProject,
        savedProjects,
        removeSavedProject,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): ProjectStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
