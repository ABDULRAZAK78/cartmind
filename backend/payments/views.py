import razorpay
from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from cart.models import Cart
from .razorpay_client import get_client
from .models import Order
from .serializers import OrderSerializer


class CreateOrderView(APIView):
    """
    POST /api/payments/create_order/
    body: {"session_id": "abc123", "discount_percent": 10}  (discount optional)

    Creates a Razorpay TEST MODE order for the cart's total, applying an
    AI-offered recovery discount if one was given.
    """

    def post(self, request):
        session_id = request.data.get("session_id")
        discount_percent = int(request.data.get("discount_percent", 0))

        try:
            cart = Cart.objects.get(session_id=session_id)
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

        total = cart.baseline_total()
        if total <= 0:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        discount_percent = max(0, min(15, discount_percent))  # never trust client input beyond bound
        final_total = total * (Decimal("1") - Decimal(discount_percent) / Decimal("100"))
        amount_paise = int(final_total * 100)

        client = get_client()
        razorpay_order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1,
        })

        order = Order.objects.create(
            session_id=session_id,
            razorpay_order_id=razorpay_order["id"],
            amount=final_total,
        )

        return Response({
            "order": OrderSerializer(order).data,
            "razorpay_order_id": razorpay_order["id"],
            "amount": amount_paise,
            "amount_inr": float(final_total),
            "currency": "INR",
            "key_id": client.auth[0],
        })


class VerifyPaymentView(APIView):
    """
    POST /api/payments/verify/
    body: {razorpay_order_id, razorpay_payment_id, razorpay_signature}

    Verifies the payment signature (audit-critical - never trust the
    frontend's "success" callback alone).
    """

    def post(self, request):
        data = request.data
        client = get_client()

        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": data.get("razorpay_order_id"),
                "razorpay_payment_id": data.get("razorpay_payment_id"),
                "razorpay_signature": data.get("razorpay_signature"),
            })
        except razorpay.errors.SignatureVerificationError:
            Order.objects.filter(razorpay_order_id=data.get("razorpay_order_id")).update(status="failed")
            return Response({"verified": False}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.filter(razorpay_order_id=data.get("razorpay_order_id")).first()
        if order:
            order.status = "paid"
            order.razorpay_payment_id = data.get("razorpay_payment_id")
            order.save()

        return Response({"verified": True, "order": OrderSerializer(order).data if order else None})
