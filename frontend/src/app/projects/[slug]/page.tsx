// frontend/src/app/projects/[slug]/page.tsx
"use client";

import { useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapPin, ExternalLink, Users, ArrowLeft, RefreshCw,
  Target, Zap, MessageSquare, Package, BarChart2, Image as ImageIcon,
  Video, Navigation
} from "lucide-react";
import { useProject, useSnapshots, useGoals, useAuth } from "@/hooks/useData";
import { cn, statusColor, formatNumber, fullnessBg } from "@/lib/utils";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

import { InventoryTable } from "@/components/project/InventoryTable";
import { GoalsProgress } from "@/components/project/GoalsProgress";
import { SnapshotCharts } from "@/components/charts/SnapshotCharts";
import { MinecraftItem } from "@/components/project/MinecraftItem";

import {
  GoalsTab, UpdatesTab, CommentsTab, MediaTab, MembersTab
} from "@/components/project/ProjectTabs";

function bluemapUrl(world: string | undefined, x: number, y: number, z: number) {
  const w = world ?? "world";
  return `https://varundev.tech/minnal-map/#${w}:${Math.round(x)}:${Math.round(y)}:${Math.round(z)}:150:0:0:0:0:perspective`;
}

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { project, loading, error, refetch: refetchProject } = useProject(slug);
  const { snapshots } = useSnapshots(slug);
  const { goals } = useGoals(slug);
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
    world: "",
    x: "",
    y: "",
    z: "",
    videoUrl: "",
    mapUrl: "",
    thumbnailUrl: "",
  });

  if (!slug || slug === "undefined") {
    return <div className="h-64 flex items-center justify-center animate-pulse">Loading...</div>;
  }

  const canEdit = user && ["ADMIN", "BUILDER", "MEMBER"].includes(user.role);
  const canDelete = user && ["ADMIN", "BUILDER"].includes(user.role);

  const handleSave = async () => {
    try {
      const payload: any = {
        name: editData.name,
        description: editData.description,
        status: editData.status,
        world: editData.world || null,
        videoUrl: editData.videoUrl || null,
        mapUrl: editData.mapUrl || null,
        thumbnailUrl: editData.thumbnailUrl || null,
        x: editData.x !== "" ? parseFloat(editData.x) : null,
        y: editData.y !== "" ? parseFloat(editData.y) : null,
        z: editData.z !== "" ? parseFloat(editData.z) : null,
      };
      await api.patch(`/api/projects/${slug}`, payload);
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

  const snap = project.latestSnapshot;
  const fullness = snap?.fullness ?? 0;
  const recentUpdates = (project.updates || []).slice(0, 3);
  const recentComments = (project.comments || []).slice(0, 3);
  const hasCoords = project.x !== undefined && project.x !== null;

  if (activeTab) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveTab(null)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {project.name}
        </button>

        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          {activeTab === "Goals" && <GoalsTab slug={slug} goals={goals} user={user} refetch={refetchProject} />}
          {activeTab === "Updates" && <UpdatesTab slug={slug} updates={project.updates || []} user={user} refetch={refetchProject} />}
          {activeTab === "Comments" && <CommentsTab slug={slug} comments={project.comments || []} user={user} refetch={refetchProject} />}
          {activeTab === "Media" && <MediaTab slug={slug} media={project.media || []} user={user} refetch={refetchProject} />}
          {activeTab === "Members" && <MembersTab slug={slug} members={project.members || []} user={user} refetch={refetchProject} />}
          {activeTab === "History" && snapshots.length > 1 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-primary" /> Snapshot History
              </h2>
              <SnapshotCharts snapshots={snapshots} />
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All projects
      </Link>

      {/* ─── HEADER CARD ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        {project.thumbnailUrl && (
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="w-full h-36 object-cover border-b border-border"
          />
        )}

        <div className="p-5 space-y-4">
          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold capitalize">{project.name}</h1>
                <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", statusColor(project.status))}>
                  {project.status.toLowerCase()}
                </span>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refetchProject}
                className="p-2 text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {canEdit && (
                <button
                  onClick={() => {
                    setEditData({
                      name: project.name,
                      description: project.description || "",
                      status: project.status,
                      world: project.world || "",
                      x: project.x !== null && project.x !== undefined ? String(project.x) : "",
                      y: project.y !== null && project.y !== undefined ? String(project.y) : "",
                      z: project.z !== null && project.z !== undefined ? String(project.z) : "",
                      videoUrl: project.videoUrl || "",
                      mapUrl: project.mapUrl || "",
                      thumbnailUrl: project.thumbnailUrl || "",
                    });
                    setIsEditing(!isEditing);
                  }}
                  className="text-sm px-3 py-1.5 bg-muted border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="text-sm px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {project.world && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {project.world}
              </span>
            )}
            {hasCoords && (
              <a
                href={bluemapUrl(project.world, project.x!, project.y ?? 64, project.z ?? 0)}
                target="_blank"
                rel="noopener noreferrer"
                title="View on Bluemap"
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                {Math.round(project.x!)}, {Math.round(project.y ?? 64)}, {Math.round(project.z ?? 0)}
              </a>
            )}
            {project.members.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {project.members.length} members
              </span>
            )}
            {project.videoUrl && (
              <a
                href={project.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Video className="w-3.5 h-3.5" /> Video
              </a>
            )}
            {project.mapUrl && (
              <a
                href={project.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Map
              </a>
            )}
          </div>

          {/* Stat boxes */}
          {snap && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Items", value: formatNumber(snap.totalItems) },
                { label: "Types", value: snap.uniqueItems },
                { label: "Containers", value: snap.containers },
                { label: "Fullness", value: `${fullness.toFixed(1)}%` },
              ].map((s) => (
                <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Fullness bar */}
          {snap && (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Storage fullness</span>
                <span>{fullness.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", fullnessBg(fullness))}
                  style={{ width: `${fullness}%` }}
                />
              </div>
            </div>
          )}

          {/* Edit form */}
          {isEditing && (
            <div className="mt-2 p-4 border border-border bg-muted/30 rounded-xl space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Basic Info</p>
              <input
                type="text"
                value={editData.name}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Project Name"
              />
              <textarea
                value={editData.description}
                onChange={e => setEditData({ ...editData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Description"
                rows={3}
              />
              <select
                value={editData.status}
                onChange={e => setEditData({ ...editData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAUSED">PAUSED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">Location</p>
              <input
                type="text"
                value={editData.world}
                onChange={e => setEditData({ ...editData, world: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="World (e.g. world, world_nether)"
              />
              <div className="grid grid-cols-3 gap-2">
                {(["x", "y", "z"] as const).map(axis => (
                  <div key={axis}>
                    <label className="text-xs text-muted-foreground mb-1 block uppercase">{axis}</label>
                    <input
                      type="number"
                      value={editData[axis]}
                      onChange={e => setEditData({ ...editData, [axis]: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">Media & Links</p>
              <input
                type="url"
                value={editData.thumbnailUrl}
                onChange={e => setEditData({ ...editData, thumbnailUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Thumbnail URL"
              />
              <input
                type="url"
                value={editData.videoUrl}
                onChange={e => setEditData({ ...editData, videoUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Video URL (YouTube, etc.)"
              />
              <input
                type="url"
                value={editData.mapUrl}
                onChange={e => setEditData({ ...editData, mapUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Map URL"
              />

              <button
                onClick={handleSave}
                className="w-full py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── MAIN CONTENT GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT: Goals + Inventory (spans 2 cols) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Goals */}
          {goals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Resource Goals
                </h2>
                <button
                  onClick={() => setActiveTab("Goals")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Manage →
                </button>
              </div>
              <div className="p-5">
                <GoalsProgress goals={goals} />
              </div>
            </motion.div>
          )}

          {/* Live Inventory */}
          {snap && snap.items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" /> Live Inventory
                </h2>
                <span className="text-xs text-muted-foreground">
                  {snap.uniqueItems} types · {formatNumber(snap.totalItems)} items
                </span>
              </div>
              <div className="p-5">
                <InventoryTable
                  items={snap.items.map(item => ({
                    name: item.material,
                    count: item.amount
                  }))}
                />
              </div>
            </motion.div>
          )}

          {/* Snapshot history (compact) */}
          {snapshots.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" /> History
                </h2>
                <button
                  onClick={() => setActiveTab("History")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Full view →
                </button>
              </div>
              <div className="p-5">
                <SnapshotCharts snapshots={snapshots} compact />
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Activity sidebar */}
        <div className="space-y-4">

          {/* Members — always shown */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Team
              </h2>
              <button
                onClick={() => setActiveTab("Members")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Manage →
              </button>
            </div>
            {project.members.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground">No members yet.</p>
            ) : (
              <div className="p-3 flex flex-wrap gap-2">
                {project.members.slice(0, 8).map((m) => (
                  <div
                    key={m.id}
                    title={`${m.user.username} · ${m.role}`}
                    className="flex items-center gap-2 px-2.5 py-1.5 bg-muted/50 rounded-lg border border-border text-xs"
                  >
                    {m.user.avatar ? (
                      <img src={m.user.avatar} className="w-5 h-5 rounded-full" alt="" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                        {m.user.username[0].toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{m.user.username}</span>
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider">{m.role}</span>
                  </div>
                ))}
                {project.members.length > 8 && (
                  <span className="text-xs text-muted-foreground self-center px-1">
                    +{project.members.length - 8} more
                  </span>
                )}
              </div>
            )}
          </motion.div>

          {/* Updates — always shown */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Recent Updates
              </h2>
              <button
                onClick={() => setActiveTab("Updates")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {recentUpdates.length > 0 ? `All ${project.updates?.length} →` : "Post one →"}
              </button>
            </div>
            {recentUpdates.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground">No updates yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {recentUpdates.map((update) => (
                  <div key={update.id} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                        {update.author.username[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-medium">{update.author.username}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-snug">{update.title}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Comments — always shown */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> Comments
              </h2>
              <button
                onClick={() => setActiveTab("Comments")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {recentComments.length > 0 ? `All ${project.comments?.length} →` : "Add one →"}
              </button>
            </div>
            {recentComments.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground">No comments yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {recentComments.map((c) => (
                  <div key={c.id} className="px-4 py-3 flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {c.author.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium">{c.author.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Media — always shown */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" /> Media
              </h2>
              <button
                onClick={() => setActiveTab("Media")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {project.media && project.media.length > 0 ? `All ${project.media.length} →` : "Add media →"}
              </button>
            </div>
            {!project.media || project.media.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground">No media added yet.</p>
            ) : (
              <div className="p-3 grid grid-cols-3 gap-2">
                {project.media.slice(0, 6).filter(m => m.type === "IMAGE").map((m) => (
                  <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={m.url}
                      alt=""
                      className="w-full aspect-square object-cover rounded-lg border border-border hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}