from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class TriageLabel(str, Enum):
    urgent = "urgent"
    influencer = "influencer"
    spam = "spam"
    neutral = "neutral"


class Platform(str, Enum):
    twitter = "twitter"
    reddit = "reddit"
    google = "google"
    playstore = "playstore"


class Sentiment(str, Enum):
    positive = "positive"
    negative = "negative"
    neutral = "neutral"


class Mention(BaseModel):
    id: str
    platform: Platform
    author: str
    author_followers: int
    content: str
    sentiment: Sentiment
    triage: TriageLabel
    timestamp: str
    reach: int
    likes: int
    shares: int
    ai_draft: Optional[str] = None
    is_crisis: bool = False


class DraftRequest(BaseModel):
    mention_id: str
    brand_voice: str = "empathetic"


class DraftResponse(BaseModel):
    mention_id: str
    draft: str
    brand_voice: str


class LLMCitation(BaseModel):
    llm: str
    housing_mentions: int
    competitor_mentions: dict
    sentiment: str
    cited_urls: List[str]
    ai_share_of_voice: float


class GEOAudit(BaseModel):
    query: str
    results: List[LLMCitation]
    semantic_gaps: List[str]
    recommendations: List[str]


class TrustScore(BaseModel):
    score: int
    sentiment_score: int
    response_rate: int
    geo_score: int
    trend: List[dict]
    breakdown: dict
