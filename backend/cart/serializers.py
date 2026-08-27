from rest_framework import serializers
from .models import Cart, CartItem
from catalog.serializers import ProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity", "subtotal"]

    def get_subtotal(self, obj):
        return obj.subtotal()


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    baseline_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "session_id", "customer_name", "status", "created_at", "last_activity", "items", "baseline_total"]

    def get_baseline_total(self, obj):
        return obj.baseline_total()
