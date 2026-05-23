// frontend/src/app/projects/[slug]/ProjectClientPage.tsx

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  ExternalLink,
  Users,
  ArrowLeft,
  RefreshCw,
  Target,
  Zap,
  MessageSquare,
  Package,
  BarChart2,
  Image as ImageIcon,
} from "lucide-react";

import {
  useProject,
  useSnapshots,
  useGoals,
  useAuth,
} from "@/hooks/useData";

import {
  cn,
  statusColor,
  formatNumber,
  fullnessBg,
} from "@/lib/utils";

import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

import { InventoryTable } from "@/components/project/InventoryTable";
import { GoalsProgress } from "@/components/project/GoalsProgress";
import { SnapshotCharts } from "@/components/charts/SnapshotCharts";

import {
  GoalsTab,
  UpdatesTab,
  CommentsTab,
  MediaTab,
  MembersTab,
} from "@/components/project/ProjectTabs";

interface Props {
  slug: string;
}

export default function ProjectClientPage({ slug }: Props) {

  const {
    project,
    loading,
    error,
    refetch: refetchProject,
  } = useProject(slug);

  const { snapshots } = useSnapshots(slug);
  const { goals } = useGoals(slug);
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
  });

  const canEdit =
    user &&
    ["ADMIN", "BUILDER", "MEMBER"].includes(user.role);

  const canDelete =
    user &&
    ["ADMIN", "BUILDER"].includes(user.role);

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
    if (
      !confirm(
        `Are you sure you want to delete ${project?.name}? This cannot be undone.`
      )
    ) return;

    try {
      await api.delete(`/api/projects/${slug}`);

      window.location.href = "/";
    } catch (e: any) {
      alert("Failed to delete: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="h-64 bg-card rounded-xl animate-pulse" />
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive">
          Project not found
        </p>

        <Link
          href="/"
          className="text-sm text-primary mt-2 inline-block"
        >
          ← Back to projects
        </Link>
      </div>
    );
  }

  const snap = project.latestSnapshot;

  const fullness = snap?.fullness ?? 0;

  const recentUpdates =
    (project.updates || []).slice(0, 3);

  const recentComments =
    (project.comments || []).slice(0, 3);

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

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >

          {activeTab === "Goals" && (
            <GoalsTab
              slug={slug}
              goals={goals}
              user={user}
              refetch={refetchProject}
            />
          )}

          {activeTab === "Updates" && (
            <UpdatesTab
              slug={slug}
              updates={project.updates || []}
              user={user}
              refetch={refetchProject}
            />
          )}

          {activeTab === "Comments" && (
            <CommentsTab
              slug={slug}
              comments={project.comments || []}
              user={user}
              refetch={refetchProject}
            />
          )}

          {activeTab === "Media" && (
            <MediaTab
              slug={slug}
              media={project.media || []}
              user={user}
              refetch={refetchProject}
            />
          )}

          {activeTab === "Members" && (
            <MembersTab
              slug={slug}
              members={project.members || []}
              user={user}
              refetch={refetchProject}
            />
          )}

          {activeTab === "History" &&
            snapshots.length > 1 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-semibold flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  Snapshot History
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

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All projects
      </Link>

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

          <div className="flex flex-wrap items-start justify-between gap-3">

            <div>

              <div className="flex items-center gap-3 mb-1">

                <h1 className="text-2xl font-bold capitalize">
                  {project.name}
                </h1>

                <span
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border font-medium",
                    statusColor(project.status)
                  )}
                >
                  {project.status.toLowerCase()}
                </span>

              </div>

              {project.description && (
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
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
                      description:
                        project.description || "",
                      status: project.status,
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

        </div>

      </motion.div>

    </div>
  );
}