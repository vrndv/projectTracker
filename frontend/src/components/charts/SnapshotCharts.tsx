"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

import { format } from "date-fns";

interface Props {
  snapshots: Array<{
    timestamp: string;
    fullness: number;
    totalItems: number;
  }>;

  compact?: boolean;
}

const tooltipStyle = {
  backgroundColor: "hsl(222 20% 11%)",
  border: "1px solid hsl(217 20% 18%)",
  borderRadius: "8px",
  color: "hsl(210 40% 95%)",
  fontSize: "12px",
};

export function SnapshotCharts({
  snapshots,
  compact = false,
}: Props) {
  if (!snapshots.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Not enough data for charts yet.
      </p>
    );
  }

  const data = snapshots.map((s) => ({
    time: format(new Date(s.timestamp), "MMM d HH:mm"),
    fullness: Math.round(s.fullness * 10) / 10,
    items: s.totalItems,
  }));

  const chartHeight = compact ? 120 : 180;
  const spacing = compact ? "space-y-4" : "space-y-8";

  return (
    <div className={spacing}>
      {/* Fullness */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">
          Storage fullness (%)
        </p>

        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id="gradFullness"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(217 20% 18%)"
            />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [`${v}%`, "Fullness"]}
            />

            <Area
              type="monotone"
              dataKey="fullness"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#gradFullness)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Items */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">
          Total items
        </p>

        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id="gradItems"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(217 20% 18%)"
            />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
              }
            />

            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [
                v.toLocaleString(),
                "Items",
              ]}
            />

            <Area
              type="monotone"
              dataKey="items"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#gradItems)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}