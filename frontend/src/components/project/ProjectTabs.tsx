// frontend/src/components/project/ProjectTabs.tsx
"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { api } from "@/lib/api";
import {
  Package, Layers, Database, BarChart2, Target,
  MessageSquare, Image as ImageIcon, ExternalLink, Plus, Send, Users
} from "lucide-react";
import { cn, formatNumber, fullnessBg } from "@/lib/utils";
import { InventoryTable } from "./InventoryTable";
import { GoalsProgress } from "./GoalsProgress";
import { SnapshotCharts } from "../charts/SnapshotCharts";
import { MinecraftItem } from "./MinecraftItem";
import type {
  Project, ProjectGoal, ProjectUpdate, ProjectComment,
  ProjectMedia, ProjectMember, User
} from "@/types";

interface TabProps {
  slug: string;
  user: User | null;
  refetch: () => void;
}

// ---------------------------
// 1. GOALS TAB
// ---------------------------
export function GoalsTab({ slug, goals, user, refetch }: TabProps & { goals: ProjectGoal[] }) {
  const [material, setMaterial] = useState("");
  const [amount, setAmount] = useState("");
  const canManage = user && ["ADMIN", "BUILDER"].includes(user.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/projects/${slug}/goals`, {
        material,
        requiredAmount: parseInt(amount),
      });
      setMaterial("");
      setAmount("");
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {canManage && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">
              Material Name (e.g. iron_ingot)
            </label>
            <div className="flex items-center gap-2">
              {material && <MinecraftItem name={material} size={20} />}
              <input
                required
                type="text"
                value={material}
                onChange={e => setMaterial(e.target.value)}
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="iron_ingot"
              />
            </div>
          </div>
          <div className="w-32">
            <label className="text-xs text-muted-foreground mb-1 block">Target</label>
            <input
              required
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="1000"
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          >
            Set Goal
          </button>
        </form>
      )}

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Resource Goals
          </h2>
          {canManage && (
            <span className="text-xs text-muted-foreground">
              Submit an existing material to edit its target
            </span>
          )}
        </div>
        <GoalsProgress goals={goals} />
      </div>
    </div>
  );
}

// ---------------------------
// 2. UPDATES TAB
// ---------------------------
export function UpdatesTab({
  slug, updates, user, refetch,
}: TabProps & { updates: ProjectUpdate[] }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const canPost = user && ["ADMIN", "BUILDER", "MEMBER"].includes(user.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/projects/${slug}/updates`, { title, content });
      setTitle("");
      setContent("");
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {canPost && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-4 space-y-3"
        >
          <input
            required
            type="text"
            placeholder="Update Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            required
            placeholder="Write your update... (Markdown supported)"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2 w-max"
          >
            <Send className="w-4 h-4" /> Post Update
          </button>
        </form>
      )}

      <div className="space-y-4">
        {updates.length === 0 ? (
          <p className="text-muted-foreground text-sm">No updates posted yet.</p>
        ) : (
          updates.map((update) => (
            <div key={update.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {update.author.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{update.author.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{update.title}</h3>
              <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
                <ReactMarkdown>{update.content}</ReactMarkdown>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------
// 3. COMMENTS TAB
// ---------------------------
export function CommentsTab({
  slug, comments, user, refetch,
}: TabProps & { comments: ProjectComment[] }) {
  const [content, setContent] = useState("");
  const canPost = user && ["ADMIN", "BUILDER", "MEMBER"].includes(user.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/projects/${slug}/comments`, { content });
      setContent("");
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {canPost && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            required
            type="text"
            placeholder="Add a comment..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          >
            Post
          </button>
        </form>
      )}

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No comments yet.</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="flex gap-3 border-b border-border/50 last:border-0 pb-4 last:pb-0"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm flex-shrink-0">
                {c.author.username[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{c.author.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-foreground/90">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------
// 4. MEDIA TAB
// ---------------------------
export function MediaTab({
  slug, media, user, refetch,
}: TabProps & { media: ProjectMedia[] }) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("IMAGE");
  const canManage = user && ["ADMIN", "BUILDER"].includes(user.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/projects/${slug}/media`, { url, type });
      setUrl("");
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {canManage && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end"
        >
          <div className="w-32">
            <label className="text-xs text-muted-foreground mb-1 block">Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="EMBED">Embed</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">Media URL</label>
            <input
              required
              type="url"
              placeholder="https://..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Media
          </button>
        </form>
      )}

      {media.length === 0 ? (
        <p className="text-muted-foreground text-sm">No media added yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((m) =>
            m.type === "IMAGE" ? (
              <a
                key={m.id}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-video"
              >
                <img
                  src={m.url}
                  alt="Project media"
                  className="w-full h-full object-cover rounded-lg border border-border hover:opacity-80 transition-opacity"
                />
              </a>
            ) : (
              <a
                key={m.id}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center aspect-video rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm text-muted-foreground flex-col gap-2"
              >
                <ExternalLink className="w-6 h-6" />
                {m.type} Link
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------
// 5. MEMBERS TAB
// ---------------------------
export function MembersTab({
  slug, members, user, refetch,
}: TabProps & { members: ProjectMember[] }) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("MEMBER");
  const canManage = user && user.role === "ADMIN";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/projects/${slug}/members`, { userId, role });
      setUserId("");
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {canManage && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">
              User Database ID (Grab from Admin panel)
            </label>
            <input
              required
              type="text"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="cuid_..."
            />
          </div>
          <div className="w-32">
            <label className="text-xs text-muted-foreground mb-1 block">Project Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="MEMBER">Member</option>
              <option value="BUILDER">Builder</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          >
            Add Member
          </button>
        </form>
      )}

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> Team Roster
        </h2>
        {members.length === 0 ? (
          <p className="text-muted-foreground text-sm">No members added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
              >
                {m.user.avatar ? (
                  <img src={m.user.avatar} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center font-bold">
                    {m.user.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{m.user.username}</p>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-1">
                    {m.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}