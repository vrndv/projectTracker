"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useData";
import { Sword, LayoutDashboard, Settings, LogIn, LogOut } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors">
            <Sword className="w-5 h-5 text-primary" />
            <span>MC Tracker</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Projects
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {!loading && user && user.role === "ADMIN" && (
            <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-4 h-4" />
              Admin
            </Link>
          )}

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-muted-foreground hidden sm:block">{user.username}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <a
              href={`${API}/auth/discord`}
              className="flex items-center gap-2 text-sm bg-[#5865F2] hover:bg-[#4752c4] text-white px-3 py-1.5 rounded-md transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login with Discord
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
