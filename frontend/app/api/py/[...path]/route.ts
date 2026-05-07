import { NextRequest, NextResponse } from "next/server";

const UPSTREAM =
  process.env.VIGIL_API_URL?.replace(/\/$/, "") ??
  process.env.BACKEND_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function proxy(req: NextRequest, pathSegments: string[]) {
  const subpath = pathSegments.length ? pathSegments.join("/") : "";
  const url = `${UPSTREAM}/${subpath}${req.nextUrl.search}`;

  try {
    const init: RequestInit = {
      method: req.method,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = await req.text();
      init.headers = {
        "Content-Type": req.headers.get("content-type") ?? "application/json",
      };
    }

    const res = await fetch(url, init);
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "backend_unreachable",
        detail:
          "Cannot reach Python API on port 8000. From the repo root run: npm run dev (starts frontend + backend).",
      },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params.path ?? []);
}

export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params.path ?? []);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
