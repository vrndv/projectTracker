// frontend/src/components/project/GoalsProgress.tsx
"use client";

import { cn } from "@/lib/utils";
import { MinecraftItem } from "./MinecraftItem";
import type { ProjectGoal } from "@/types";

interface GoalsProgressProps {
  goals: ProjectGoal[];
}

function goalColor(pct: number) {
  if (pct >= 100) return "bg-green-500";
  if (pct >= 60) return "bg-primary";
  if (pct >= 30) return "bg-yellow-500";
  return "bg-red-500";
}

export function GoalsProgress({ goals }: GoalsProgressProps) {
  if (!goals || goals.length === 0) {
    return <p className="text-sm text-muted-foreground">No goals set yet.</p>;
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const current = goal.currentAmount ?? 0;
        const required = goal.requiredAmount;
        const pct = Math.min((current / required) * 100, 100);
        const done = pct >= 100;

        return (
          <div key={goal.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <MinecraftItem name={goal.material} size={20} />
                <span className={cn("text-sm font-medium truncate", done && "text-green-500")}>
                  {goal.material.replace(/_/g, " ")}
                </span>
                {done && (
                  <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 rounded px-1.5 py-0.5 uppercase tracking-wider font-medium flex-shrink-0">
                    Done
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0 tabular-nums">
                {current.toLocaleString()} / {required.toLocaleString()}
              </span>
            </div>

            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", goalColor(pct))}
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground text-right">{pct.toFixed(1)}%</p>
          </div>
        );
      })}
    </div>
  );
}