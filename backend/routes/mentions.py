from fastapi import APIRouter, Query
from typing import Optional
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import TriageLabel, Platform, Sentiment
from integrations.reddit import fetch_reddit_mentions
from integrations.sentiment import analyze_sentiment
from mock_data import MENTIONS as MOCK_MENTIONS

router = APIRouter(prefix="/mentions", tags=["mentions"])

# Cache for real mentions
_real_mentions_cache = None
_use_real_data = True  # Set to False to use mock data


def get_real_mentions():
    """Fetch real mentions from Reddit + sentiment analysis."""
    global _real_mentions_cache

    if _real_mentions_cache is not None:
        return _real_mentions_cache

    print("Fetching real mentions from Reddit...")
    mentions = fetch_reddit_mentions(
        brand_keywords=["housing.com", "fake listings", "housing india"],
        subreddits=["mumbai", "bangalore", "india", "realestate"],
        limit=50,
    )

    # Add sentiment analysis
    for mention in mentions:
        sentiment_result = analyze_sentiment(mention["content"])
        mention["sentiment"] = sentiment_result["sentiment"]

        # Simple triage logic
        if mention["reach"] > 5000 and mention["sentiment"] == "negative":
            mention["triage"] = "urgent"
        elif mention["author_followers"] > 50000:
            mention["triage"] = "influencer"
        elif mention["sentiment"] == "negative":
            mention["triage"] = "neutral"
        else:
            mention["triage"] = "neutral"

    # If real data fetch fails, fall back to mock
    if not mentions:
        print("Real data fetch failed, using mock data")
        return MOCK_MENTIONS

    _real_mentions_cache = mentions
    return mentions


@router.get("/")
def get_mentions(
    triage: Optional[TriageLabel] = Query(None),
    platform: Optional[Platform] = Query(None),
    sentiment: Optional[Sentiment] = Query(None),
    crisis_only: bool = Query(False),
):
    """Get mentions with optional filters. Fetches real Reddit data when available."""

    # Try to use real data, fall back to mock if needed
    if _use_real_data:
        try:
            results = get_real_mentions()
        except Exception as e:
            print(f"Real data error: {e}, using mock data")
            results = MOCK_MENTIONS
    else:
        results = MOCK_MENTIONS

    # Apply filters
    if triage:
        results = [m for m in results if m.get("triage") == triage.value]
    if platform:
        results = [m for m in results if m.get("platform") == platform.value]
    if sentiment:
        results = [m for m in results if m.get("sentiment") == sentiment.value]
    if crisis_only:
        results = [m for m in results if m.get("is_crisis", False)]

    return {
        "total": len(results),
        "mentions": results,
        "source": "real (Reddit)" if _use_real_data else "mock",
    }


@router.get("/{mention_id}")
def get_mention(mention_id: str):
    """Get a specific mention by ID."""

    if _use_real_data:
        try:
            all_mentions = get_real_mentions()
        except:
            all_mentions = MOCK_MENTIONS
    else:
        all_mentions = MOCK_MENTIONS

    mention = next((m for m in all_mentions if m.get("id") == mention_id), None)

    if not mention:
        return {"error": "Mention not found"}

    return mention


@router.post("/toggle-real-data")
def toggle_real_data(use_real: bool = True):
    """Toggle between real Reddit data and mock data."""
    global _use_real_data
    _use_real_data = use_real
    return {
        "real_data_enabled": _use_real_data,
        "message": "Switched to " + ("real Reddit data" if use_real else "mock data"),
    }
