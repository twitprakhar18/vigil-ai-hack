#!/usr/bin/env bash
# Run backend (FastAPI) and frontend (Next.js) together. Ctrl+C stops both.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -x "$ROOT/frontend/node_modules/.bin/next" ]]; then
  echo "Frontend deps missing; running npm install in frontend/ ..."
  (cd "$ROOT/frontend" && npm install)
fi

BE_PID=""
FE_PID=""

cleanup() {
  if [[ -n "${BE_PID:-}" ]]; then kill "$BE_PID" 2>/dev/null || true; fi
  if [[ -n "${FE_PID:-}" ]]; then kill "$FE_PID" 2>/dev/null || true; fi
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

(
  cd "$ROOT/backend"
  exec python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
) &
BE_PID=$!

echo "Waiting for API on http://127.0.0.1:8000 ..."
for _ in {1..60}; do
  if curl -sf "http://127.0.0.1:8000/health" >/dev/null 2>&1; then
    echo "API ready."
    break
  fi
  sleep 0.25
done

if [[ -z "${SKIP_PORT_CHECK:-}" ]] && command -v lsof >/dev/null 2>&1 && lsof -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo ""
  echo "ERROR: Port 3000 is already in use."
  echo "Another process is serving http://localhost:3000 — not necessarily this Next app."
  echo "That causes HTML from one server and /_next chunks from another → no CSS, broken JS."
  echo ""
  echo "Fix: stop whatever is on 3000 (e.g. run: lsof -iTCP:3000 -sTCP:LISTEN)"
  echo "Or set SKIP_PORT_CHECK=1 to skip this guard (you must open Next's printed 'Local:' URL)."
  echo ""
  exit 1
fi

(
  cd "$ROOT/frontend"
  exec npm run dev
) &
FE_PID=$!

echo "Backend: http://127.0.0.1:8000"
echo "Frontend: http://localhost:3000 (Next default bind; use this URL after Next prints Ready)"
echo ""
echo "Tip: If chunks 404 or webpack ENOENT, stop dev and run: cd frontend && npm run dev:clean"
echo ""
wait "$BE_PID" "$FE_PID"
