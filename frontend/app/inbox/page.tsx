"use client";

import { useEffect, useState } from "react";
import { fetchMentions } from "@/lib/api";
import MentionCard from "@/components/MentionCard";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Urgent", value: "urgent" },
  { label: "Influencer", value: "influencer" },
  { label: "Crisis", value: "crisis" },
  { label: "Neutral", value: "neutral" },
];

const VOICES = ["empathetic", "authoritative", "witty"];

export default function InboxPage() {
  const [mentions, setMentions] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [brandVoice, setBrandVoice] = useState("empathetic");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params =
      filter === "crisis"
        ? { crisis_only: true }
        : filter
        ? { triage: filter }
        : {};
    fetchMentions(params).then((d) => {
      setMentions(d.mentions || []);
      setLoading(false);
    });
  }, [filter]);

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Unified Inbox</h1>
          <p className="text-sm text-slate-400">All mentions · AI triage active</p>
        </div>
        {/* Brand Voice Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Brand Voice:</span>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {VOICES.map((v) => (
              <button
                key={v}
                onClick={() => setBrandVoice(v)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  brandVoice === v
                    ? "bg-brand text-white"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-lg w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === f.value
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mentions List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : mentions.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-sm">No mentions for this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mentions.map((m) => (
            <MentionCard key={m.id} mention={m} brandVoice={brandVoice} />
          ))}
        </div>
      )}
    </div>
  );
}
