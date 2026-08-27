from django.core.management.base import BaseCommand
from catalog.models import Product

PRODUCTS = [
    ("Wireless Earbuds Pro", "electronics", 2499, "audio, bluetooth, music, travel", "Noise-cancelling earbuds with 30hr battery."),
    ("Earbuds Charging Case", "accessories", 599, "audio, charging, travel", "Spare charging case compatible with most earbuds."),
    ("Laptop Backpack", "accessories", 1799, "laptop, travel, storage", "Water-resistant backpack with padded laptop sleeve."),
    ("Laptop Sleeve 14-inch", "accessories", 699, "laptop, storage", "Neoprene sleeve for 14-inch laptops."),
    ("Mechanical Keyboard", "electronics", 3499, "typing, gaming, desk", "Tactile mechanical keyboard, RGB backlit."),
    ("Wrist Rest Pad", "accessories", 349, "typing, desk, ergonomics", "Memory foam wrist rest for keyboards."),
    ("Running Shoes", "fitness", 3299, "running, shoes, cardio", "Lightweight running shoes with cushioned sole."),
    ("Moisture-wick Socks (3-pack)", "apparel", 449, "running, apparel, comfort", "Breathable socks for running and gym."),
    ("Smart Fitness Band", "fitness", 1999, "fitness, health, wearable", "Tracks steps, heart rate, and sleep."),
    ("Fitness Band Strap (Spare)", "accessories", 299, "fitness, wearable, spare", "Replacement silicone strap."),
    ("Yoga Mat", "fitness", 899, "yoga, fitness, home", "Non-slip 6mm yoga mat."),
    ("Yoga Blocks (Set of 2)", "fitness", 549, "yoga, fitness, home", "EVA foam blocks for yoga support."),
    ("Stainless Steel Water Bottle", "home", 599, "hydration, gym, travel", "Insulated 1L bottle, keeps cold 24hrs."),
    ("Bottle Cleaning Brush Set", "accessories", 199, "hydration, cleaning", "Brush set for narrow bottles."),
    ("Study Desk Lamp", "home", 1299, "desk, study, lighting", "LED lamp with adjustable brightness."),
    ("Desk Organizer Tray", "home", 449, "desk, study, storage", "Bamboo organizer for stationery."),
    ("Cotton Hoodie", "apparel", 1499, "apparel, casual, winter", "Soft cotton-blend hoodie."),
    ("Thermal Innerwear Set", "apparel", 899, "apparel, winter", "Warm base layer for cold weather."),
    ("Bluetooth Speaker", "electronics", 1899, "audio, music, outdoors", "Portable speaker with 12hr battery."),
    ("Speaker Carry Pouch", "accessories", 249, "audio, travel, storage", "Padded pouch for portable speakers."),
]


class Command(BaseCommand):
    help = "Seed the catalog with mock merchant products for the demo."

    def handle(self, *args, **options):
        Product.objects.all().delete()
        created = 0
        for name, category, price, tags, desc in PRODUCTS:
            Product.objects.create(
                name=name, category=category, price=price, tags=tags, description=desc
            )
            created += 1
        self.stdout.write(self.style.SUCCESS(f"Seeded {created} products."))
