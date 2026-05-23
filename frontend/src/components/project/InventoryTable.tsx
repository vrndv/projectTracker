// frontend/src/components/project/InventoryTable.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MinecraftItem } from "./MinecraftItem";
import { useMinecraftItems, getStackSize, type MCItem } from "@/hooks/useMinecraftItems";
import { Layers2 } from "lucide-react";

interface InventoryItem {
  name: string;
  count: number;
  [key: string]: any;
}

interface InventoryTableProps {
  items: InventoryItem[];
  initialRows?: number;
}

function StackDisplay({ count, itemId, mcItems }: { count: number; itemId: string; mcItems: MCItem[] }) {
  const stackSize = getStackSize(mcItems, itemId);

  if (stackSize <= 1) {
    // Non-stackable — just show item count
    return (
      <span className="text-muted-foreground tabular-nums">
        {count.toLocaleString()}
        <span className="text-xs text-muted-foreground/50 ml-1">×1</span>
      </span>
    );
  }

  const stacks = Math.floor(count / stackSize);
  const remainder = count % stackSize;

  if (stacks === 0) {
    return <span className="text-muted-foreground tabular-nums">{remainder}</span>;
  }

  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      {/* Stack row */}
      <span className="inline-flex items-center gap-1 tabular-nums">
        <Layers2 className="w-3 h-3 text-muted-foreground/60" />
        <span>{stacks.toLocaleString()}</span>
        {stackSize !== 64 && (
          <span className="text-[10px] text-yellow-400/70 font-mono">×{stackSize}</span>
        )}
        {remainder > 0 && (
          <span className="text-muted-foreground/50">+{remainder}</span>
        )}
      </span>
      {/* Raw total */}
      <span className="text-[10px] text-muted-foreground/40 tabular-nums">
        {count.toLocaleString()} total
      </span>
    </span>
  );
}

export function InventoryTable({ items, initialRows = 15 }: InventoryTableProps) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const { items: mcItems } = useMinecraftItems();

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
          onChange={(e) => setSearch(e.target.value)}
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
            {visible.map((item) => (
              <tr
                key={item.name}
                className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="py-2 px-3">
                  <MinecraftItem name={item.name} size={20} />
                </td>
                <td className="py-2 px-3 font-medium capitalize">
                  {item.name.replace(/_/g, " ")}
                </td>
                <td className="py-2 px-3 text-right">
                  <StackDisplay count={item.count} itemId={item.name} mcItems={mcItems} />
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
          {expanded ? "Show less" : `Show ${filtered.length - initialRows} more items`}
        </button>
      )}
    </div>
  );
}