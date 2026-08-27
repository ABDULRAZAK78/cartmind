from django.db import models
from catalog.models import Product


class Cart(models.Model):
    """A single shopping session for a (mock) customer."""
    STATUS_CHOICES = [
        ("active", "Active"),
        ("abandoned", "Abandoned"),
        ("recovered", "Recovered"),
    ]

    session_id = models.CharField(max_length=100, unique=True)
    customer_name = models.CharField(max_length=100, blank=True, default="Guest")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)

    def baseline_total(self):
        return sum(item.subtotal() for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def subtotal(self):
        return self.product.price * self.quantity
