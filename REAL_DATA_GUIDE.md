# Real Data Integration Guide — Vigil.ai

Replace dummy data with live feeds from Reddit, sentiment analysis, and LLM citations.

---

## 1. Reddit API (Easiest — Free)

### Setup
```bash
# 1. Go to reddit.com/prefs/apps
# 2. Create app: name "vigil-ai", type "script"
# 3. Copy: client_id, client_secret, user_agent

# Add to .env
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=vigil-ai/1.0
```

### Integration
```bash
pip install praw
```

Code in `backend/integrations/reddit.py`:
```python
import praw

reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT")
)

def fetch_reddit_mentions(keywords: list[str], limit=50):
    mentions = []
    for subreddit_name in ["mumbai", "bangalore", "india", "realestate"]:
        sub = reddit.subreddit(subreddit_name)
        for post in sub.search(" OR ".join(keywords), time_filter="week", limit=limit//4):
            if post.score > 10:  # Filter by upvotes
                mentions.append({
                    "platform": "reddit",
                    "author": post.author.name if post.author else "deleted",
                    "content": post.title + " " + post.selftext[:500],
                    "reach": post.score,
                    "timestamp": datetime.fromtimestamp(post.created_utc),
                    "url": post.url
                })
    return mentions
```

---

## 2. Sentiment Analysis (HuggingFace — Free)

### Setup
```bash
pip install transformers torch
```

### Code in `backend/integrations/sentiment.py`:
```python
from transformers import pipeline

# Load pretrained sentiment model
classifier = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

def analyze_sentiment(text: str):
    result = classifier(text[:512])  # Truncate to 512 tokens
    label = result[0]['label']  # POSITIVE or NEGATIVE
    score = result[0]['score']
    
    return {
        "sentiment": "positive" if label == "POSITIVE" else "negative" if score > 0.6 else "neutral",
        "confidence": score
    }

# For Indic languages (Hindi), use:
# model="l3cube-pune/marathi-bert-sentiment"
# or fine-tune on your own data
```

---

## 3. Google Reviews Scraping (Semi-Manual)

### Option A: Google Business Profile API (Free tier available)
```bash
pip install google-api-python-client
```

Setup at: https://console.cloud.google.com
- Enable: Google Business Profile API
- Create OAuth credentials
- Add to `.env`: GOOGLE_API_KEY

### Option B: Bright Data / ScrapingBee (Paid but easy)
```bash
pip install requests
```

```python
# ScrapingBee (free tier: 100 reqs/month)
import requests

def fetch_google_reviews(business_url):
    params = {
        'api_key': os.getenv("SCRAPINGBEE_API_KEY"),
        'url': business_url,
        'render_js': 'false'
    }
    response = requests.get('https://api.scrapingbee.com/api/v1/', params=params)
    # Parse HTML to extract reviews
    return parse_reviews(response.text)
```

---

## 4. X/Twitter API (Paid but Comprehensive)

### Setup
```bash
pip install tweepy
```

Register at: https://developer.twitter.com/en/portal/dashboard

```python
import tweepy

client = tweepy.Client(bearer_token=os.getenv("TWITTER_BEARER_TOKEN"))

def fetch_twitter_mentions(query: str, max_results=100):
    tweets = client.search_recent_tweets(
        query=query,
        max_results=min(max_results, 100),
        tweet_fields=['public_metrics', 'created_at'],
        expansions=['author_id'],
        user_fields=['public_metrics']
    )
    
    mentions = []
    for tweet in tweets.data:
        mentions.append({
            "platform": "twitter",
            "author": tweet.author_id,
            "content": tweet.text,
            "reach": tweet.public_metrics['impression_count'],
            "likes": tweet.public_metrics['like_count'],
            "timestamp": tweet.created_at
        })
    return mentions
```

**Cost:** $100/month for Standard tier (2M tweets/month)

---

## 5. LLM Citation Audit (GEO) — Real Implementation

### Setup
```bash
pip install openai  # or use anthropic
```

### Code in `backend/integrations/geo_audit.py`:
```python
import anthropic
import openai

def audit_llm_citations(brand_name: str, query: str):
    results = []
    
    # Query ChatGPT (via OpenAI API)
    openai.api_key = os.getenv("OPENAI_API_KEY")
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": query}],
        temperature=0.7
    )
    chatgpt_text = response['choices'][0]['message']['content']
    housing_count = chatgpt_text.lower().count(brand_name.lower())
    
    results.append({
        "llm": "ChatGPT",
        "brand_mentions": housing_count,
        "full_response": chatgpt_text
    })
    
    # Query Gemini (via Google API)
    # Query Perplexity (via API)
    
    # Parse citations from each response
    return {
        "query": query,
        "results": results,
        "semantic_gaps": identify_gaps(results, brand_name)
    }

def identify_gaps(results, brand_name):
    gaps = []
    # If brand rarely mentioned in specific contexts, flag it
    if all(r['brand_mentions'] < 3 for r in results):
        gaps.append(f"{brand_name} is rarely cited across LLMs for premium/luxury positioning")
    return gaps
```

---

## 6. Full Integration — Updated `mock_data.py`

Replace with a data orchestrator:

```python
from integrations.reddit import fetch_reddit_mentions
from integrations.sentiment import analyze_sentiment
from integrations.geo_audit import audit_llm_citations
from integrations.twitter import fetch_twitter_mentions
import asyncio

BRAND_NAME = "Housing.com"
KEYWORDS = ["housing.com", "fake listings", "housing india"]

async def fetch_all_real_data():
    # Parallel fetch from all sources
    reddit_mentions = fetch_reddit_mentions(KEYWORDS, limit=50)
    twitter_mentions = fetch_twitter_mentions(" OR ".join(KEYWORDS), max_results=50)
    
    # Enrich with sentiment
    for mention in reddit_mentions + twitter_mentions:
        sentiment_result = analyze_sentiment(mention['content'])
        mention['sentiment'] = sentiment_result['sentiment']
        mention['sentiment_confidence'] = sentiment_result['confidence']
    
    # Triage by reach & sentiment
    for mention in reddit_mentions + twitter_mentions:
        if mention['reach'] > 5000 and mention['sentiment'] == 'negative':
            mention['triage'] = 'urgent'
        elif mention.get('author_followers', 0) > 50000:
            mention['triage'] = 'influencer'
        else:
            mention['triage'] = 'neutral'
    
    # GEO audit
    geo_data = audit_llm_citations(BRAND_NAME, 
        "What is the best real estate portal in India?")
    
    return {
        "mentions": reddit_mentions + twitter_mentions,
        "geo_audit": geo_data,
        "last_updated": datetime.now()
    }

# Cache with TTL to avoid rate limits
_cache = {}
_cache_ttl = 3600  # 1 hour

def get_cached_mentions():
    global _cache
    if datetime.now() - _cache.get('updated', datetime.min) > timedelta(seconds=_cache_ttl):
        _cache = asyncio.run(fetch_all_real_data())
    return _cache['mentions']
```

---

## 7. Cost Breakdown

| Source | Cost | Rate Limit | Quality |
|--------|------|-----------|---------|
| Reddit | Free | 60 req/min | Good |
| HuggingFace (sentiment) | Free | — | Very Good |
| Google Reviews | Free tier (limited) | 100 req/day | Excellent |
| Twitter API | $100/mo | 2M tweets/mo | Excellent |
| OpenAI (GPT-4) | $0.03/1K input | — | Excellent |
| Bright Data (scraping) | $0/100 + paid | — | Good |

**Recommended for MVP:** Reddit + HuggingFace + Bright Data = ~$0/month (free tiers)

---

## 8. Updated `.env`

```bash
# Reddit
REDDIT_CLIENT_ID=your_id
REDDIT_CLIENT_SECRET=your_secret
REDDIT_USER_AGENT=vigil-ai/1.0

# Sentiment (HuggingFace token optional for private models)
HUGGINGFACE_API_KEY=optional

# Twitter (optional but recommended)
TWITTER_BEARER_TOKEN=optional

# LLM Citation Audit
OPENAI_API_KEY=optional
ANTHROPIC_API_KEY=already_set

# Scraping (optional)
SCRAPINGBEE_API_KEY=optional
```

---

## 9. Quick Start (Reddit + Sentiment Only)

To go live with just Reddit + sentiment (5 min):

```bash
# 1. Install
pip install praw transformers torch

# 2. Create Reddit app, copy credentials to .env

# 3. Replace mock_data.py calls in routes/mentions.py:
from integrations.reddit import fetch_reddit_mentions
from integrations.sentiment import analyze_sentiment

mentions = fetch_reddit_mentions(["housing.com", "fake listings"], limit=50)
for m in mentions:
    m['sentiment'] = analyze_sentiment(m['content'])['sentiment']
```

Done. You now have **real Reddit data + ML sentiment analysis** flowing through your app.

---

## 10. Production Checklist

- [ ] Add rate limiting (Redis cache)
- [ ] Set up data refresh schedule (Celery or APScheduler)
- [ ] Monitor API quota usage
- [ ] Add error handling for API failures (fallback to mock data)
- [ ] Store mentions in database (Supabase) instead of memory
- [ ] Set up alerts for quota limits
- [ ] Use webhooks where available (X, Reddit streaming)

