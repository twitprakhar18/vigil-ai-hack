"use client";

import { useEffect, useState } from "react";
import { fetchGeoAudit } from "@/lib/api";
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react";

const LLM_COLORS: Record<string, string> = {
  ChatGPT: "bg-green-100 text-green-700",
  Gemini: "bg-blue-100 text-blue-700",
  Perplexity: "bg-purple-100 text-purple-700",
};

export default function GEOPage() {
  const [data, setData] = useState<any>(null);
  const [activeGap, setActiveGap] = useState<number | null>(null);

  useEffect(() => {
    fetchGeoAudit().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-400 text-sm animate-pulse">Running GEO audit...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">GEO Center</h1>
        <p className="text-sm text-slate-400">
          Generative Engine Optimization · LLM Citation Audit
        </p>
      </div>

      {/* Query Banner */}
      <div className="bg-slate-800 text-white rounded-xl p-4">
        <p className="text-xs text-slate-400 mb-1">Audited Query</p>
        <p className="text-sm font-medium">"{data.query}"</p>
      </div>

      {/* LLM Citation Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">LLM Citation Audit</h2>
          <p className="text-xs text-slate-400">How often Housing.com is cited vs competitors</p>
        </div>
        <div className="divide-y divide-slate-100">
          {data.results.map((r: any) => {
            const total =
              r.housing_mentions +
              Object.values(r.competitor_mentions as Record<string, number>).reduce(
                (a: number, b: number) => a + b,
                0
              );
            const housingPct = Math.round((r.housing_mentions / total) * 100);

            return (
              <div key={r.llm} className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${LLM_COLORS[r.llm]}`}
                    >
                      {r.llm}
                    </span>
                    <span className="text-sm text-slate-600">
                      Housing.com cited{" "}
                      <strong className="text-slate-800">{r.housing_mentions}x</strong>
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    AI Share of Voice:{" "}
                    <strong className="text-slate-600">{r.ai_share_of_voice}%</strong>
                  </span>
                </div>

                {/* Stacked bar */}
                <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-2">
                  <div
                    className="bg-brand rounded-l-full"
                    style={{ width: `${housingPct}%` }}
                    title={`Housing.com: ${r.housing_mentions}`}
                  />
                  {Object.entries(r.competitor_mentions as Record<string, number>).map(
                    ([name, count], i) => {
                      const pct = Math.round(((count as number) / total) * 100);
                      const colors = ["bg-indigo-400", "bg-amber-400", "bg-pink-400"];
                      return (
                        <div
                          key={name}
                          className={`${colors[i % colors.length]} ${
                            i === Object.keys(r.competitor_mentions).length - 1
                              ? "rounded-r-full"
                              : ""
                          }`}
                          style={{ width: `${pct}%` }}
                          title={`${name}: ${count}`}
                        />
                      );
                    }
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-brand inline-block" />
                    Housing.com ({r.housing_mentions})
                  </span>
                  {Object.entries(r.competitor_mentions as Record<string, number>).map(
                    ([name, count], i) => {
                      const colors = ["bg-indigo-400", "bg-amber-400", "bg-pink-400"];
                      return (
                        <span
                          key={name}
                          className="flex items-center gap-1.5 text-xs text-slate-500"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${colors[i % colors.length]} inline-block`}
                          />
                          {name} ({count})
                        </span>
                      );
                    }
                  )}
                </div>

                {/* Cited URLs */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.cited_urls.map((url: string) => (
                    <span
                      key={url}
                      className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                        url.includes("housing")
                          ? "border-brand text-brand bg-brand-light"
                          : "border-slate-200 text-slate-400 bg-slate-50"
                      }`}
                    >
                      {url}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Semantic Gaps */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle size={15} className="text-amber-500" />
          <h2 className="text-sm font-semibold text-slate-800">Semantic Gaps</h2>
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            {data.semantic_gaps.length} found
          </span>
        </div>
        {data.semantic_gaps.map((gap: string, i: number) => (
          <div
            key={i}
            onClick={() => setActiveGap(activeGap === i ? null : i)}
            className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-amber-200 hover:bg-amber-50 cursor-pointer transition-colors"
          >
            <AlertCircle size={13} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600">{gap}</p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle size={15} className="text-green-500" />
          <h2 className="text-sm font-semibold text-slate-800">Fix Recommendations</h2>
        </div>
        {data.recommendations.map((rec: string, i: number) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-green-200 hover:bg-green-50 transition-colors"
          >
            <CheckCircle size={13} className="text-green-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600">{rec}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
