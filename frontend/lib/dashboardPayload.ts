/** Defensive parsing so malformed API JSON cannot crash the dashboard client tree. */

export type TrustPayload = {
  score: number;
  sentiment_score: number;
  response_rate: number;
  geo_score: number;
  trend?: Array<{ date: string; score: number }>;
  breakdown: {
    total_mentions: number;
    positive: number;
    negative: number;
    neutral: number;
    crisis_alerts: number;
  };
};

export type SovRow = {
  month: string;
  housing: number;
  magicbricks: number;
  "99acres": number;
  nobroker: number;
};

function n(v: unknown): number {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : 0;
}

export function normalizeTrustPayload(data: unknown): TrustPayload {
  const d = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const b =
    d.breakdown && typeof d.breakdown === "object" ? (d.breakdown as Record<string, unknown>) : {};
  const tm = n(b.total_mentions);
  return {
    score: n(d.score),
    sentiment_score: n(d.sentiment_score),
    response_rate: n(d.response_rate),
    geo_score: n(d.geo_score),
    trend: Array.isArray(d.trend) ? (d.trend as TrustPayload["trend"]) : undefined,
    breakdown: {
      total_mentions: tm > 0 ? tm : 1,
      positive: n(b.positive),
      negative: n(b.negative),
      neutral: n(b.neutral),
      crisis_alerts: n(b.crisis_alerts),
    },
  };
}

function clampPct(v: unknown): number {
  const x = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(x)) return 0;
  return Math.min(100, Math.max(0, x));
}

export function sanitizeSovTrend(raw: unknown): SovRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
    return {
      month: typeof r.month === "string" ? r.month : "",
      housing: clampPct(r.housing),
      magicbricks: clampPct(r.magicbricks),
      "99acres": clampPct(r["99acres"]),
      nobroker: clampPct(r.nobroker),
    };
  });
}
