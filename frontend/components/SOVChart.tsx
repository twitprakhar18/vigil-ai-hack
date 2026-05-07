"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: Array<{
    month: string;
    housing: number;
    magicbricks: number;
    "99acres": number;
    nobroker: number;
  }>;
  height?: number;
}

const COLORS = {
  housing: "#af74dc",
  magicbricks: "#d8959f",
  "99acres": "#74abdc",
  nobroker: "#6bc26f",
} as const;

const LABELS: Record<keyof typeof COLORS, string> = {
  housing: "Housing",
  magicbricks: "MagicBricks",
  "99acres": "99acres",
  nobroker: "NoBroker",
};

/** Tooltip copy matches design (“Housing.com” vs legend “Housing”). */
const TOOLTIP_LABELS: Record<keyof typeof COLORS, string> = {
  housing: "Housing.com",
  magicbricks: "MagicBricks",
  "99acres": "99acres",
  nobroker: "NoBroker",
};

const SERIES_ORDER = ["housing", "99acres", "nobroker", "magicbricks"] as const;

/** Short month key → “Dec, 2025” style for Dec–May spanning years */
const MONTH_AXIS_LABELS: Record<string, string> = {
  Dec: "Dec, 2025",
  Jan: "Jan, 2026",
  Feb: "Feb, 2026",
  Mar: "Mar, 2026",
  Apr: "Apr, 2026",
  May: "May, 2026",
};

const GRADIENT_ID: Record<(typeof SERIES_ORDER)[number], string> = {
  housing: "sovGradHousing",
  "99acres": "sovGrad99",
  nobroker: "sovGradNB",
  magicbricks: "sovGradMB",
};

function SovTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const title = (label && MONTH_AXIS_LABELS[label]) || label || "";
  const order: Record<string, number> = Object.fromEntries(
    SERIES_ORDER.map((k, i) => [k, i])
  );
  const rows = [...payload].sort((a, b) => (order[a.dataKey] ?? 0) - (order[b.dataKey] ?? 0));
  return (
    <div
      className="rounded-lg border border-[#d2dadf] bg-white px-3 py-2 text-left shadow-md"
      style={{ fontSize: 12 }}
    >
      <div className="text-[11px] font-semibold text-[#242424]">Shares</div>
      <div className="mb-2 text-[10px] text-[#717171]">{title}</div>
      <ul className="flex flex-col gap-1">
        {rows.map((p) => {
          const key = p.dataKey as keyof typeof COLORS;
          const name = TOOLTIP_LABELS[key] ?? key;
          return (
            <li key={String(p.dataKey)} className="flex items-center justify-between gap-6 text-[11px]">
              <span className="flex items-center gap-2 text-[#4f4f4f]">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                {name}
              </span>
              <span className="font-semibold tabular-nums text-[#242424]">
                {Math.round(Number(p.value ?? 0))}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function SOVChart({ data, height }: Props) {
  const fillParent = height == null;
  const compact = fillParent || height < 200;
  const rows = Array.isArray(data) ? data : [];

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[120px] w-full flex-1 items-center justify-center text-xs text-[#717171]">
        No chart data
      </div>
    );
  }

  const chart = (
    <AreaChart data={rows} margin={{ top: 4, right: 6, left: 0, bottom: 4 }}>
      <defs>
        {SERIES_ORDER.map((key) => (
          <linearGradient key={key} id={GRADIENT_ID[key]} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS[key]} stopOpacity={0.38} />
            <stop offset="100%" stopColor={COLORS[key]} stopOpacity={0.04} />
          </linearGradient>
        ))}
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#e8eef1" vertical={false} />
      <XAxis
        dataKey="month"
        tick={{ fontSize: compact ? 10 : 11, fill: "#717171", fontWeight: 500 }}
        axisLine={{ stroke: "#d2dadf" }}
        tickLine={false}
        tickMargin={6}
        height={compact ? 36 : 40}
        tickFormatter={(v: string) => MONTH_AXIS_LABELS[v] ?? v}
      />
      <YAxis
        domain={[0, 100]}
        ticks={[20, 40, 60, 80, 100]}
        width={compact ? 34 : 40}
        tick={{ fontSize: compact ? 10 : 11, fill: "#717171", fontWeight: 500 }}
        axisLine={false}
        tickLine={false}
        tickFormatter={(v) => `${v}%`}
      />
      <Tooltip content={<SovTooltip />} cursor={{ fill: "rgba(36, 36, 36, 0.06)" }} />
      {SERIES_ORDER.map((key) => (
        <Area
          key={key}
          type="monotone"
          dataKey={key}
          name={key}
          stroke={COLORS[key]}
          strokeWidth={key === "housing" ? 2.5 : 2}
          fill={`url(#${GRADIENT_ID[key]})`}
          fillOpacity={1}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: "#242424" }}
        />
      ))}
    </AreaChart>
  );

  const legend = (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-5 gap-y-1 px-1 pt-2 text-[11px] font-medium leading-none text-[#4f4f4f]">
      {SERIES_ORDER.map((key) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-[3px] w-5 shrink-0 rounded-full"
            style={{ backgroundColor: COLORS[key] }}
            aria-hidden
          />
          {LABELS[key]}
        </span>
      ))}
    </div>
  );

  if (fillParent) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col">
        <div className="relative min-h-0 w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            {chart}
          </ResponsiveContainer>
        </div>
        {legend}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col" style={{ height }}>
      <div className="relative min-h-0 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      </div>
      {legend}
    </div>
  );
}
