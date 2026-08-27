import os
import json
from groq import Groq

_client = None


def get_client():
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY is not set in environment/.env")
        _client = Groq(api_key=api_key)
    return _client


SYSTEM_PROMPT = """You are RecoverCart, an AI agent that helps a merchant
win back customers who added items to their cart but left without
paying. You are given the abandoned cart's contents and total value.

Your job:
1. Guess the single most likely reason for abandonment, from this fixed
   set only: "price_sensitivity", "indecision", "distraction", "unclear_value".
2. Write a short, honest, non-manipulative recovery message (max 40 words)
   to send the customer. No fake urgency ("only 2 left!"), no guilt-tripping,
   no dark patterns. It should feel like a helpful nudge, not a trick. Mention at least one specific item from the cart by name.
3. Optionally offer a discount between 0 and 15 percent - only if the cart
   value is high enough that a small discount plausibly changes the
   decision, and never as a default reflex.

Respond ONLY with valid JSON in this exact shape, no other text:
{
  "likely_reason": "<one of the four options above>",
  "recovery_message": "<the message>",
  "discount_percent": <integer 0-15>
}
"""


def generate_recovery_message(cart_items, cart_value, customer_name):
    """
    cart_items: list of dicts [{name, category, price, quantity}]
    cart_value: float
    Returns: (parsed_dict, raw_model_text)
    """
    client = get_client()

    user_prompt = json.dumps({
        "customer_name": customer_name,
        "cart_value_inr": cart_value,
        "items": cart_items,
    })

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
        max_completion_tokens=1024,
        reasoning_effort="low",
    )

    raw_text = response.choices[0].message.content
    print("GROQ_DEBUG raw_text repr:", repr(raw_text))

    try:
        cleaned = raw_text.strip().strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()
        parsed = json.loads(cleaned)
    except (json.JSONDecodeError, AttributeError):
        parsed = {
            "likely_reason": "indecision",
            "recovery_message": f"Hi {customer_name}, your cart is still waiting for you — come back anytime!",
            "discount_percent": 0,
        }

    # Clamp discount to the bounded, explainable range regardless of what
    # the model returned - never trust the model for the money-critical field.
    parsed["discount_percent"] = max(0, min(15, int(parsed.get("discount_percent", 0))))

    return parsed, raw_text
