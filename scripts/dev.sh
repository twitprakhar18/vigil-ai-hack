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

(
  cd "$ROOT/frontend"
  exec npm run dev
) &
FE_PID=$!

echo "Backend: http://127.0.0.1:8000  |  Frontend: http://localhost:3000"
wait "$BE_PID" "$FE_PID"
