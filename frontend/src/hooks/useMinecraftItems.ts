// frontend/src/hooks/useMinecraftItems.ts
"use client";

import { useState, useEffect } from "react";

export interface MCItem {
  itemId: string;       // e.g. "iron_ingot"
  displayName: string;  // e.g. "Iron Ingot"
  stackSize: number;    // 1 | 16 | 64
}

const CATALOG_URL =
  "https://raw.githubusercontent.com/JHVIW/MineCatalog/main/minecraft-items.json";

// Module-level cache so the fetch only happens once per page load
let _cache: MCItem[] | null = null;
let _promise: Promise<MCItem[]> | null = null;

function fetchItems(): Promise<MCItem[]> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = fetch(CATALOG_URL)
    .then((r) => r.json())
    .then((data) => {
      const items: MCItem[] = (data.items as any[]).map((i) => ({
        itemId: String(i.itemId).toLowerCase(),
        displayName: String(i.displayName),
        stackSize: parseInt(i.stackSize) || 64,
      }));
      _cache = items;
      return items;
    });
  return _promise;
}

export function useMinecraftItems() {
  const [items, setItems] = useState<MCItem[]>(_cache ?? []);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    fetchItems().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  return { items, loading };
}

/** Lookup stack size for a given itemId. Defaults to 64 if not found. */
export function getStackSize(items: MCItem[], itemId: string): number {
  const found = items.find((i) => i.itemId === itemId.toLowerCase());
  return found?.stackSize ?? 64;
}

/**
 * Format an item count with stack-awareness.
 *   stackSize 64 → "3 stacks + 4 items"  or  "3 stacks"  or  "4 items"
 *   stackSize 16 → same with 16
 *   stackSize  1 → just "7 items" (non-stackable)
 */
export function formatStacks(amount: number, stackSize: number): string {
  if (stackSize <= 1) return `${amount.toLocaleString()} items`;
  const stacks = Math.floor(amount / stackSize);
  const remainder = amount % stackSize;
  if (stacks === 0) return `${remainder} item${remainder !== 1 ? "s" : ""}`;
  if (remainder === 0) return `${stacks} stack${stacks !== 1 ? "s" : ""}`;
  return `${stacks} stack${stacks !== 1 ? "s" : ""} + ${remainder} item${remainder !== 1 ? "s" : ""}`;
}