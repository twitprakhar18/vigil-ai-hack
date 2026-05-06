"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: Array<{
    month: string;
    housing: number;
    magicbricks: number;
    "99acres": number;
    nobroker: number;
  }>;
}

const COLORS = {
  housing: "#0D9488",
  magicbricks: "#6366F1",
  "99acres": "#F59E0B",
  nobroker: "#EC4899",
};

export default function SOVChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} />
        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} unit="%" />
        <Tooltip
          formatter={(value: number) => `${value}%`}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(value) =>
            value === "housing"
              ? "Housing.com"
              : value === "magicbricks"
              ? "MagicBricks"
              : value === "99acres"
              ? "99acres"
              : "NoBroker"
          }
        />
        {(["housing", "magicbricks", "99acres", "nobroker"] as const).map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLORS[key]}
            strokeWidth={key === "housing" ? 2.5 : 1.5}
            dot={false}
            strokeDasharray={key === "housing" ? undefined : "4 2"}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
