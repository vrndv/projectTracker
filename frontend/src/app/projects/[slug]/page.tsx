"use client";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import {
  MapPin, ExternalLink, Package, Database, Layers, Users,
  ArrowLeft, RefreshCw, Target, BarChart2, MessageSquare, Image,
} from "lucide-react";
import { useProject, useSnapshots, useGoals } from "@/hooks/useData";
import { InventoryTable } from "@/components/project/InventoryTable";
import { GoalsProgress } from "@/components/project/GoalsProgress";
import { SnapshotCharts } from "@/components/charts/SnapshotCharts";
import { cn, formatNumber, fullnessBg, statusColor } from "@/lib/utils";

export default function ProjectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { project, loading, error, refetch } = useProject(slug);
  const { snapshots } = useSnapshots(slug);
  const { goals } = useGoals(slug);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-card rounded-lg animate-pulse" />
        <div className="h-64 bg-card rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 bg-card rounded-xl animate-pulse" />
          <div className="h-48 bg-card rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        All projects
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6"
      >
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
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
          <button onClick={refetch} className="p-2 text-muted-foreground hover:text-foreground border border-border rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Meta row */}
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
              {project.members.map((m) => m.user.username).join(", ")}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {project.mapUrl && (
            <a href={project.mapUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Open in BlueMap
            </a>
          )}
          {project.videoUrl && (
            <a href={project.videoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-muted border border-border rounded-lg hover:bg-accent transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Watch video
            </a>
          )}
        </div>
      </motion.div>

      {/* Stats row */}
      {snap && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Package className="w-4 h-4" />, label: "Total items", value: formatNumber(snap.totalItems) },
            { icon: <Layers className="w-4 h-4" />, label: "Unique types", value: snap.uniqueItems },
            { icon: <Database className="w-4 h-4" />, label: "Containers", value: snap.containers },
            { icon: <BarChart2 className="w-4 h-4" />, label: "Fullness", value: `${fullness.toFixed(1)}%` },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                {s.icon} {s.label}
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Fullness bar */}
      {snap && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Storage fullness</span>
            <span className="font-medium">{fullness.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fullness}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("h-full rounded-full", fullnessBg(fullness))}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory */}
        {snap && snap.items.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-primary" />
              <h2 className="font-semibold">Live inventory</h2>
            </div>
            <InventoryTable items={snap.items} />
          </div>
        )}

        {/* Goals */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Resource goals</h2>
          </div>
          <GoalsProgress goals={goals} />
        </div>
      </div>

      {/* Charts */}
      {snapshots.length > 1 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">History</h2>
          </div>
          <SnapshotCharts snapshots={snapshots} />
        </div>
      )}

      {/* Updates */}
      {project.updates && project.updates.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Updates</h2>
          </div>
          <div className="space-y-5">
            {project.updates.map((update) => (
              <div key={update.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs text-primary font-medium flex-shrink-0">
                    {update.author.username[0].toUpperCase()}
                  </div>
                  <div className="w-px flex-1 bg-border mt-2" />
                </div>
                <div className="pb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{update.author.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="font-semibold text-sm mb-1">{update.title}</p>
                  <div className="text-sm text-muted-foreground prose prose-invert max-w-none">
                    <ReactMarkdown>{update.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      {project.comments && project.comments.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Comments</h2>
          </div>
          <div className="space-y-4">
            {project.comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {c.author.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium">{c.author.username}</span>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media */}
      {project.media && project.media.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Media</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {project.media.map((m) => (
              m.type === "IMAGE" ? (
                <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer">
                  <img src={m.url} alt="media" className="rounded-lg border border-border w-full h-32 object-cover hover:opacity-90 transition-opacity" />
                </a>
              ) : (
                <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center h-32 rounded-lg border border-border bg-muted text-sm text-muted-foreground hover:bg-accent transition-colors">
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  {m.type.toLowerCase()}
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
