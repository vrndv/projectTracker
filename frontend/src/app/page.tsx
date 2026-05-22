"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, Sword } from "lucide-react";
import { useProjects } from "@/hooks/useData";
import { ProjectCard } from "@/components/project/ProjectCard";

type SortKey = "updatedAt" | "fullness" | "totalItems" | "name";

export default function HomePage() {
  const { projects, loading, error, refetch } = useProjects();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("updatedAt");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => {
    let list = [...projects];

    if (search) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      list = list.filter((p) => p.status === statusFilter);
    }

    list.sort((a, b) => {
      if (sort === "updatedAt") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sort === "fullness") return (b.latestSnapshot?.fullness ?? 0) - (a.latestSnapshot?.fullness ?? 0);
      if (sort === "totalItems") return (b.latestSnapshot?.totalItems ?? 0) - (a.latestSnapshot?.totalItems ?? 0);
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [projects, search, sort, statusFilter]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <Sword className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        </div>
        <p className="text-muted-foreground">Live inventory tracking for all Minecraft build projects.</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="updatedAt">Sort: Recent</option>
          <option value="fullness">Sort: Fullness</option>
          <option value="totalItems">Sort: Total items</option>
          <option value="name">Sort: Name</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <button
          onClick={refetch}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg bg-card"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 h-48 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive text-sm">
          Failed to load projects: {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Sword className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No projects found</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
