// frontend/src/components/project/MinecraftItem.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface MinecraftItemProps {
  /** Minecraft item/block name, e.g. "iron_ingot" or "oak_log" */
  name: string;
  /** Override display label. Defaults to prettified name. */
  label?: string;
  size?: number;
  className?: string;
}

function prettify(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MinecraftItem({ name, label, size = 24, className }: MinecraftItemProps) {
  const [imgError, setImgError] = useState(false);
  const displayName = label ?? prettify(name);
  const imgUrl = `https://blocksitems.com/api/v1/items/minecraft:${name.toLowerCase()}/icon`; 

  return (
    <span className={cn("relative inline-flex items-center group", className)}>
      {!imgError ? (
        <img
          src={imgUrl}
          alt={displayName}
          width={size}
          height={size}
          onError={() => setImgError(true)}
          style={{ imageRendering: "pixelated", width: size, height: size }}
          className="flex-shrink-0"
        />
      ) : (
        // Fallback: generic block icon
        <span
          style={{ width: size, height: size }}
          className="flex-shrink-0 bg-muted rounded flex items-center justify-center text-[10px] text-muted-foreground font-bold select-none"
        >
          ?
        </span>
      )}

      {/* Minecraft-style tooltip on hover */}
      <span
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2",
          "z-50 whitespace-nowrap rounded px-2 py-1",
          "border border-[#555] bg-[#1c1c1c] text-[#f5f5f5]",
          "font-mono text-xs leading-tight",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        )}
        style={{ fontFamily: "'VT323', monospace", fontSize: 14 }}
      >
        {displayName}
        {/* Minecraft-style purple glow effect on tooltip border */}
        <span className="absolute inset-0 rounded border border-[#7a4fa3]/40 pointer-events-none" />
      </span>
    </span>
  );
}