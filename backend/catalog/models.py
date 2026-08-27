from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ("electronics", "Electronics"),
        ("accessories", "Accessories"),
        ("apparel", "Apparel"),
        ("home", "Home & Kitchen"),
        ("fitness", "Fitness"),
    ]

    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # in INR
    description = models.TextField(blank=True)
    tags = models.CharField(max_length=300, blank=True, help_text="comma separated keywords")
    stock = models.PositiveIntegerField(default=100)

    def __str__(self):
        return f"{self.name} (Rs.{self.price})"
