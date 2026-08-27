import os
import razorpay

_client = None


def get_client():
    global _client
    if _client is None:
        key_id = os.environ.get("RAZORPAY_KEY_ID")
        key_secret = os.environ.get("RAZORPAY_KEY_SECRET")
        if not key_id or not key_secret:
            raise RuntimeError("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set in environment/.env")
        _client = razorpay.Client(auth=(key_id, key_secret))
    return _client
