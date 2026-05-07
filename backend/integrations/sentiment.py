from typing import Dict, Any, Optional

_classifier_en: Optional[Any] = None
_SENTIMENT_ENABLED: Optional[bool] = None


def _get_classifier():
    """Load HF model on first use so uvicorn can bind immediately."""
    global _classifier_en, _SENTIMENT_ENABLED
    if _SENTIMENT_ENABLED is not None:
        return _classifier_en
    try:
        from transformers import pipeline

        _classifier_en = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            device=-1,
        )
        _SENTIMENT_ENABLED = True
    except Exception as e:
        print(f"Sentiment model load warning: {e}")
        _classifier_en = None
        _SENTIMENT_ENABLED = False
    return _classifier_en


def analyze_sentiment(text: str, max_length: int = 512) -> Dict[str, Any]:
    """Analyze sentiment of text using HuggingFace transformers."""

    classifier_en = _get_classifier()
    if not _SENTIMENT_ENABLED or classifier_en is None:
        return {"sentiment": "neutral", "confidence": 0.5}

    try:
        truncated_text = text[:max_length]

        result = classifier_en(truncated_text)[0]
        label = result["label"]
        score = result["score"]

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
    """Batch sentiment for multiple texts."""

    classifier_en = _get_classifier()
    if not _SENTIMENT_ENABLED or classifier_en is None:
        return [{"sentiment": "neutral", "confidence": 0.5}] * len(texts)

    try:
        results = classifier_en(texts, batch_size=batch_size)
        return results
    except Exception as e:
        print(f"Batch sentiment error: {e}")
        return [{"sentiment": "neutral", "confidence": 0.5}] * len(texts)


POSITIVE_KEYWORDS = ["great", "excellent", "good", "love", "amazing", "best", "impressed", "happy"]
NEGATIVE_KEYWORDS = ["bad", "terrible", "worst", "hate", "awful", "scam", "fraud", "fake", "broken"]


def simple_sentiment(text: str) -> str:
    text_lower = text.lower()

    pos_count = sum(1 for word in POSITIVE_KEYWORDS if word in text_lower)
    neg_count = sum(1 for word in NEGATIVE_KEYWORDS if word in text_lower)

    if neg_count > pos_count:
        return "negative"
    elif pos_count > neg_count:
        return "positive"
    else:
        return "neutral"
