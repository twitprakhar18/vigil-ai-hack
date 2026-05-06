from fastapi import APIRouter
from mock_data import MENTIONS, TRUST_SCORE_TREND
from models import Sentiment

router = APIRouter(prefix="/trust-score", tags=["trust-score"])


@router.get("/")
def get_trust_score():
    total = len(MENTIONS)
    positive = sum(1 for m in MENTIONS if m.sentiment == Sentiment.positive)
    negative = sum(1 for m in MENTIONS if m.sentiment == Sentiment.negative)

    sentiment_score = int((positive / total) * 100) if total else 0
    response_rate = 23
    geo_score = 16

    score = int(sentiment_score * 0.4 + response_rate * 0.3 + geo_score * 0.3)

    return {
        "score": score,
        "sentiment_score": sentiment_score,
        "response_rate": response_rate,
        "geo_score": geo_score,
        "trend": TRUST_SCORE_TREND,
        "breakdown": {
            "total_mentions": total,
            "positive": positive,
            "negative": negative,
            "neutral": total - positive - negative,
            "crisis_alerts": sum(1 for m in MENTIONS if m.is_crisis),
        },
    }
