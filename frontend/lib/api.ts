function getApiBase(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  // Default: proxy via Next (see next.config.mjs rewrites) so the UI never calls :8000 directly from the browser.
  if (typeof window !== "undefined") return "/api/py";
  return "http://127.0.0.1:8000";
}

async function fetchJson(
  path: string,
  init?: RequestInit & { timeoutMs?: number }
) {
  const { timeoutMs = 12000, signal: outerSignal, ...req } = init ?? {};
  const timeoutCtrl = new AbortController();
  const t = setTimeout(() => timeoutCtrl.abort(), timeoutMs);

  if (outerSignal) {
    if (outerSignal.aborted) timeoutCtrl.abort();
    else outerSignal.addEventListener("abort", () => timeoutCtrl.abort(), { once: true });
  }

  try {
    const base = getApiBase();
    const res = await fetch(`${base}${path}`, {
      ...req,
      signal: timeoutCtrl.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      let detail = "";
      try {
        const j = JSON.parse(errText);
        detail = j.detail || j.message || "";
      } catch {
        detail = errText.slice(0, 120);
      }
      throw new Error(detail || `HTTP ${res.status}`);
    }
    const text = await res.text();
    if (!text || !text.trim()) {
      throw new Error("Empty response from API");
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON from API");
    }
  } finally {
    clearTimeout(t);
  }
}

export type TimeRangeKey = "7d" | "1m" | "3m" | "6m" | "1y";

export async function fetchTrustScore(options?: { signal?: AbortSignal; range?: TimeRangeKey }) {
  const { signal, range } = options ?? {};
  const params = new URLSearchParams();
  if (range) params.set("range", range);
  const qs = params.toString();
  const path = `/trust-score/${qs ? `?${qs}` : ""}`;
  return fetchJson(path, signal ? { signal } : undefined);
}

export async function fetchMentions(
  params?: {
    triage?: string;
    sentiment?: string;
    crisis_only?: boolean;
  },
  signal?: AbortSignal
) {
  const query = new URLSearchParams();
  if (params?.triage) query.set("triage", params.triage);
  if (params?.sentiment) query.set("sentiment", params.sentiment);
  if (params?.crisis_only) query.set("crisis_only", "true");

  return fetchJson(`/mentions/?${query}`, signal ? { signal } : undefined);
}

export async function fetchGeoAudit(signal?: AbortSignal) {
  return fetchJson("/geo/audit", signal ? { signal } : undefined);
}

export async function fetchSOV(options?: { signal?: AbortSignal; range?: TimeRangeKey }) {
  const { signal, range } = options ?? {};
  const params = new URLSearchParams();
  if (range) params.set("range", range);
  const qs = params.toString();
  const path = `/geo/sov${qs ? `?${qs}` : ""}`;
  return fetchJson(path, signal ? { signal } : undefined);
}

export async function draftResponse(
  mentionId: string,
  brandVoice: string,
  signal?: AbortSignal
) {
  return fetchJson("/ai/draft-response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mention_id: mentionId, brand_voice: brandVoice }),
    ...(signal ? { signal } : {}),
  });
}
