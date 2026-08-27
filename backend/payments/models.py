from django.db import models


class Order(models.Model):
    session_id = models.CharField(max_length=100)
    razorpay_order_id = models.CharField(max_length=100, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # INR
    status = models.CharField(
        max_length=20,
        choices=[("created", "Created"), ("paid", "Paid"), ("failed", "Failed")],
        default="created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.razorpay_order_id} - {self.status}"
