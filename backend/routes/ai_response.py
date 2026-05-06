import os
import anthropic
from fastapi import APIRouter, HTTPException
from mock_data import MENTIONS
from models import DraftRequest

router = APIRouter(prefix="/ai", tags=["ai"])

VOICE_PROMPTS = {
    "empathetic": "warm, empathetic, and genuinely sorry for the inconvenience",
    "authoritative": "professional, confident, and solution-focused",
    "witty": "friendly, slightly witty, yet still helpful and respectful",
}


@router.post("/draft-response")
def draft_response(req: DraftRequest):
    mention = next((m for m in MENTIONS if m.id == req.mention_id), None)
    if not mention:
        raise HTTPException(status_code=404, detail="Mention not found")

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        # Return a convincing mock draft when no API key is set
        mock_drafts = {
            "1": "Hi! We're really sorry about this experience. Fake listings are something we're actively fighting — our team is reviewing and removing flagged listings daily. Please DM us your contact so we can personally assist you. 🙏",
            "2": "We hear you and this is not the experience we want for anyone. Our 'Verified Listing' program is rolling out in Bangalore next month. DM us and we'll priority-verify listings in your preferred areas.",
            "3": "We take data privacy extremely seriously. We're investigating this immediately. Please DM us your registered email so our security team can reach you within 2 hours.",
            "4": "We're so sorry about this. A 45-min hold is unacceptable. Please share your ticket ID via DM — we'll resolve this today and extend your premium subscription by 30 days.",
            "5": "So sorry the app let you down at the worst possible moment! Our engineering team is on a crash-fix this week. Please DM us the property link — we'll connect you directly with that agent.",
        }
        draft = mock_drafts.get(
            req.mention_id,
            f"Thank you for your feedback. We're looking into this and will get back to you shortly. Please DM us for faster assistance. — Housing.com Team",
        )
        return {"mention_id": req.mention_id, "draft": draft, "brand_voice": req.brand_voice}

    tone = VOICE_PROMPTS.get(req.brand_voice, VOICE_PROMPTS["empathetic"])
    client = anthropic.Anthropic(api_key=api_key)

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=150,
        messages=[
            {
                "role": "user",
                "content": f"""You are a {tone} brand representative for Housing.com, India's leading real estate portal.

Draft a public reply to this customer mention. Rules:
- Max 240 characters (fits a tweet)
- Be {tone}
- Offer a concrete next step (DM, ticket, timeline)
- Do NOT make promises you can't keep (no free refunds, no guaranteed listings)
- Sign off as "— Housing.com Team"

Mention: "{mention.content}"

Reply only with the response text, nothing else.""",
            }
        ],
    )

    return {
        "mention_id": req.mention_id,
        "draft": message.content[0].text.strip(),
        "brand_voice": req.brand_voice,
    }
