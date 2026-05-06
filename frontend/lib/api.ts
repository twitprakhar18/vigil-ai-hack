const BASE = "http://localhost:8000";

export async function fetchTrustScore() {
  const res = await fetch(`${BASE}/trust-score/`);
  return res.json();
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

  const res = await fetch(`${BASE}/mentions/?${query}`);
  return res.json();
}

export async function fetchGeoAudit() {
  const res = await fetch(`${BASE}/geo/audit`);
  return res.json();
}

export async function fetchSOV() {
  const res = await fetch(`${BASE}/geo/sov`);
  return res.json();
}

export async function draftResponse(mentionId: string, brandVoice: string) {
  const res = await fetch(`${BASE}/ai/draft-response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mention_id: mentionId, brand_voice: brandVoice }),
  });
  return res.json();
}
