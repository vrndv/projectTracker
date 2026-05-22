"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Project } from "@/types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const data = await api.get<Project[]>("/api/projects");
      setProjects(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { projects, loading, error, refetch: fetch };
}

export function useProject(slug: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const data = await api.get<Project>(`/api/projects/${slug}`);
      setProject(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { project, loading, error, refetch: fetch };
}

export function useSnapshots(slug: string) {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>(`/api/projects/${slug}/snapshots?limit=48`)
      .then(setSnapshots)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  return { snapshots, loading };
}

export function useGoals(slug: string) {
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    api.get<any[]>(`/api/projects/${slug}/goals`)
      .then(setGoals)
      .catch(console.error);
  }, [slug]);

  return { goals, setGoals };
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ user: any }>("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await api.post("/auth/logout", {});
    setUser(null);
  };

  return { user, loading, logout };
}
