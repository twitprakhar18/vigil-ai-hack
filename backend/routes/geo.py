from fastapi import APIRouter
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mock_data import GEO_DATA, SOV_TREND
from integrations.geo_audit import run_geo_audit

router = APIRouter(prefix="/geo", tags=["geo"])

_geo_cache = None
_use_real_data = True


@router.get("/audit")
def get_geo_audit():
    """Get GEO (Generative Engine Optimization) audit. Fetches real LLM citation data when available."""
    global _geo_cache

    if _use_real_data:
        try:
            if _geo_cache is None:
                print("Running real GEO audit via Claude...")
                _geo_cache = run_geo_audit()
            return _geo_cache
        except Exception as e:
            print(f"Real GEO audit error: {e}, using mock data")
            return GEO_DATA
    else:
        return GEO_DATA


@router.get("/sov")
def get_share_of_voice():
    """Get Share of Voice trend data."""
    return {"trend": SOV_TREND}


@router.post("/audit-refresh")
def refresh_geo_audit():
    """Manually trigger a fresh GEO audit."""
    global _geo_cache

    if not _use_real_data:
        return {"message": "Real data disabled. Enable with /geo/toggle-real-data"}

    try:
        print("Refreshing GEO audit...")
        _geo_cache = run_geo_audit()
        return {"status": "success", "audit": _geo_cache}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/toggle-real-data")
def toggle_real_data(use_real: bool = True):
    """Toggle between real Claude audit and mock data."""
    global _use_real_data
    _use_real_data = use_real
    return {
        "real_data_enabled": _use_real_data,
        "message": "Switched to " + ("real Claude audit" if use_real else "mock data"),
    }
