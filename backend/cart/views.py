from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Cart, CartItem
from .serializers import CartSerializer
from catalog.models import Product


class CartViewSet(viewsets.ViewSet):
    """
    Simple session-based cart.
    GET    /api/cart/<session_id>/             -> view cart
    POST   /api/cart/<session_id>/add_item/    -> add product to cart
    POST   /api/cart/<session_id>/remove_item/ -> remove product from cart
    POST   /api/cart/<session_id>/abandon/     -> mark cart abandoned (demo trigger,
                                                    normally a background job would do
                                                    this after N minutes of inactivity)
    """

    def _get_or_create_cart(self, session_id, request=None):
        customer_name = "Guest"
        if request and hasattr(request, "user") and request.user.is_authenticated:
            customer_name = request.user.first_name or request.user.username
        elif request and hasattr(request, "data") and isinstance(request.data, dict) and request.data.get("customer_name"):
            customer_name = request.data.get("customer_name")

        cart, created = Cart.objects.get_or_create(
            session_id=session_id,
            defaults={"customer_name": customer_name}
        )
        if not created and customer_name != "Guest" and cart.customer_name != customer_name:
            cart.customer_name = customer_name
            cart.save()
        return cart

    def retrieve(self, request, pk=None):
        cart = self._get_or_create_cart(pk, request)
        return Response(CartSerializer(cart).data)

    @action(detail=True, methods=["post"])
    def add_item(self, request, pk=None):
        cart = self._get_or_create_cart(pk, request)
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, defaults={"quantity": quantity},
        )
        if not created:
            item.quantity += quantity
            item.save()

        cart.status = "active"
        cart.save()  # last_activity auto-updates via auto_now

        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def remove_item(self, request, pk=None):
        cart = self._get_or_create_cart(pk, request)
        product_id = request.data.get("product_id")
        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        if not cart.items.exists():
            cart.status = "active"
            cart.save()
        return Response(CartSerializer(cart).data)

    @action(detail=True, methods=["post"])
    def abandon(self, request, pk=None):
        """
        Demo trigger: mark this cart abandoned right now, instead of waiting
        for a real inactivity timeout. In production this would be a
        scheduled job checking last_activity across all active carts.
        """
        cart = self._get_or_create_cart(pk, request)
        if not cart.items.exists():
            return Response({"error": "Cannot abandon an empty cart"}, status=status.HTTP_400_BAD_REQUEST)
        from agent.models import RecoveryDecision
        RecoveryDecision.objects.filter(session_id=pk, recovered=False).delete()
        cart.status = "abandoned"
        cart.save()
        return Response(CartSerializer(cart).data)


class AbandonedCartListView(viewsets.ViewSet):
    """GET /api/cart/abandoned/ - all abandoned carts, for the merchant dashboard."""

    def list(self, request):
        carts = Cart.objects.filter(status="abandoned").order_by("-last_activity")
        return Response(CartSerializer(carts, many=True).data)
