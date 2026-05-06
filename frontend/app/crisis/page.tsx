"use client";

import { useEffect, useState } from "react";
import { fetchMentions } from "@/lib/api";
import { Siren, Users, TrendingUp, Clock } from "lucide-react";
import MentionCard from "@/components/MentionCard";

export default function CrisisPage() {
  const [crisisMentions, setCrisisMentions] = useState<any[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [invited, setInvited] = useState<string[]>([]);

  useEffect(() => {
    fetchMentions({ crisis_only: true }).then((d) =>
      setCrisisMentions(d.mentions || [])
    );
  }, []);

  const handleInvite = () => {
    if (email.trim()) {
      setInvited((prev) => [...prev, email.trim()]);
      setEmail("");
    }
  };

  const totalReach = crisisMentions.reduce((sum, m) => sum + m.reach, 0);

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Crisis Banner */}
      <div className="bg-red-600 text-white rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500 rounded-lg">
            <Siren size={18} />
          </div>
          <div>
            <p className="font-semibold text-sm">Crisis Alert Active</p>
            <p className="text-xs text-red-200">
              Viral sentiment spike detected · Fake listings + data breach narrative spreading
            </p>
          </div>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-white text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"
        >
          <Users size={13} />
          Invite War Room
        </button>
      </div>

      {/* Crisis Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Crisis Mentions",
            value: crisisMentions.length,
            sub: "Require immediate response",
            icon: Siren,
            color: "text-red-500",
            bg: "bg-red-50",
          },
          {
            label: "Total Reach at Risk",
            value: totalReach.toLocaleString(),
            sub: "People exposed to negative content",
            icon: TrendingUp,
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
          {
            label: "Avg Response Time",
            value: "—",
            sub: "Target: < 5 minutes",
            icon: Clock,
            color: "text-slate-500",
            bg: "bg-slate-100",
          },
        ].map((s) => (
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

      {/* Crisis Narrative */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
          Detected Crisis Narrative
        </p>
        <p className="text-sm text-amber-800">
          Two converging threads: (1){" "}
          <strong>Fake/fraudulent listings</strong> complaint going viral on X and Reddit, and (2)
          a potential <strong>data breach</strong> allegation from a user claiming broker spam
          after creating an account. Combined reach is{" "}
          <strong>{totalReach.toLocaleString()}+</strong>. Recommend immediate response within 30
          minutes.
        </p>
      </div>

      {/* Crisis Mentions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-800 mb-3">
          High-Risk Mentions ({crisisMentions.length})
        </h2>
        <div className="space-y-3">
          {crisisMentions.map((m) => (
            <MentionCard key={m.id} mention={m} brandVoice="empathetic" />
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="font-semibold text-slate-800">Invite to War Room</h3>
            <p className="text-xs text-slate-500">
              Send an urgent invite to your PR, Legal, or Leadership team.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                placeholder="colleague@housing.com"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <button
                onClick={handleInvite}
                className="px-3 py-2 bg-brand text-white text-sm rounded-lg font-medium hover:bg-brand-dark"
              >
                Add
              </button>
            </div>
            {invited.length > 0 && (
              <div className="space-y-1">
                {invited.map((e) => (
                  <div
                    key={e}
                    className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    {e} — Invite sent
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInviteOpen(false)}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setInviteOpen(false)}
                className="px-4 py-2 bg-brand text-white text-sm rounded-lg font-medium hover:bg-brand-dark"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
