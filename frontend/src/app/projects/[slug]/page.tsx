// frontend/src/app/projects/[slug]/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, ExternalLink, Users, ArrowLeft, RefreshCw } from "lucide-react";
import { useProject, useSnapshots, useGoals, useAuth } from "@/hooks/useData";
import { cn, statusColor } from "@/lib/utils";
import { api } from "@/lib/api";

// Import the tabs we will create in the next file
import { 
  OverviewTab, GoalsTab, UpdatesTab, CommentsTab, MediaTab, MembersTab 
} from "@/components/project/ProjectTabs";

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  const { project, loading, error, refetch: refetchProject } = useProject(slug);
  const { snapshots } = useSnapshots(slug);
  const { goals } = useGoals(slug);
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", description: "", status: "ACTIVE" });

  // Safety check to prevent API calls with "undefined" on initial render
  if (!slug || slug === "undefined") {
    return <div className="h-64 flex items-center justify-center animate-pulse">Loading...</div>;
  }

  const canEdit = user && ["ADMIN", "BUILDER", "MEMBER"].includes(user.role);
  const canDelete = user && ["ADMIN", "BUILDER"].includes(user.role);

  const handleSave = async () => {
    try {
      await api.patch(`/api/projects/${slug}`, editData);
      setIsEditing(false);
      refetchProject();
    } catch (e: any) {
      alert("Failed to update: " + e.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${project?.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/projects/${slug}`);
      window.location.href = "/";
    } catch (e: any) {
      alert("Failed to delete: " + e.message);
    }
  };

  if (loading) return <div className="h-64 bg-card rounded-xl animate-pulse" />;
  
  if (error || !project) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive">Project not found</p>
        <Link href="/" className="text-sm text-primary mt-2 inline-block">← Back to projects</Link>
      </div>
    );
  }

  const tabs = ["Overview", "Goals", "Updates", "Comments", "Media", "Members"];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        All projects
      </Link>

      {/* Header Profile */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6">
        {project.thumbnailUrl && (
          <img src={project.thumbnailUrl} alt={project.name} className="w-full h-40 object-cover rounded-lg mb-4 border border-border" />
        )}

        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold capitalize">{project.name}</h1>
              <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", statusColor(project.status))}>
                {project.status.toLowerCase()}
              </span>
            </div>
            {project.description && <p className="text-muted-foreground">{project.description}</p>}
          </div>
          <button onClick={refetchProject} className="p-2 text-muted-foreground hover:text-foreground border border-border rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          {project.world && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {project.world} {project.x !== undefined && `(${Math.round(project.x)}, ${Math.round(project.y ?? 64)}, ${Math.round(project.z ?? 0)})`}
            </span>
          )}
          {project.members.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {project.members.length} Members
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {project.mapUrl && (
            <a href={project.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Open Map
            </a>
          )}
          
          {canEdit && (
            <button onClick={() => { setEditData({ name: project.name, description: project.description || "", status: project.status }); setIsEditing(!isEditing); }} className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-muted border border-border rounded-lg hover:bg-accent transition-colors">
              {isEditing ? "Cancel Edit" : "Edit Project"}
            </button>
          )}

          {canDelete && (
            <button onClick={handleDelete} className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors">
              Delete Project
            </button>
          )}
        </div>

        {isEditing && (
          <div className="mt-6 p-4 border border-border bg-muted/30 rounded-xl space-y-4">
            <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Project Name" />
            <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Description" />
            <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})} className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="ACTIVE">ACTIVE</option>
              <option value="PAUSED">PAUSED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
            <button onClick={handleSave} className="w-full py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Save Changes</button>
          </div>
        )}
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-border overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {tab}
            {tab === "Updates" && project.updates?.length ? ` (${project.updates.length})` : ""}
            {tab === "Comments" && project.comments?.length ? ` (${project.comments.length})` : ""}
          </button>
        ))}
      </div>

      {/* Tab Content Panels */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "Overview" && <OverviewTab project={project} snapshots={snapshots} />}
        {activeTab === "Goals" && <GoalsTab slug={slug} goals={goals} user={user} refetch={refetchProject} />}
        {activeTab === "Updates" && <UpdatesTab slug={slug} updates={project.updates || []} user={user} refetch={refetchProject} />}
        {activeTab === "Comments" && <CommentsTab slug={slug} comments={project.comments || []} user={user} refetch={refetchProject} />}
        {activeTab === "Media" && <MediaTab slug={slug} media={project.media || []} user={user} refetch={refetchProject} />}
        {activeTab === "Members" && <MembersTab slug={slug} members={project.members || []} user={user} refetch={refetchProject} />}
      </motion.div>
    </div>
  );
}