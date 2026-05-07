"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  MessageCircle,
  ArrowRight,
  Gauge,
  ChevronDown,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TrustScoreGauge from "@/components/TrustScoreGauge";
import { normalizeTrustPayload, sanitizeSovTrend, type TrustPayload } from "@/lib/dashboardPayload";
import { fetchTrustScore, fetchSOV, type TimeRangeKey } from "@/lib/api";
import { TIME_RANGE_OPTIONS } from "@/lib/timeRange";

const SOVChart = dynamic(() => import("@/components/SOVChart"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[120px] w-full flex-1 items-center justify-center text-xs text-[#717171]">
      Loading chart…
    </div>
  ),
});

function KpiShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col gap-1.5 rounded-xl border border-[#d2dadf] bg-[#f5f8fa] p-1.5 pb-2 ${className}`}
    >
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("6m");
  const [trust, setTrust] = useState<TrustPayload | null>(null);
  const [sov, setSOV] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const trustReady = trust !== null;

  useEffect(() => {
    const ac = new AbortController();
    let settled = false;

    const slowTimer = window.setTimeout(() => {
      if (!settled && !ac.signal.aborted) {
        setError(
          "Dashboard is taking too long — the Python API on port 8000 is probably not running. From the repo root run: npm run dev"
        );
      }
    }, 12000);

    fetchTrustScore({ signal: ac.signal, range: timeRange })
      .then((data) => {
        settled = true;
        window.clearTimeout(slowTimer);
        setTrust(normalizeTrustPayload(data));
        setError(null);
      })
      .catch((e: unknown) => {
        window.clearTimeout(slowTimer);
        const aborted =
          ac.signal.aborted ||
          (e instanceof DOMException && e.name === "AbortError") ||
          (e instanceof Error && e.name === "AbortError");
        if (aborted) return;
        const msg =
          e instanceof Error && e.message ? e.message : "Cannot reach the API — run npm run dev from the repo root";
        setError(msg);
      });

    fetchSOV({ signal: ac.signal, range: timeRange })
      .then((d) => {
        setSOV(sanitizeSovTrend(d?.trend));
      })
      .catch(() => {});

    return () => {
      ac.abort();
      window.clearTimeout(slowTimer);
    };
  }, [timeRange]);

  const weeklyDelta = useMemo(() => {
    if (!trust?.trend || trust.trend.length < 2) return null;
    const t = trust.trend;
    const a = t[t.length - 1]?.score;
    const b = t[t.length - 2]?.score;
    if (typeof a !== "number" || typeof b !== "number" || !Number.isFinite(a) || !Number.isFinite(b)) {
      return null;
    }
    return a - b;
  }, [trust]);

  const rangeSubtitle = TIME_RANGE_OPTIONS.find((o) => o.value === timeRange)?.label ?? "Selected period";

  const competitorMagic =
    Array.isArray(sov) && sov.length > 0 ? sov[sov.length - 1].magicbricks : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden bg-[#f5f8fa]">
      <DashboardHeader />

      {error && (
        <div className="mx-4 shrink-0 rounded-lg border border-[#f5c2c2] bg-[#fef2f2] px-3 py-2 text-center text-xs text-[#b42323]">
          {error}
        </div>
      )}

      {!trustReady && !error && (
        <p className="px-4 text-center text-[11px] text-[#717171]">Loading metrics…</p>
      )}
      <div className="grid shrink-0 grid-cols-1 gap-2 px-4 pb-1 pt-0 sm:grid-cols-2 xl:grid-cols-4">
        {/* Trust score */}
        <KpiShell>
          <div className="flex flex-1 flex-col justify-between rounded-lg bg-white px-4 pb-2 pt-3">
            <div className="flex items-start justify-between">
              <span className="text-base font-semibold tracking-[0.4px] text-[#717171]">Trust score</span>
              <span className="flex size-8 items-center justify-center rounded-[18px] border border-[#d2dadf]">
                <TrendingDown className="size-3.5 text-[#717171]" strokeWidth={1.5} />
              </span>
            </div>
            <p className="mt-2 text-[26px] font-semibold leading-none text-[#242424]">
              {trustReady ? trust!.score : <span className="inline-block h-7 w-10 animate-pulse rounded bg-[#e8eef1]" />}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2 pb-0.5">
            <TrendingDown className="size-3 shrink-0 text-[#d95353]" strokeWidth={2} />
            <span className="text-sm font-medium text-[#4f4f4f]">3 pts this week</span>
          </div>
        </KpiShell>

        {/* Crisis */}
        <KpiShell className="shadow-[inset_0px_0px_12.9px_0px_rgba(217,83,83,0.25)]">
          <div className="flex flex-1 flex-col justify-between rounded-lg bg-white px-4 pb-2 pt-3">
            <div className="flex items-start justify-between">
              <span className="text-base font-semibold tracking-[0.4px] text-[#717171]">Crisis Alert</span>
              <span className="flex size-8 items-center justify-center rounded-[18px] bg-[#fcd9d4]">
                <AlertTriangle className="size-3.5 text-[#d95353]" strokeWidth={1.5} />
              </span>
            </div>
            <p className="mt-2 text-[26px] font-semibold leading-none text-[#242424]">
              {trustReady ? trust!.breakdown.crisis_alerts : <span className="inline-block h-7 w-8 animate-pulse rounded bg-[#e8eef1]" />}
            </p>
          </div>
          <div className="flex items-center justify-between px-2 pb-0.5 pr-2">
            <span className="px-1 text-sm font-medium text-[#d95353]">Needs attention</span>
            <Link
              href="/crisis"
              className="flex size-4 items-center justify-center text-[#242424]"
              aria-label="Open crisis room"
            >
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
        </KpiShell>

        {/* Mentions */}
        <KpiShell>
          <div className="flex flex-1 flex-col justify-between rounded-lg bg-white px-4 pb-2 pt-3">
            <div className="flex items-start justify-between">
              <span className="text-base font-semibold tracking-[0.4px] text-[#717171]">Total mentions</span>
              <span className="flex size-8 items-center justify-center rounded-[18px] border border-[#d2dadf]">
                <MessageCircle className="size-3.5 text-[#717171]" strokeWidth={1.5} />
              </span>
            </div>
            <p className="mt-2 text-[26px] font-semibold leading-none text-[#242424]">
              {trustReady ? trust!.breakdown.total_mentions : <span className="inline-block h-7 w-10 animate-pulse rounded bg-[#e8eef1]" />}
            </p>
          </div>
          <div className="px-2 pb-0.5">
            <span className="text-sm font-medium text-[#4f4f4f]">{rangeSubtitle}</span>
          </div>
        </KpiShell>

        {/* AI SOV */}
        <KpiShell>
          <div className="flex flex-1 flex-col justify-between rounded-lg bg-white px-4 pb-2 pt-3">
            <div className="flex items-start justify-between">
              <span className="text-base font-semibold tracking-[0.4px] text-[#717171]">AI SOV</span>
              <span className="flex size-8 items-center justify-center rounded-[18px] border border-[#d2dadf] text-[10px] font-semibold tracking-wide text-[#242424]">
                AI
              </span>
            </div>
            <p className="mt-2 text-[26px] font-semibold leading-none text-[#242424]">
              {trustReady ? (
                `${trust!.geo_score}%`
              ) : (
                <span className="inline-block h-7 w-14 animate-pulse rounded bg-[#e8eef1]" />
              )}
            </p>
          </div>
          <div className="flex items-center justify-between px-2 pb-0.5 pr-2">
            <span className="px-1 text-sm font-medium text-[#4f4f4f]">
              {competitorMagic != null ? `vs ${competitorMagic}% MagicBricks` : "vs … MagicBricks"}
            </span>
            <Link href="/geo" className="flex size-4 items-center justify-center text-[#242424]" aria-label="GEO center">
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
        </KpiShell>
      </div>

      {/* Second row — fills remaining height without page scroll */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 px-4 pb-2 xl:grid-cols-[minmax(220px,300px)_1fr]">
        {/* Global Trust Score */}
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-[#d2dadf] bg-[#f5f8fa] p-1.5">
          <div className="flex h-full min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-lg bg-white px-4 pb-3 pt-3">
            <div className="flex w-full shrink-0 items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-semibold tracking-[0.32px] text-[#242424]">Global Trust Score</h2>
                <div className="flex flex-wrap items-center gap-1 text-xs leading-normal">
                  {trustReady && weeklyDelta != null && weeklyDelta !== 0 && (
                    <>
                      {weeklyDelta > 0 ? (
                        <TrendingUp className="size-3.5 text-[#14870e]" strokeWidth={2} />
                      ) : (
                        <TrendingDown className="size-3.5 text-[#d95353]" strokeWidth={2} />
                      )}
                      <span
                        className={`font-semibold tracking-[0.24px] ${weeklyDelta > 0 ? "text-[#14870e]" : "text-[#d95353]"}`}
                      >
                        {Math.abs(weeklyDelta)}%
                      </span>
                      <span className="font-normal text-[#717171]">vs last week</span>
                    </>
                  )}
                  {weeklyDelta === 0 && trustReady && <span className="text-[#717171]">Stable vs last week</span>}
                  {weeklyDelta == null && trustReady && <span className="text-[#717171]">Live composite</span>}
                  {!trustReady && <span className="text-[#717171]">Loading trend…</span>}
                </div>
              </div>
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[18px] bg-[#242424] p-2">
                <Gauge className="size-4 text-white" strokeWidth={1.5} />
              </span>
            </div>
            {trustReady ? (
              <TrustScoreGauge score={trust!.score} compact />
            ) : (
              <div className="flex h-[120px] w-full flex-col items-center justify-center gap-2">
                <div className="h-[84px] w-[180px] animate-pulse rounded-t-[100px] bg-[#eef2f4]" />
                <div className="h-9 w-16 animate-pulse rounded bg-[#eef2f4]" />
              </div>
            )}
            <div className="flex min-h-0 shrink flex-col gap-4">
              {(trustReady
                ? [
                    { label: "Sentiment", value: trust!.sentiment_score, fill: "bg-[#bddb8e]" },
                    { label: "Response Rate", value: trust!.response_rate, fill: "bg-[#74abdc]" },
                    { label: "GEO Score", value: trust!.geo_score, fill: "bg-[#db8e8e]" },
                  ]
                : [
                    { label: "Sentiment", value: null as number | null, fill: "bg-[#bddb8e]" },
                    { label: "Response Rate", value: null, fill: "bg-[#74abdc]" },
                    { label: "GEO Score", value: null, fill: "bg-[#db8e8e]" },
                  ]
              ).map((row) => (
                <div key={row.label} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1 text-base font-medium leading-none text-[#4f4f4f]">
                    <span>{row.label}</span>
                    <span>
                      {row.value != null ? `${row.value}%` : <span className="inline-block h-4 w-10 animate-pulse rounded bg-[#e8eef1]" />}
                    </span>
                  </div>
                  <div className="h-[11px] w-full overflow-hidden rounded-full bg-[#eef2f4]">
                    {row.value != null ? (
                      <div className={`h-full rounded-full ${row.fill}`} style={{ width: `${row.value}%` }} />
                    ) : (
                      <div className="h-full w-1/3 animate-pulse rounded-full bg-[#e8eef1]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Share of Voice */}
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-[#d2dadf] bg-[#f5f8fa] p-1.5">
          <div className="flex h-full min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-lg bg-white px-4 pb-2 pt-3">
            <div className="flex shrink-0 flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold tracking-[0.32px] text-[#242424]">AI Share of Voice</h2>
                <p className="mt-0.5 text-[11px] text-[#717171]">vs 99acres, MagicBricks, NoBroker</p>
              </div>
              <div className="relative shrink-0">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRangeKey)}
                  className="flex min-w-[152px] cursor-pointer appearance-none items-center rounded-xl border border-[#d2dadf] bg-[#f5f8fa] py-1.5 pl-2 pr-9 text-left text-sm font-medium text-[#4f4f4f]"
                  aria-label="Chart time range"
                >
                  {TIME_RANGE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 opacity-70"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>
            </div>
            <div className="flex min-h-0 w-full flex-1 flex-col">
              {Array.isArray(sov) && sov.length > 0 ? (
                <SOVChart data={sov as any} />
              ) : (
                <div className="flex flex-1 items-center justify-center text-xs text-[#717171]">
                  Loading chart…
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mention breakdown — Figma: counts inside stacked bar + legend row */}
      <div className="mx-4 mb-3 mt-0 flex shrink-0 flex-col gap-1.5 rounded-xl border border-[#d2dadf] bg-[#f5f8fa] p-1.5 pb-2">
        <div className="flex flex-col gap-3 rounded-lg bg-white px-4 pb-3 pt-3">
          <div className="flex items-start justify-between">
            <h2 className="text-base font-semibold tracking-[0.4px] text-[#242424]">Mention Breakdown</h2>
            <span className="flex size-8 items-center justify-center rounded-[18px] border border-[#d2dadf] text-sm text-[#717171]">
              @
            </span>
          </div>

          <div className="flex h-10 w-full overflow-hidden rounded-md">
            {trustReady ? (
              <>
                <div
                  className="flex min-h-0 min-w-[2rem] flex-1 items-center justify-center rounded-l-md bg-[#bddb8e] text-sm font-semibold text-[#242424]"
                  style={{ flexGrow: trust!.breakdown.positive || 0.001 }}
                >
                  {trust!.breakdown.positive}
                </div>
                <div
                  className="flex min-h-0 min-w-[2rem] flex-1 items-center justify-center bg-[#d2dadf] text-sm font-semibold text-[#242424]"
                  style={{ flexGrow: trust!.breakdown.neutral || 0.001 }}
                >
                  {trust!.breakdown.neutral}
                </div>
                <div
                  className="flex min-h-0 min-w-[2rem] flex-1 items-center justify-center rounded-r-md bg-[#db8e8e] text-sm font-semibold text-[#242424]"
                  style={{ flexGrow: trust!.breakdown.negative || 0.001 }}
                >
                  {trust!.breakdown.negative}
                </div>
              </>
            ) : (
              <>
                <div className="h-full flex-1 animate-pulse rounded-l-md bg-[#e8eef1]" />
                <div className="h-full flex-1 animate-pulse bg-[#e8eef1]" />
                <div className="h-full flex-1 animate-pulse rounded-r-md bg-[#e8eef1]" />
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-[#4f4f4f]">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 shrink-0 rounded-full bg-[#bddb8e]" aria-hidden />
              Positive
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 shrink-0 rounded-full bg-[#d2dadf]" aria-hidden />
              Neutral
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 shrink-0 rounded-full bg-[#db8e8e]" aria-hidden />
              Negative
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 pb-0.5">
          <TrendingDown className="size-3 shrink-0 text-[#d95353]" strokeWidth={2} />
          <span className="text-sm font-medium text-[#4f4f4f]">Deteriorated this week</span>
        </div>
      </div>
    </div>
  );
}
