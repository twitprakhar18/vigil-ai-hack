function getApiBase(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  // Default: proxy via Next (see next.config.mjs rewrites) so the UI never calls :8000 directly from the browser.
  if (typeof window !== "undefined") return "/api/py";
  return "http://127.0.0.1:8000";
}

async function fetchJson(path: string, init?: RequestInit & { timeoutMs?: number }) {
  const { timeoutMs = 15000, ...req } = init ?? {};
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const base = getApiBase();
    const res = await fetch(`${base}${path}`, { ...req, signal: ctrl.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function fetchTrustScore() {
  return fetchJson("/trust-score/");
}

export async function fetchMentions(params?: {
  triage?: string;
  sentiment?: string;
  crisis_only?: boolean;
}) {
  const query = new URLSearchParams();
  if (params?.triage) query.set("triage", params.triage);
  if (params?.sentiment) query.set("sentiment", params.sentiment);
  if (params?.crisis_only) query.set("crisis_only", "true");

  return fetchJson(`/mentions/?${query}`);
}

export async function fetchGeoAudit() {
  return fetchJson("/geo/audit");
}

export async function fetchSOV() {
  return fetchJson("/geo/sov");
}

export async function draftResponse(mentionId: string, brandVoice: string) {
  return fetchJson("/ai/draft-response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mention_id: mentionId, brand_voice: brandVoice }),
  });
}
