// frontend/src/components/project/InventoryTable.tsx
"use client";

import { useState } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { MinecraftItem } from "./MinecraftItem";

interface InventoryItem {
  name: string;
  count: number;
  [key: string]: any;
}

interface InventoryTableProps {
  items: InventoryItem[];
  /** Show only top N rows (expandable). Default 15 */
  initialRows?: number;
}

export function InventoryTable({ items, initialRows = 15 }: InventoryTableProps) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = items
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.count - a.count);

  const visible = expanded ? filtered : filtered.slice(0, initialRows);
  const hasMore = filtered.length > initialRows;

  return (
    <div className="space-y-3">
      {items.length > initialRows && (
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      )}

      <div className="rounded-lg overflow-hidden border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground w-8" />
              <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Item</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Count</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item, i) => (
              <tr
                key={item.name}
                className={cn(
                  "border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors",
                )}
              >
                <td className="py-2 px-3">
                  <MinecraftItem name={item.name} size={20} />
                </td>
                <td className="py-2 px-3 font-medium capitalize">
                  {item.name.replace(/_/g, " ")}
                </td>
                <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                  {formatNumber(item.count)}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-xs text-muted-foreground">
                  No items match "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore && !search && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs text-muted-foreground hover:text-foreground py-1.5 border border-dashed border-border rounded-lg transition-colors"
        >
          {expanded
            ? "Show less"
            : `Show ${filtered.length - initialRows} more items`}
        </button>
      )}
    </div>
  );
}