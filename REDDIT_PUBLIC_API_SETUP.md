# Reddit Public API Setup — Zero Credentials Required ✅

**TL;DR:** No Reddit OAuth needed. Uses Reddit's public JSON endpoint directly.

---

## What Changed

### Before (PRAW OAuth)
- ❌ Need Reddit app credentials
- ❌ Need to create app at reddit.com/prefs/apps
- ❌ Complex OAuth flow

### Now (Public JSON API)
- ✅ **NO credentials needed**
- ✅ Directly calls `https://www.reddit.com/r/{subreddit}/search.json`
- ✅ Works immediately

---

## Setup (2 Steps)

### Step 1: Install Dependencies
```bash
cd vigil-ai/backend
pip install -r requirements.txt
```

### Step 2: Create `.env` File
```bash
cp .env.example .env

# Only need Claude API key:
ANTHROPIC_API_KEY=sk-ant-...
```

**That's it. No Reddit credentials needed.**

---

## How It Works

The code uses Reddit's public search endpoint:

```
https://www.reddit.com/r/india/search.json?q=housing.com&sort=relevance&t=month
```

No authentication required. You can test it directly in your browser:

```bash
curl -H "User-Agent: vigil-ai/1.0" \
  "https://www.reddit.com/r/india/search.json?q=Whitefield&sort=relevance&t=month" \
  | jq '.data.children[0].data.title'
```

---

## Search Patterns

The code searches multiple subreddits + keywords automatically:

```python
# Default search patterns (from integrations/reddit.py)
SEARCH_PATTERNS = {
    "housing": ["housing.com", "fake listings", "housing india"],
    "zomato": ["zomato", "food delivery", "zomato app"],
    "airbnb": ["airbnb", "airbnb india"],
    "default": ["real estate", "property", "listings"]
}
```

To customize for your brand:

```python
# In integrations/reddit.py, add your brand:
SEARCH_PATTERNS = {
    "my_brand": ["keyword1", "keyword2", "keyword3"],
    ...
}
```

Then in routes/mentions.py:

```python
# Change from:
mentions = fetch_reddit_mentions(["housing.com", "fake listings"], limit=50)

# To:
mentions = search_reddit_pattern("my_brand", limit=50)
```

---

## Run It

```bash
# Backend
cd vigil-ai/backend
uvicorn main:app --reload

# Frontend (new terminal)
cd vigil-ai/frontend
npm run dev
```

Visit `http://localhost:3000` and you'll see:
- ✅ **Real Reddit mentions** fetched from public API
- ✅ **Sentiment analysis** on each mention
- ✅ **GEO audit** from Claude
- ✅ **No API credentials** (except Claude)

---

## API Rate Limits

Reddit's public API:
- **60 requests per minute** (generous)
- **No authentication needed**
- **Applies per IP address**

The code respects rate limits and caches results to avoid hitting limits.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | Check backend is running: `uvicorn main:app --reload` |
| No mentions returned | Try different subreddit/keywords. Reddit search is limited to recent posts. |
| "429 Too Many Requests" | You hit rate limit. Wait 1 minute or reduce search frequency. |
| Sentiment analysis slow | First run downloads ML model (~500MB). Subsequent calls are fast. |

---

## Adding Real Twitter/X Data

If you want to add Twitter mentions too (optional):

```bash
# In .env, add:
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Get token at: https://developer.twitter.com/en/portal/dashboard
```

See `REAL_DATA_GUIDE.md` for full Twitter setup.

---

## You're Ready 🚀

**No Reddit credentials. Just run it.**

```bash
pip install -r requirements.txt
cp .env.example .env
# Add your Claude API key to .env
uvicorn main:app --reload
```

Done. Real Reddit data flows instantly.
