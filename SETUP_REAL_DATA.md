# Vigil.ai Real Data Setup — Step by Step

Get your Vigil.ai dashboard pulling **live Reddit mentions + Claude-powered GEO audit** in 10 minutes.

---

## Quick Start (Minimal Setup)

Run with mock data + Claude only (no Reddit API needed):

```bash
cd vigil-ai/backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Create .env file
cp .env.example .env

# 3. Add your Claude API key
# Edit .env and set:
#   ANTHROPIC_API_KEY=sk-ant-...

# 4. Run backend
uvicorn main:app --reload
# Backend at http://localhost:8000
```

Then in another terminal:

```bash
cd vigil-ai/frontend

# 1. Install
npm install

# 2. Run
npm run dev
# Frontend at http://localhost:3000
```

**Dashboard works with mock Reddit data + real Claude GEO audit.**

---

## Full Setup (Real Reddit + Real GEO)

### Step 1: Reddit API Setup (5 min)

1. Go to: https://reddit.com/prefs/apps
2. Click "Create another app..."
3. Fill in:
   - **name:** `vigil-ai-dev`
   - **type:** `script`
   - Click **Create app**

4. You'll see a page with your credentials:
   ```
   Client ID: (top-left under app name)
   Client Secret: (labeled as "secret")
   ```

5. Update your `.env`:
   ```bash
   REDDIT_CLIENT_ID=abc123xyz...
   REDDIT_CLIENT_SECRET=def456uvw...
   REDDIT_USER_AGENT=vigil-ai/1.0
   ```

6. Test:
   ```bash
   python3 << 'EOF'
   import praw
   import os
   from dotenv import load_dotenv
   
   load_dotenv()
   
   reddit = praw.Reddit(
       client_id=os.getenv("REDDIT_CLIENT_ID"),
       client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
       user_agent=os.getenv("REDDIT_USER_AGENT")
   )
   
   print("✅ Reddit API connected!")
   print(f"Subreddit count: {len(list(reddit.subreddits.popular(limit=1)))}")
   EOF
   ```

### Step 2: Sentiment Analysis (Auto — No Setup)

The HuggingFace sentiment model downloads automatically on first use (~500MB). Models:
- **English:** `distilbert-base-uncased-finetuned-sst-2-english` (default)
- **Hindi:** Uncomment in `integrations/sentiment.py` if needed

### Step 3: Claude GEO Audit (Already Configured)

You already have `ANTHROPIC_API_KEY` set. The backend will automatically:
- Query Claude to audit LLM citations
- Parse responses for brand mentions
- Compare vs competitors (MagicBricks, 99acres, etc.)
- Identify semantic gaps

---

## Testing Real Data Flow

### Test 1: Fetch Real Reddit Mentions

```bash
python3 << 'EOF'
import sys
sys.path.insert(0, './backend')
from integrations.reddit import fetch_reddit_mentions

mentions = fetch_reddit_mentions(
    ["housing.com", "fake listings"],
    limit=10
)

print(f"Fetched {len(mentions)} mentions:")
for m in mentions[:3]:
    print(f"  - {m['author']}: {m['content'][:80]}...")
EOF
```

Expected output:
```
Fetched 10 mentions:
  - u/frustrated_buyer: Housing.com showed me 47 listings in Bandra. ALL FAKE...
  - u/bangalore_seeker: PSA for Bangalore folks: Housing.com listings are 60-70%...
```

### Test 2: Sentiment Analysis

```bash
python3 << 'EOF'
import sys
sys.path.insert(0, './backend')
from integrations.sentiment import analyze_sentiment

text = "Housing.com is terrible. Fake listings everywhere!"
result = analyze_sentiment(text)

print(f"Text: '{text}'")
print(f"Sentiment: {result['sentiment']} ({result['confidence']:.2%})")
EOF
```

Expected:
```
Sentiment: negative (95.23%)
```

### Test 3: Real GEO Audit

```bash
python3 << 'EOF'
import sys
sys.path.insert(0, './backend')
from integrations.geo_audit import audit_with_claude

result = audit_with_claude(
    "What is the best real estate portal in India?"
)

print(f"Claude GEO Audit:")
print(f"  Housing.com mentions: {result['housing_mentions']}")
print(f"  Competitors: {result['competitor_mentions']}")
print(f"  AI Share of Voice: {result['ai_share_of_voice']}%")
EOF
```

---

## Dashboard Endpoints

Once backend is running at `localhost:8000`:

### Real Data Endpoints

| Endpoint | Data | Realtime? |
|----------|------|-----------|
| `GET /mentions/` | Reddit mentions + sentiment | ✅ Yes (fetches fresh each time) |
| `GET /mentions/?triage=urgent` | Filtered by urgency | ✅ Yes |
| `GET /geo/audit` | Claude GEO citation audit | ✅ Yes (Claude API) |
| `GET /geo/sov` | Share of Voice trend | ⏸️ Mock (easy to add real data) |
| `POST /mentions/toggle-real-data?use_real=true` | Switch real ↔ mock | 🔄 Toggle |

### Example Calls

**Fetch urgent mentions from Reddit:**
```bash
curl "http://localhost:8000/mentions/?triage=urgent"
```

**Fetch GEO audit (queries Claude):**
```bash
curl "http://localhost:8000/geo/audit"
```

**Toggle between real and mock data:**
```bash
curl -X POST "http://localhost:8000/mentions/toggle-real-data?use_real=false"
```

---

## Monitoring & Debugging

### View logs in terminal:

```bash
# Backend logs will show:
# - "Fetching real mentions from Reddit..."
# - "Fetched X mentions from Reddit"
# - "Running real GEO audit via Claude..."
# - Any errors fall back to mock data
```

### Slow first load?

The sentiment model (~500MB) downloads on first use. Subsequent calls are instant.

### Reddit rate limit hit?

Reddit allows 60 requests/minute. If you hit limits:
- Wait 1 minute
- Or reduce `limit` parameter in `fetch_reddit_mentions()`

### Claude timeout?

GEO audit takes 5-10 seconds (Claude API latency). If it times out:
- Check your internet connection
- Verify `ANTHROPIC_API_KEY` is valid
- Backend falls back to mock data automatically

---

## Data Refresh Strategy

By default, data is **cached in memory** for 1 request (simple setup).

For production (auto-refresh every hour):

```python
# In backend/mock_data.py add:

from datetime import datetime, timedelta
import asyncio

_cache = {
    "mentions": None,
    "geo_data": None,
    "updated": None
}
CACHE_TTL = 3600  # 1 hour

async def auto_refresh():
    """Background task to refresh data every hour."""
    while True:
        await asyncio.sleep(CACHE_TTL)
        try:
            _cache["mentions"] = await fetch_all_mentions()
            _cache["geo_data"] = await fetch_all_geo()
            _cache["updated"] = datetime.now()
            print(f"✅ Data refreshed at {_cache['updated']}")
        except Exception as e:
            print(f"Refresh error: {e}")

# Start in main.py:
@app.on_event("startup")
async def startup():
    asyncio.create_task(auto_refresh())
```

---

## Next Steps: Add More Data Sources

### Add Twitter/X (5 min)

```python
# In integrations/twitter.py
import tweepy

client = tweepy.Client(bearer_token=os.getenv("TWITTER_BEARER_TOKEN"))

def fetch_twitter_mentions(query, limit=50):
    tweets = client.search_recent_tweets(query, max_results=limit)
    return [{
        "platform": "twitter",
        "author": tweet.author_id,
        "content": tweet.text,
        ...
    } for tweet in tweets.data]

# In routes/mentions.py, add:
from integrations.twitter import fetch_twitter_mentions

mentions += fetch_twitter_mentions("housing.com")
```

### Add Google Reviews (with ScrapingBee)

```python
# In integrations/google_reviews.py
import requests

def fetch_google_reviews(business_url):
    response = requests.get("https://api.scrapingbee.com/api/v1/", params={
        "api_key": os.getenv("SCRAPINGBEE_API_KEY"),
        "url": business_url
    })
    # Parse reviews...
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "REDDIT_CLIENT_ID not set" | Copy your Reddit credentials to `.env` |
| Sentiment model very slow on first run | First load downloads 500MB model. Be patient (2-3 min). |
| `ModuleNotFoundError: No module named 'praw'` | Run `pip install -r requirements.txt` |
| "Cannot reach backend at localhost:8000" | Check backend is running: `uvicorn main:app --reload` |
| GEO audit returns mock data | Your `ANTHROPIC_API_KEY` may be invalid. Check `.env`. |
| Reddit mentions are all old | Reddit's search goes back 2 years. Results depend on keyword relevance. |

---

## Performance Notes

- **Reddit fetch:** ~2-5 seconds (depends on network)
- **Sentiment analysis:** ~1 second per mention (batch processing)
- **Claude GEO audit:** ~5-10 seconds (API latency)
- **Total first load:** ~20 seconds
- **Subsequent loads (cached):** <100ms

To optimize, add Redis caching (see `REAL_DATA_GUIDE.md`).

---

## You're Ready!

Start the backend:
```bash
cd vigil-ai/backend && uvicorn main:app --reload
```

Start the frontend:
```bash
cd vigil-ai/frontend && npm run dev
```

Visit `http://localhost:3000` and you'll see:
- ✅ **Real Reddit mentions** about Housing.com
- ✅ **Sentiment scores** from HuggingFace
- ✅ **GEO audit** from Claude showing citation gaps
- ✅ All with live data, not dummy data

Enjoy! 🚀
