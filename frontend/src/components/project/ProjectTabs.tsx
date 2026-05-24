// frontend/src/components/project/ProjectTabs.tsx
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { api } from "@/lib/api";
import {
  Package, Layers, Database, BarChart2, Target,
  MessageSquare, Image as ImageIcon, ExternalLink, Plus, Send, Users,
  Search, X, ChevronDown, Layers2,
} from "lucide-react";
import { cn, formatNumber, fullnessBg } from "@/lib/utils";
import { InventoryTable } from "./InventoryTable";
import { SnapshotCharts } from "../charts/SnapshotCharts";
import { MinecraftItem } from "./MinecraftItem";
import { useMinecraftItems, getStackSize, formatStacks, type MCItem } from "@/hooks/useMinecraftItems";
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
// Material Picker
// A searchable dropdown backed by the MineCatalog registry.
// Players can type a plain name ("iron ingot") or a namespace ("iron_ingot").
// ---------------------------
interface MaterialPickerProps {
  value: string;
  onChange: (itemId: string) => void;
  items: MCItem[];
  loading: boolean;
  disabled?: boolean;
}

function MaterialPicker({ value, onChange, items, loading, disabled }: MaterialPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return items.slice(0, 60);
    const q = query.toLowerCase().replace(/[\s_-]+/g, "");
    return items
      .filter((i) => {
        const id = i.itemId.replace(/_/g, "");
        const name = i.displayName.toLowerCase().replace(/\s+/g, "");
        return id.includes(q) || name.includes(q);
      })
      .slice(0, 60);
  }, [query, items]);

  const selected = items.find((i) => i.itemId === value);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[220px]">
      <label className="text-xs text-muted-foreground mb-1 block">Material</label>

      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => { setOpen((o) => !o); setQuery(""); }}
        className={cn(
          "w-full flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-left",
          "hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary transition-colors",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {selected ? (
          <>
            <MinecraftItem name={selected.itemId} size={18} />
            <span className="flex-1 truncate">{selected.displayName}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{selected.itemId}</span>
          </>
        ) : (
          <span className="text-muted-foreground flex-1">
            {loading ? "Loading items…" : "Search for a material…"}
          </span>
        )}
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform flex-shrink-0", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-[#1a1a1a] border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-[#1a1a1a]">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or id…"
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")}>
                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-56 overflow-y-auto bg-[#1a1a1a]">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">No items found</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.itemId}
                  type="button"
                  onClick={() => { onChange(item.itemId); setOpen(false); setQuery(""); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors",
                    value === item.itemId && "bg-primary/10 text-primary"
                  )}
                >
                  <MinecraftItem name={item.itemId} size={18} />
                  <span className="flex-1 truncate">{item.displayName}</span>
                  <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">{item.itemId}</span>
                  {item.stackSize < 64 && (
                    <span className={cn(
                      "text-[10px] px-1 rounded flex-shrink-0",
                      item.stackSize === 1
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    )}>
                      ×{item.stackSize}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------
// Stack count display
// ---------------------------
function StackCount({ amount, material, mcItems }: { amount: number; material: string; mcItems: MCItem[] }) {
  const stackSize = getStackSize(mcItems, material);
  const stacks = stackSize > 1 ? Math.floor(amount / stackSize) : 0;
  const remainder = stackSize > 1 ? amount % stackSize : amount;

  if (stackSize <= 1) {
    // Non-stackable: just show item count
    return (
      <span className="text-xs text-muted-foreground tabular-nums">
        {amount.toLocaleString()} items
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
      {stacks > 0 && (
        <span className="inline-flex items-center gap-0.5">
          <Layers2 className="w-3 h-3" />
          {stacks}
        </span>
      )}
      {stacks > 0 && remainder > 0 && <span className="opacity-40">+</span>}
      {remainder > 0 && (
        <span>{remainder}</span>
      )}
      {stacks === 0 && <span>items</span>}
    </span>
  );
}

// ---------------------------
// 1. GOALS TAB
// ---------------------------
export function GoalsTab({ slug, goals: initialGoals, user, refetch }: TabProps & { goals: ProjectGoal[] }) {
  const { items: mcItems, loading: mcLoading } = useMinecraftItems();
  // Local goals state — seeded from props, updated optimistically so UI
  // responds instantly without waiting for a round-trip refetch.
  const [goals, setGoals] = useState<ProjectGoal[]>(initialGoals);
  const [material, setMaterial] = useState("");
  const [amount, setAmount] = useState("");
  const [editingGoal, setEditingGoal] = useState<ProjectGoal | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const canManage = user && ["ADMIN", "BUILDER"].includes(user.role);

  // Sync when parent polls new data (e.g. currentAmount changes from game)
  useEffect(() => { setGoals(initialGoals); }, [initialGoals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material) return;
    setSaving(true);
    try {
      const created = await api.post<ProjectGoal>(`/api/projects/${slug}/goals`, {
        material,
        requiredAmount: parseInt(amount),
      });
      // Optimistic: add immediately
      setGoals((prev) => [...prev.filter((g) => g.material !== created.material), created]);
      setMaterial("");
      setAmount("");
      refetch();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (goal: ProjectGoal) => {
    if (!editAmount) return;
    setSaving(true);
    const newAmount = parseInt(editAmount);
    // Optimistic: update immediately
    setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, requiredAmount: newAmount } : g));
    setEditingGoal(null);
    setEditAmount("");
    try {
      await api.patch(`/api/projects/${slug}/goals/${String(goal.id)}`, {
        requiredAmount: newAmount,
      });
      refetch();
    } catch (err: any) {
      // Rollback on failure
      setGoals((prev) => prev.map((g) => g.id === goal.id ? goal : g));
      setEditingGoal(goal);
      setEditAmount(String(goal.requiredAmount));
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (goalId: string | number) => {
    if (!confirm("Delete this goal?")) return;
    const id = String(goalId);
    setDeletingId(id);
    // Optimistic: remove immediately
    const removed = goals.find((g) => String(g.id) === id);
    setGoals((prev) => prev.filter((g) => String(g.id) !== id));
    try {
      await api.delete(`/api/projects/${slug}/goals/${id}`);
      refetch();
    } catch (err: any) {
      // Rollback on failure
      if (removed) setGoals((prev) => [...prev, removed]);
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {canManage && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end"
        >
          <MaterialPicker
            value={material}
            onChange={setMaterial}
            items={mcItems}
            loading={mcLoading}
          />
          <div className="w-32">
            <label className="text-xs text-muted-foreground mb-1 block">Target</label>
            <input
              required
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="1000"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !material}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Add Goal"}
          </button>
        </form>
      )}

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Resource Goals
          </h2>
          <span className="text-xs text-muted-foreground">
            {goals.length} goal{goals.length !== 1 ? "s" : ""}
          </span>
        </div>

        {(!goals || goals.length === 0) ? (
          <p className="text-sm text-muted-foreground">
            No goals set yet.{canManage ? " Use the form above to add one." : ""}
          </p>
        ) : (
          <div className="space-y-5">
            {goals.map((goal) => {
              const current = goal.currentAmount ?? 0;
              const required = goal.requiredAmount;
              const pct = Math.min((current / required) * 100, 100);
              const done = pct >= 100;
              const isEditing = editingGoal?.id === goal.id;
              const stackSize = getStackSize(mcItems, goal.material);
              const goalId = String(goal.id);

              return (
                <div key={goalId} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    {/* Left: icon + name */}
                    <div className="flex items-center gap-2 min-w-0">
                      <MinecraftItem name={goal.material} size={20} />
                      <div className="min-w-0">
                        <span className={cn("text-sm font-medium truncate block", done && "text-green-500")}>
                          {goal.material.replace(/_/g, " ")}
                        </span>
                        {/* Issue 3: stack-aware count */}
                        <span className="text-[11px] text-muted-foreground">
                          {formatStacks(current, stackSize)}
                          {" / "}
                          {formatStacks(required, stackSize)}
                          {stackSize < 64 && (
                            <span className={cn(
                              "ml-1 px-1 rounded text-[10px]",
                              stackSize === 1 ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"
                            )}>
                              ×{stackSize}
                            </span>
                          )}
                        </span>
                      </div>
                      {done && (
                        <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 rounded px-1.5 py-0.5 uppercase tracking-wider font-medium flex-shrink-0">
                          Done
                        </span>
                      )}
                    </div>

                    {/* Right: raw numbers + actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {current.toLocaleString()} / {required.toLocaleString()}
                      </span>
                      {canManage && (
                        <>
                          <button
                            onClick={() => {
                              setEditingGoal(isEditing ? null : goal);
                              setEditAmount(String(goal.requiredAmount));
                            }}
                            className="text-xs px-2 py-1 bg-muted border border-border rounded hover:bg-accent transition-colors"
                          >
                            {isEditing ? "Cancel" : "Edit"}
                          </button>
                          <button
                            onClick={() => handleDelete(goal.id)}
                            disabled={deletingId === goalId}
                            className="text-xs px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            {deletingId === goalId ? "…" : "Delete"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 items-center pl-7">
                      <input
                        type="number"
                        min="1"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-28 bg-muted border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="New target"
                      />
                      <button
                        onClick={() => handleEdit(goal)}
                        disabled={saving}
                        className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  )}

                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        pct >= 100 ? "bg-green-500" : pct >= 60 ? "bg-primary" : pct >= 30 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">{pct.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------
// 2. UPDATES TAB
// ---------------------------
export function UpdatesTab({
  slug, updates: initialUpdates, user, refetch,
}: TabProps & { updates: ProjectUpdate[] }) {
  const [updates, setUpdates] = useState<ProjectUpdate[]>(initialUpdates);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const canPost = user && ["ADMIN", "BUILDER", "MEMBER"].includes(user.role);

  useEffect(() => { setUpdates(initialUpdates); }, [initialUpdates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.post<ProjectUpdate>(`/api/projects/${slug}/updates`, { title, content });
      setUpdates((prev) => [created, ...prev]);
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
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            required
            placeholder="Write your update... (Markdown supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
  slug, comments: initialComments, user, refetch,
}: TabProps & { comments: ProjectComment[] }) {
  const [comments, setComments] = useState<ProjectComment[]>(initialComments);
  const [content, setContent] = useState("");
  const canPost = user && ["ADMIN", "BUILDER", "MEMBER"].includes(user.role);

  useEffect(() => { setComments(initialComments); }, [initialComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.post<ProjectComment>(`/api/projects/${slug}/comments`, { content });
      setComments((prev) => [...prev, created]);
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
            onChange={(e) => setContent(e.target.value)}
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
  slug, media: initialMedia, user, refetch,
}: TabProps & { media: ProjectMedia[] }) {
  const [media, setMedia] = useState<ProjectMedia[]>(initialMedia);
  const [url, setUrl] = useState("");
  const [type, setType] = useState("IMAGE");
  const canManage = user && ["ADMIN", "BUILDER"].includes(user.role);

  useEffect(() => { setMedia(initialMedia); }, [initialMedia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.post<ProjectMedia>(`/api/projects/${slug}/media`, { url, type });
      setMedia((prev) => [...prev, created]);
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
              onChange={(e) => setType(e.target.value)}
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
              onChange={(e) => setUrl(e.target.value)}
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
              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="block aspect-video">
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
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="cuid_..."
            />
          </div>
          <div className="w-32">
            <label className="text-xs text-muted-foreground mb-1 block">Project Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
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