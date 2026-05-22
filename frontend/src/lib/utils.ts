import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

export function formatMaterial(mat: string): string {
  return mat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function fullnessColor(pct: number): string {
  if (pct >= 80) return "text-red-400";
  if (pct >= 50) return "text-yellow-400";
  return "text-green-400";
}

export function fullnessBg(pct: number): string {
  if (pct >= 80) return "bg-red-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-green-500";
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
    PAUSED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    COMPLETED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ARCHIVED: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };
  return map[status] ?? map.ACTIVE;
}
