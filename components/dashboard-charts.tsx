"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ChartPoint } from "@/lib/charts";

// Farverne her er bevidst hardkodede (recharts læser ikke Tailwind-klasser) - skal matche
// "accent"/"line" i tailwind.config.ts hvis temaet nogensinde ændres.
const ACCENT = "#7C93FF";
const GRID_LINE = "#262B36";
const MUTED = "#8A90A0";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="text-ink/50">{label}</p>
      <p className="font-medium text-ink">
        {Number(payload[0].value).toLocaleString("da-DK")}
      </p>
    </div>
  );
}

export function MrrGrowthChart({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-ink/40">Ingen aktive aftaler endnu.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <defs>
          <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID_LINE} vertical={false} />
        <XAxis
          dataKey="label"
          stroke={MUTED}
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={MUTED}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={ACCENT}
          strokeWidth={2}
          fill="url(#mrrFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LeadsPerWeekChart({ data }: { data: ChartPoint[] }) {
  const allZero = data.every((d) => d.value === 0);
  if (allZero) {
    return (
      <p className="text-sm text-ink/40">Ingen nye leads i denne periode.</p>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID_LINE} vertical={false} />
        <XAxis
          dataKey="label"
          stroke={MUTED}
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={MUTED}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={32}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
