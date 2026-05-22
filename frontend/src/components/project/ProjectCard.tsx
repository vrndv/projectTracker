"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Package, Users, Database, Clock } from "lucide-react";
import { cn, formatNumber, fullnessBg, statusColor } from "@/lib/utils";
import type { Project } from "@/types";

interface Props {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: Props) {
  const snap = project.latestSnapshot;
  const fullness = snap?.fullness ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/projects/${project.slug}`}>
        <div className="group bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:bg-card/80 transition-all duration-200 cursor-pointer h-full flex flex-col">
          {project.thumbnailUrl && (
            <img
              src={project.thumbnailUrl}
              alt={project.name}
              className="w-full h-32 object-cover rounded-lg mb-3 border border-border"
            />
          )}

          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-foreground capitalize group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", statusColor(project.status))}>
              {project.status.toLowerCase()}
            </span>
          </div>

          {project.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
              {project.description}
            </p>
          )}

          {snap && (
            <div className="mt-auto space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Storage fullness</span>
                <span className="font-medium text-foreground">{fullness.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", fullnessBg(fullness))}
                  style={{ width: `${fullness}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {formatNumber(snap.totalItems)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    {snap.containers} chests
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.members.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!snap && (
            <div className="mt-auto pt-2 text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              No data yet
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
