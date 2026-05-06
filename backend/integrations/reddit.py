import requests
from datetime import datetime
from typing import List, Dict, Any

# Reddit's public JSON API endpoint (no auth needed)
REDDIT_API_BASE = "https://www.reddit.com"
USER_AGENT = "vigil-ai/1.0 (Housing.com ORM Dashboard)"

# Search patterns for different brands/topics
SEARCH_PATTERNS = {
    "housing": ["housing.com", "fake listings", "housing india", "property listings"],
    "zomato": ["zomato", "food delivery", "zomato app"],
    "airbnb": ["airbnb", "airbnb india", "short term rental"],
    "default": ["real estate", "property", "listings"]
}


def fetch_reddit_mentions(
    brand_keywords: List[str],
    subreddits: List[str] = ["india", "mumbai", "bangalore", "realestate"],
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """Fetch mentions from Reddit JSON API (no auth needed)."""

    mentions = []
    headers = {"User-Agent": USER_AGENT}

    # Calculate limit per subreddit
    limit_per_sub = max(limit // len(subreddits), 5)

    for subreddit_name in subreddits:
        for keyword in brand_keywords:
            try:
                # Use Reddit's public JSON endpoint
                # Pattern: https://www.reddit.com/r/SUBREDDIT/search.json?q=QUERY&sort=SORT&t=TIME
                url = f"{REDDIT_API_BASE}/r/{subreddit_name}/search.json"

                params = {
                    "q": keyword,
                    "sort": "relevance",  # Options: relevance, hot, top, new, comments
                    "t": "month",         # Options: hour, day, week, month, year, all
                    "limit": limit_per_sub,
                    "restrict_sr": "on"   # Only search in this subreddit
                }

                response = requests.get(url, headers=headers, params=params, timeout=5)
                response.raise_for_status()

                data = response.json()

                # Parse Reddit's response format
                if "data" in data and "children" in data["data"]:
                    for post in data["data"]["children"]:
                        post_data = post.get("data", {})

                        # Filter by minimum engagement
                        if post_data.get("score", 0) > 5:
                            mention = {
                                "id": f"reddit_{post_data.get('id')}",
                                "platform": "reddit",
                                "author": post_data.get("author", "[deleted]"),
                                "author_followers": post_data.get("author_cakeday", 0),  # Rough proxy
                                "content": f"{post_data.get('title', '')}\n\n{post_data.get('selftext', '')[:800]}",
                                "timestamp": datetime.fromtimestamp(post_data.get("created_utc", 0)).isoformat(),
                                "reach": post_data.get("score", 0),
                                "likes": post_data.get("ups", 0),
                                "shares": post_data.get("num_comments", 0),
                                "sentiment": None,  # Will be filled by sentiment analyzer
                                "triage": None,     # Will be filled by triage logic
                                "url": f"https://reddit.com{post_data.get('permalink', '')}",
                                "is_crisis": False,
                                "subreddit": subreddit_name
                            }
                            mentions.append(mention)

                print(f"✅ Fetched from r/{subreddit_name} with '{keyword}': {len([m for m in mentions if m['subreddit'] == subreddit_name])} posts")

            except requests.exceptions.Timeout:
                print(f"⏱️ Timeout fetching r/{subreddit_name} (Reddit slow)")
                continue
            except requests.exceptions.RequestException as e:
                print(f"❌ Error fetching r/{subreddit_name}: {e}")
                continue
            except Exception as e:
                print(f"❌ Parse error for r/{subreddit_name}: {e}")
                continue

    print(f"📊 Total fetched: {len(mentions)} mentions from Reddit")
    return mentions[:limit]


def search_reddit_pattern(
    pattern_name: str = "housing",
    subreddits: List[str] = ["india", "mumbai", "bangalore"],
    limit: int = 30
) -> List[Dict[str, Any]]:
    """Search using predefined patterns for different brands."""

    keywords = SEARCH_PATTERNS.get(pattern_name, SEARCH_PATTERNS["default"])
    return fetch_reddit_mentions(keywords, subreddits, limit)


def fetch_reddit_comments(post_url: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Fetch comments from a specific Reddit post."""

    headers = {"User-Agent": USER_AGENT}
    comments = []

    try:
        # Convert post URL to JSON endpoint
        # Example: https://reddit.com/r/india/comments/xyz/... -> https://reddit.com/r/india/comments/xyz/.json
        if not post_url.endswith(".json"):
            post_url = post_url.rstrip("/") + ".json"

        response = requests.get(post_url, headers=headers, timeout=5)
        response.raise_for_status()

        data = response.json()

        # Reddit returns an array: [post, comments]
        if isinstance(data, list) and len(data) > 1:
            comments_data = data[1].get("data", {}).get("children", [])

            for comment in comments_data[:limit]:
                c_data = comment.get("data", {})
                if c_data.get("type") == "t1":  # Comment type
                    comments.append({
                        "id": c_data.get("id"),
                        "author": c_data.get("author", "[deleted]"),
                        "content": c_data.get("body", ""),
                        "score": c_data.get("score", 0),
                        "timestamp": datetime.fromtimestamp(c_data.get("created_utc", 0)).isoformat(),
                    })

        return comments

    except Exception as e:
        print(f"Error fetching comments: {e}")
        return []
