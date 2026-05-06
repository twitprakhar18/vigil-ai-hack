"use client";

import { useState } from "react";
import { Twitter, MessageSquare, Star, Smartphone, Users, Heart, Share2 } from "lucide-react";
import { draftResponse } from "@/lib/api";

interface Mention {
  id: string;
  platform: string;
  author: string;
  author_followers: number;
  content: string;
  sentiment: string;
  triage: string;
  timestamp: string;
  reach: number;
  likes: number;
  shares: number;
  ai_draft?: string;
  is_crisis: boolean;
}

interface Props {
  mention: Mention;
  brandVoice: string;
}

const PLATFORM_ICON: Record<string, React.ReactNode> = {
  twitter: <Twitter size={13} />,
  reddit: <MessageSquare size={13} />,
  google: <Star size={13} />,
  playstore: <Smartphone size={13} />,
};

const TRIAGE_STYLE: Record<string, string> = {
  urgent: "bg-red-100 text-red-600",
  influencer: "bg-purple-100 text-purple-600",
  spam: "bg-slate-100 text-slate-500",
  neutral: "bg-blue-50 text-blue-500",
};

const SENTIMENT_DOT: Record<string, string> = {
  positive: "bg-green-400",
  negative: "bg-red-400",
  neutral: "bg-slate-300",
};

export default function MentionCard({ mention, brandVoice }: Props) {
  const [draft, setDraft] = useState(mention.ai_draft || "");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<"idle" | "draft" | "approved">("idle");

  const handleDraft = async () => {
    setLoading(true);
    const res = await draftResponse(mention.id, brandVoice);
    setDraft(res.draft);
    setState("draft");
    setLoading(false);
  };

  const timeAgo = (ts: string) => {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div
      className={`bg-white rounded-xl border p-4 space-y-3 transition-all ${
        mention.is_crisis ? "border-red-200 shadow-sm shadow-red-50" : "border-slate-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-slate-400">{PLATFORM_ICON[mention.platform]}</span>
          <span className="font-medium text-sm text-slate-800 truncate">{mention.author}</span>
          {mention.author_followers > 10000 && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Users size={10} />
              {(mention.author_followers / 1000).toFixed(0)}k
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide ${
              TRIAGE_STYLE[mention.triage]
            }`}
          >
            {mention.triage}
          </span>
          <span className={`w-2 h-2 rounded-full ${SENTIMENT_DOT[mention.sentiment]}`} />
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-slate-700 leading-relaxed">{mention.content}</p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span>{timeAgo(mention.timestamp)}</span>
        <span className="flex items-center gap-1">
          <Heart size={11} /> {mention.likes.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Share2 size={11} /> {mention.shares.toLocaleString()}
        </span>
        <span>Reach: {mention.reach.toLocaleString()}</span>
      </div>

      {/* AI Draft Panel */}
      {state === "idle" && (
        <button
          onClick={handleDraft}
          disabled={loading}
          className="w-full py-1.5 text-xs font-medium text-brand border border-brand rounded-lg hover:bg-brand-light transition-colors disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate AI Response"}
        </button>
      )}

      {state === "draft" && (
        <div className="space-y-2">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1 font-medium">AI Draft ({brandVoice})</p>
            <textarea
              className="w-full text-sm text-slate-700 bg-transparent resize-none outline-none"
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setState("approved")}
              className="flex-1 py-1.5 text-xs font-medium text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors"
            >
              Approve & Post
            </button>
            <button
              onClick={handleDraft}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}

      {state === "approved" && (
        <div className="flex items-center gap-2 py-1.5 px-3 bg-green-50 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <p className="text-xs text-green-600 font-medium">Response posted successfully</p>
        </div>
      )}
    </div>
  );
}
