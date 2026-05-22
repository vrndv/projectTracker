// frontend/src/components/project/ProjectTabs.tsx
"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { api } from "@/lib/api";
import { Package, Layers, Database, BarChart2, Target, MessageSquare, Image, ExternalLink, Plus, Send } from "lucide-react";
import { cn, formatNumber, fullnessBg } from "@/lib/utils";
import { InventoryTable } from "./InventoryTable";
import { GoalsProgress } from "./GoalsProgress";
import { SnapshotCharts } from "../charts/SnapshotCharts";
import type { Project, ProjectGoal, ProjectUpdate, ProjectComment, ProjectMedia, ProjectMember, User } from "@/types";

interface TabProps {
  slug: string;
  user: User | null;
  refetch: () => void;
}

// ---------------------------
// 1. OVERVIEW TAB
// ---------------------------
export function OverviewTab({ project, snapshots }: { project: Project, snapshots: any[] }) {
  const snap = project.latestSnapshot;
  const fullness = snap?.fullness ?? 0;

  return (
    <div className="space-y-6">
      {snap && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Package className="w-4 h-4" />, label: "Items", value: formatNumber(snap.totalItems) },
              { icon: <Layers className="w-4 h-4" />, label: "Types", value: snap.uniqueItems },
              { icon: <Database className="w-4 h-4" />, label: "Containers", value: snap.containers },
              { icon: <BarChart2 className="w-4 h-4" />, label: "Fullness", value: `${fullness.toFixed(1)}%` },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">{s.icon} {s.label}</div>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Storage fullness</span>
              <span className="font-medium">{fullness.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", fullnessBg(fullness))} style={{ width: `${fullness}%` }} />
            </div>
          </div>

          {snap.items.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-4"><Package className="w-4 h-4 text-primary"/> Live Inventory</h2>
              <InventoryTable items={snap.items} />
            </div>
          )}
        </>
      )}

      {snapshots.length > 1 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold flex items-center gap-2 mb-4"><BarChart2 className="w-4 h-4 text-primary"/> History</h2>
          <SnapshotCharts snapshots={snapshots} />
        </div>
      )}
    </div>
  );
}

// ---------------------------
// 2. GOALS TAB
// ---------------------------
export function GoalsTab({ slug, goals, user, refetch }: TabProps & { goals: ProjectGoal[] }) {
  const [material, setMaterial] = useState("");
  const [amount, setAmount] = useState("");
  const canManage = user && ["ADMIN", "BUILDER"].includes(user.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/projects/${slug}/goals`, { material, requiredAmount: parseInt(amount) });
      setMaterial(""); setAmount("");
      refetch();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      {canManage && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Material Name (e.g. iron_ingot)</label>
            <input required type="text" value={material} onChange={e => setMaterial(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="w-32">
            <label className="text-xs text-muted-foreground mb-1 block">Amount Target</label>
            <input required type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">Set Goal</button>
        </form>
      )}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-4"><Target className="w-4 h-4 text-primary"/> Resource Goals</h2>
        <GoalsProgress goals={goals} />
      </div>
    </div>
  );
}

// ---------------------------
// 3. UPDATES TAB
// ---------------------------
export function UpdatesTab({ slug, updates, user, refetch }: TabProps & { updates: ProjectUpdate[] }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const canPost = user && ["ADMIN", "BUILDER", "MEMBER"].includes(user.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/projects/${slug}/updates`, { title, content });
      setTitle(""); setContent("");
      refetch();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      {canPost && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input required type="text" placeholder="Update Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" />
          <textarea required placeholder="Write your update... (Markdown supported)" value={content} onChange={e => setContent(e.target.value)} rows={3} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" />
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2">
            <Send className="w-4 h-4"/> Post Update
          </button>
        </form>
      )}

      <div className="space-y-4">
        {updates.length === 0 ? <p className="text-muted-foreground text-sm">No updates posted yet.</p> : updates.map((update) => (
          <div key={update.id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{update.author.username[0]}</div>
              <div>
                <p className="text-sm font-medium">{update.author.username}</p>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{update.title}</h3>
            <div className="prose prose-sm prose-invert max-w-none text-muted-foreground"><ReactMarkdown>{update.content}</ReactMarkdown></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------
// 4. COMMENTS TAB
// ---------------------------
export function CommentsTab({ slug, comments, user, refetch }: TabProps & { comments: ProjectComment[] }) {
  const [content, setContent] = useState("");
  const canPost = user && ["ADMIN", "BUILDER", "MEMBER"].includes(user.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/projects/${slug}/comments`, { content });
      setContent(""); refetch();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      {canPost && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input required type="text" placeholder="Add a comment..." value={content} onChange={e => setContent(e.target.value)} className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-primary" />
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">Post</button>
        </form>
      )}

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        {comments.length === 0 ? <p className="text-muted-foreground text-sm">No comments yet.</p> : comments.map((c) => (
          <div key={c.id} className="flex gap-3 border-b border-border/50 last:border-0 pb-4 last:pb-0">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm flex-shrink-0">{c.author.username[0]}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{c.author.username}</span>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
              </div>
              <p className="text-sm text-foreground/90">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------
// 5. MEDIA TAB
// ---------------------------
export function MediaTab({ slug, media, user, refetch }: TabProps & { media: ProjectMedia[] }) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("IMAGE");
  const canManage = user && ["ADMIN", "BUILDER"].includes(user.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/projects/${slug}/media`, { url, type });
      setUrl(""); refetch();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      {canManage && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 flex gap-3 items-end">
          <div className="w-32">
            <label className="text-xs text-muted-foreground mb-1 block">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm">
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="EMBED">Embed</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Media URL (Imgur, YouTube, etc)</label>
            <input required type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2"><Plus className="w-4 h-4"/> Add Media</button>
        </form>
      )}

      {media.length === 0 ? <p className="text-muted-foreground text-sm">No media added yet.</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((m) => (
            m.type === "IMAGE" ? (
              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="block aspect-video">
                <img src={m.url} alt="Project media" className="w-full h-full object-cover rounded-lg border border-border hover:opacity-80 transition-opacity" />
              </a>
            ) : (
              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center aspect-video rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm text-muted-foreground flex-col gap-2">
                <ExternalLink className="w-6 h-6" />
                {m.type} Link
              </a>
            )
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------
// 6. MEMBERS TAB
// ---------------------------
export function MembersTab({ slug, members, user, refetch }: TabProps & { members: ProjectMember[] }) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("MEMBER");
  const canManage = user && user.role === "ADMIN";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/projects/${slug}/members`, { userId, role });
      setUserId(""); refetch();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      {canManage && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">User Database ID (from Admin panel)</label>
            <input required type="text" value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm" placeholder="cuid_..."/>
          </div>
          <div className="w-40">
            <label className="text-xs text-muted-foreground mb-1 block">Project Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm">
              <option value="MEMBER">Member</option>
              <option value="BUILDER">Builder</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">Add/Update Member</button>
        </form>
      )}

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold mb-4 text-muted-foreground">Team Roster</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/50">
              {m.user.avatar ? (
                <img src={m.user.avatar} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center font-bold">{m.user.username[0]}</div>
              )}
              <div>
                <p className="text-sm font-medium">{m.user.username}</p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}