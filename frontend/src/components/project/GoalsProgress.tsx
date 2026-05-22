"use client";
import { formatMaterial, formatNumber } from "@/lib/utils";
import type { ProjectGoal } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  goals: ProjectGoal[];
}

export function GoalsProgress({ goals }: Props) {
  if (!goals.length) {
    return (
      <p className="text-sm text-muted-foreground">No goals set. Admins can add goals via the admin panel.</p>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const pct = goal.percent ?? 0;
        const barColor = pct >= 100 ? "bg-green-500" : pct >= 60 ? "bg-primary" : "bg-blue-500";
        return (
          <div key={goal.id}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium">{formatMaterial(goal.material)}</span>
              <span className="text-muted-foreground tabular-nums">
                {formatNumber(goal.currentAmount ?? 0)} / {formatNumber(goal.requiredAmount)}
                <span className={cn("ml-2 font-semibold", pct >= 100 ? "text-green-400" : "text-foreground")}>
                  {pct}%
                </span>
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", barColor)}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            {pct >= 100 && (
              <p className="text-xs text-green-400 mt-0.5">✓ Goal reached!</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
