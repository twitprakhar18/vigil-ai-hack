"use client";

import { useEffect, useState } from "react";
import { TrendingDown, AlertTriangle, MessageCircle, BarChart3 } from "lucide-react";
import TrustScoreGauge from "@/components/TrustScoreGauge";
import SOVChart from "@/components/SOVChart";
import PulseTicker from "@/components/PulseTicker";
import { fetchTrustScore, fetchSOV } from "@/lib/api";

export default function DashboardPage() {
  const [trust, setTrust] = useState<any>(null);
  const [sov, setSOV] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrustScore()
      .then(setTrust)
      .catch(() =>
        setError("Cannot reach the API — start the backend from the project root: npm run dev")
      );
    fetchSOV().then((d) => setSOV(d.trend)).catch(() => {});
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-400 text-sm">{error} — is the backend running?</p>
      </div>
    );
  }

  if (!trust) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-400 text-sm animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Trust Score",
      value: trust.score,
      sub: "↓ 3 pts this week",
      icon: TrendingDown,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Crisis Alerts",
      value: trust.breakdown.crisis_alerts,
      sub: "Needs attention",
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      label: "Total Mentions",
      value: trust.breakdown.total_mentions,
      sub: "Last 30 days",
      icon: MessageCircle,
      color: "text-brand",
      bg: "bg-brand-light",
    },
    {
      label: "AI SOV",
      value: "16%",
      sub: "vs 38% MagicBricks",
      icon: BarChart3,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Command Center</h1>
          <p className="text-sm text-slate-400">Housing.com · Live Brand Intelligence</p>
        </div>
        <span className="text-xs px-3 py-1 bg-red-50 text-red-500 rounded-full font-medium border border-red-100">
          3 Crisis Alerts Active
        </span>
      </div>

      {/* Pulse Ticker */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400 shrink-0">LIVE PULSE</span>
          <div className="w-px h-4 bg-slate-200" />
          <PulseTicker />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              <div className={`p-1.5 rounded-lg ${s.bg}`}>
                <s.icon size={14} className={s.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Trust Score Gauge */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center justify-center gap-4">
          <TrustScoreGauge score={trust.score} />
          <div className="w-full space-y-2">
            {[
              { label: "Sentiment", value: trust.sentiment_score, color: "bg-green-400" },
              { label: "Response Rate", value: trust.response_rate, color: "bg-amber-400" },
              { label: "GEO Score", value: trust.geo_score, color: "bg-indigo-400" },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{bar.label}</span>
                  <span>{bar.value}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar.color}`}
                    style={{ width: `${bar.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SOV Chart */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">AI Share of Voice</h2>
              <p className="text-xs text-slate-400">vs MagicBricks, 99acres, NoBroker</p>
            </div>
            <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded-full">
              ↓ Trending down
            </span>
          </div>
          {sov.length > 0 && <SOVChart data={sov as any} />}
        </div>
      </div>

      {/* Sentiment Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Mention Breakdown</h2>
        <div className="flex items-center gap-6">
          {[
            { label: "Positive", count: trust.breakdown.positive, color: "bg-green-400", pct: Math.round((trust.breakdown.positive / trust.breakdown.total_mentions) * 100) },
            { label: "Negative", count: trust.breakdown.negative, color: "bg-red-400", pct: Math.round((trust.breakdown.negative / trust.breakdown.total_mentions) * 100) },
            { label: "Neutral", count: trust.breakdown.neutral, color: "bg-slate-300", pct: Math.round((trust.breakdown.neutral / trust.breakdown.total_mentions) * 100) },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${s.color}`} />
              <div>
                <p className="text-sm font-semibold text-slate-800">{s.count} <span className="text-slate-400 font-normal text-xs">({s.pct}%)</span></p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden flex ml-4">
            <div className="h-full bg-green-400" style={{ width: `${Math.round((trust.breakdown.positive / trust.breakdown.total_mentions) * 100)}%` }} />
            <div className="h-full bg-slate-300" style={{ width: `${Math.round((trust.breakdown.neutral / trust.breakdown.total_mentions) * 100)}%` }} />
            <div className="h-full bg-red-400" style={{ width: `${Math.round((trust.breakdown.negative / trust.breakdown.total_mentions) * 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
