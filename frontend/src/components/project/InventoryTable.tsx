"use client";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { formatMaterial } from "@/lib/utils";
import type { ItemSnapshot } from "@/types";

interface Props {
  items: ItemSnapshot[];
}

export function InventoryTable({ items }: Props) {
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => b.amount - a.amount);
  }, [items]);

  const filtered = useMemo(() => {
    if (!search) return sorted;
    return sorted.filter((i) =>
      i.material.toLowerCase().includes(search.toLowerCase())
    );
  }, [sorted, search]);

  const max = sorted[0]?.amount ?? 1;

  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-left py-2.5 px-3">Material</th>
                <th className="text-right py-2.5 px-3">Amount</th>
                <th className="w-28 py-2.5 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const pct = Math.round((item.amount / max) * 100);
                return (
                  <tr key={item.material} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                      {formatMaterial(item.material)}
                    </td>
                    <td className="py-2 px-3 text-right font-medium tabular-nums">
                      {item.amount.toLocaleString()}
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted-foreground text-sm">
                    No items match "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{filtered.length} item types</p>
    </div>
  );
}
