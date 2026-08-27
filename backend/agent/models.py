from django.db import models


class RecoveryDecision(models.Model):
    """
    Audit trail: every recovery message the AI generated for an
    abandoned cart, its reasoning, and whether it actually worked -
    so every money-influencing action is explainable after the fact.
    """
    session_id = models.CharField(max_length=100)
    cart_snapshot = models.JSONField()          # items in the cart when abandoned
    cart_value = models.DecimalField(max_digits=10, decimal_places=2)
    likely_reason = models.CharField(max_length=100)      # e.g. "price_sensitivity"
    recovery_message = models.TextField()                 # customer-facing message
    discount_percent = models.PositiveIntegerField(default=0)  # 0-15, bounded
    raw_model_output = models.TextField()                  # full LLM response, for audit
    recovered = models.BooleanField(default=False)
    recovered_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recovery for {self.session_id} - recovered={self.recovered}"
