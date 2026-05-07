from fastapi import APIRouter, Query

from mock_data import get_trust_score_response

router = APIRouter(prefix="/trust-score", tags=["trust-score"])


@router.get("/")
def get_trust_score(time_range: str | None = Query(None, alias="range")):
    return get_trust_score_response(time_range)
