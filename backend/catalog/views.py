from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only catalog API - merchant's product listing."""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
