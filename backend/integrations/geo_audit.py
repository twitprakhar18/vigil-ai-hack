import os
import anthropic
import re
from typing import Dict, List, Any

BRAND_NAME = "Housing.com"


def audit_with_claude(query: str) -> Dict[str, Any]:
    """Query Claude to audit brand mentions in LLM responses."""

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("ANTHROPIC_API_KEY not set")
        return _mock_geo_result(query)

    try:
        client = anthropic.Anthropic(api_key=api_key)

        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            messages=[
                {
                    "role": "user",
                    "content": f"""Answer this query comprehensively and naturally, as if you were an expert:

"{query}"

Include specific recommendations, brand names where relevant, and cite real examples.""",
                }
            ],
        )

        response_text = message.content[0].text

        # Parse response for brand mentions
        brand_mentions = count_brand_mentions(response_text, BRAND_NAME)
        competitor_mentions = count_competitor_mentions(response_text)

        return {
            "llm": "Claude Sonnet",
            "housing_mentions": brand_mentions,
            "competitor_mentions": competitor_mentions,
            "sentiment": "positive" if "Housing.com" in response_text else "neutral",
            "response_excerpt": response_text[:500],
            "cited_urls": extract_urls(response_text),
            "ai_share_of_voice": calculate_sov(
                brand_mentions, competitor_mentions
            ),
        }

    except Exception as e:
        print(f"Claude audit error: {e}")
        return _mock_geo_result(query)


def count_brand_mentions(text: str, brand: str) -> int:
    """Count mentions of brand in text."""
    pattern = r"\b" + re.escape(brand) + r"\b"
    return len(re.findall(pattern, text, re.IGNORECASE))


def count_competitor_mentions(text: str) -> Dict[str, int]:
    """Count mentions of known competitors."""
    competitors = {
        "MagicBricks": 0,
        "99acres": 0,
        "NoBroker": 0,
        "PropTiger": 0,
        "Nestaway": 0,
    }

    for competitor in competitors:
        pattern = r"\b" + re.escape(competitor) + r"\b"
        competitors[competitor] = len(
            re.findall(pattern, text, re.IGNORECASE)
        )

    return {k: v for k, v in competitors.items() if v > 0}


def extract_urls(text: str) -> List[str]:
    """Extract URLs from text."""
    url_pattern = r"https?://[^\s\)]+"
    urls = re.findall(url_pattern, text)
    return list(set(urls))[:5]  # Return unique URLs, max 5


def calculate_sov(brand_count: int, competitor_counts: Dict[str, int]) -> float:
    """Calculate Share of Voice percentage."""
    total = brand_count + sum(competitor_counts.values())
    if total == 0:
        return 0.0
    return round((brand_count / total) * 100, 1)


def _mock_geo_result(query: str) -> Dict[str, Any]:
    """Fallback mock result when Claude is unavailable."""
    return {
        "llm": "Claude Sonnet (Mock)",
        "housing_mentions": 3,
        "competitor_mentions": {"MagicBricks": 12, "99acres": 8, "NoBroker": 6},
        "sentiment": "neutral",
        "response_excerpt": "Mock response (Claude API not configured)",
        "cited_urls": ["housing.com", "magicbricks.com"],
        "ai_share_of_voice": 12.5,
    }


def run_geo_audit(brand_name: str = BRAND_NAME) -> Dict[str, Any]:
    """Run full GEO audit against key queries."""

    queries = [
        "What is the best real estate portal in India to find apartments for rent?",
        "How do I find verified property listings in India?",
        "Which real estate app is safest from fake listings?",
    ]

    results = []

    for query in queries:
        audit = audit_with_claude(query)
        results.append(audit)

    # Identify semantic gaps
    gaps = identify_gaps(results, brand_name)
    recommendations = generate_recommendations(results, gaps, brand_name)

    return {
        "query": queries[0],
        "results": results,
        "semantic_gaps": gaps,
        "recommendations": recommendations,
        "avg_sov": round(
            sum(r["ai_share_of_voice"] for r in results) / len(results), 1
        ),
    }


def identify_gaps(results: List[Dict[str, Any]], brand_name: str) -> List[str]:
    """Identify where brand is missing mentions."""
    gaps = []

    # Calculate average mentions
    avg_mentions = sum(r["housing_mentions"] for r in results) / len(results)

    if avg_mentions < 3:
        gaps.append(
            f"{brand_name} is rarely cited across LLMs — competitors dominate"
        )

    # Check for specific context gaps
    if all(r["housing_mentions"] == 0 for r in results):
        gaps.append(
            f"{brand_name} is not mentioned for premium/luxury positioning"
        )

    if not any(r["cited_urls"] for r in results):
        gaps.append(f"{brand_name} citations do not include official website URLs")

    return gaps


def generate_recommendations(
    results: List[Dict[str, Any]], gaps: List[str], brand_name: str
) -> List[str]:
    """Generate recommendations to improve GEO."""
    recommendations = []

    if gaps:
        recommendations.append(
            f"Publish a thought leadership piece: 'How {brand_name} Detects Fake Listings in India' to get cited by LLMs"
        )
        recommendations.append(
            f"Create an FAQ page targeting: 'verified listings India' to rank in LLM responses"
        )

    recommendations.append(
        f"Add schema.org markup to your listing verification pages so LLMs can cite you as authoritative"
    )
    recommendations.append(
        f"Build a free 'GEO Report' for customers comparing {brand_name} against competitors — LLMs will cite this"
    )

    return recommendations
