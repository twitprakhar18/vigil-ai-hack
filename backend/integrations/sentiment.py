from transformers import pipeline
from typing import Dict, Any

try:
    # Load English sentiment model
    classifier_en = pipeline(
        "sentiment-analysis",
        model="distilbert-base-uncased-finetuned-sst-2-english",
        device=-1,  # CPU (-1) or GPU (0)
    )
    SENTIMENT_ENABLED = True
except Exception as e:
    print(f"Sentiment model load warning: {e}")
    classifier_en = None
    SENTIMENT_ENABLED = False


def analyze_sentiment(text: str, max_length: int = 512) -> Dict[str, Any]:
    """Analyze sentiment of text using HuggingFace transformers."""

    if not SENTIMENT_ENABLED or classifier_en is None:
        return {"sentiment": "neutral", "confidence": 0.5}

    try:
        # Truncate long texts
        truncated_text = text[:max_length]

        result = classifier_en(truncated_text)[0]
        label = result["label"]  # POSITIVE or NEGATIVE
        score = result["score"]

        # Convert to our schema
        if label == "POSITIVE" and score > 0.7:
            sentiment = "positive"
        elif label == "NEGATIVE" and score > 0.7:
            sentiment = "negative"
        else:
            sentiment = "neutral"

        return {"sentiment": sentiment, "confidence": score}

    except Exception as e:
        print(f"Sentiment analysis error: {e}")
        return {"sentiment": "neutral", "confidence": 0.5}


def batch_analyze_sentiments(texts: list, batch_size: int = 8) -> list:
    """Analyze sentiment for multiple texts."""

    if not SENTIMENT_ENABLED or classifier_en is None:
        return [{"sentiment": "neutral", "confidence": 0.5}] * len(texts)

    try:
        results = classifier_en(texts, batch_size=batch_size)
        return results
    except Exception as e:
        print(f"Batch sentiment error: {e}")
        return [{"sentiment": "neutral", "confidence": 0.5}] * len(texts)


# Simple keyword-based fallback if model fails
POSITIVE_KEYWORDS = ["great", "excellent", "good", "love", "amazing", "best", "impressed", "happy"]
NEGATIVE_KEYWORDS = ["bad", "terrible", "worst", "hate", "awful", "scam", "fraud", "fake", "broken"]


def simple_sentiment(text: str) -> str:
    """Fallback rule-based sentiment."""
    text_lower = text.lower()

    pos_count = sum(1 for word in POSITIVE_KEYWORDS if word in text_lower)
    neg_count = sum(1 for word in NEGATIVE_KEYWORDS if word in text_lower)

    if neg_count > pos_count:
        return "negative"
    elif pos_count > neg_count:
        return "positive"
    else:
        return "neutral"
