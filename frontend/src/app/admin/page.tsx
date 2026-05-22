"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Database, Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useData";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState<"users" | "projects">("users");

  useEffect(() => {
    if (user?.role === "ADMIN") {
      api.get<any[]>("/api/admin/users").then(setUsers).catch(console.error);
      api.get<any>("/api/admin/stats").then(setStats).catch(console.error);
    }
  }, [user]);

  if (loading) return <div className="h-64 bg-card rounded-xl animate-pulse" />;

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="text-center py-16">
        <Shield className="w-10 h-10 mx-auto mb-3 text-destructive opacity-50" />
        <p className="text-muted-foreground">Admin access required</p>
      </div>
    );
  }

  const setRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-500/20 text-red-400 border-red-500/30",
    BUILDER: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    MEMBER: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    VIEWER: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin panel</h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Database className="w-4 h-4" />, label: "Projects", value: stats.projectCount },
            { icon: <Users className="w-4 h-4" />, label: "Users", value: stats.userCount },
            { icon: <Database className="w-4 h-4" />, label: "Snapshots", value: stats.snapshotCount.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">{s.icon}{s.label}</div>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users table */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left py-2.5 px-3">User</th>
                <th className="text-left py-2.5 px-3">Discord ID</th>
                <th className="text-left py-2.5 px-3">Role</th>
                <th className="text-left py-2.5 px-3">Projects</th>
                <th className="text-left py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.username} className="w-7 h-7 rounded-full" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {u.username[0].toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{u.discordId}</td>
                  <td className="py-3 px-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", roleColors[u.role] ?? roleColors.VIEWER)}>
                      {u.role.toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{u.memberships?.length ?? 0}</td>
                  <td className="py-3 px-3">
                    <select
                      value={u.role}
                      onChange={(e) => setRole(u.id, e.target.value)}
                      className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground focus:outline-none"
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="MEMBER">Member</option>
                      <option value="BUILDER">Builder</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
