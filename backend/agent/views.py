from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from cart.models import Cart
from .groq_client import generate_recovery_message
from .models import RecoveryDecision
from .serializers import RecoveryDecisionSerializer


class GenerateRecoveryView(APIView):
    """
    POST /api/agent/recover/
    body: {"session_id": "abc123"}

    Looks at an abandoned cart, asks the LLM to diagnose why it was
    likely abandoned and write a recovery message, logs the full
    decision (audit trail), and returns it for the merchant dashboard.
    """

    def post(self, request):
        session_id = request.data.get("session_id")
        if not session_id:
            return Response({"error": "session_id required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = Cart.objects.get(session_id=session_id, status="abandoned")
        except Cart.DoesNotExist:
            return Response({"error": "No abandoned cart found for this session"}, status=status.HTTP_404_NOT_FOUND)

        cart_items = [
            {
                "name": item.product.name,
                "category": item.product.category,
                "price": float(item.product.price),
                "quantity": item.quantity,
            }
            for item in cart.items.all()
        ]
        cart_value = float(cart.baseline_total())

        parsed, raw_output = generate_recovery_message(cart_items, cart_value, cart.customer_name)

        decision = RecoveryDecision.objects.create(
            session_id=session_id,
            cart_snapshot=cart_items,
            cart_value=Decimal(str(cart_value)),
            likely_reason=parsed["likely_reason"],
            recovery_message=parsed["recovery_message"],
            discount_percent=parsed["discount_percent"],
            raw_model_output=raw_output,
        )

        return Response(RecoveryDecisionSerializer(decision).data, status=status.HTTP_201_CREATED)


class MarkRecoveredView(APIView):
    """
    POST /api/agent/mark_recovered/
    body: {"decision_id": 1, "amount": 2499.00}

    Called after a successful Razorpay test payment - records that this
    recovery decision actually converted, and how much revenue it
    recovered. This is the number the dashboard's "Revenue Recovered"
    metric is built from.
    """

    def post(self, request):
        decision_id = request.data.get("decision_id")
        amount = request.data.get("amount", 0)

        try:
            decision = RecoveryDecision.objects.get(id=decision_id)
        except RecoveryDecision.DoesNotExist:
            return Response({"error": "Decision not found"}, status=status.HTTP_404_NOT_FOUND)

        decision.recovered = True
        decision.recovered_amount = Decimal(str(amount))
        decision.save()

        cart = Cart.objects.filter(session_id=decision.session_id).first()
        if cart:
            cart.status = "recovered"
            cart.save()

        return Response(RecoveryDecisionSerializer(decision).data)


class DashboardView(APIView):
    """
    GET /api/agent/dashboard/

    Everything the merchant dashboard needs in one call: every recovery
    decision made, plus rollup metrics (total abandoned value, total
    recovered, recovery rate) - the measurable-impact numbers for the pitch.
    """

    def get(self, request):
        decisions = RecoveryDecision.objects.all().order_by("-created_at")
        total_abandoned_value = sum(d.cart_value for d in decisions) or Decimal("0")
        total_recovered = sum(d.recovered_amount for d in decisions if d.recovered) or Decimal("0")
        recovered_count = decisions.filter(recovered=True).count()

        return Response({
            "decisions": RecoveryDecisionSerializer(decisions, many=True).data,
            "metrics": {
                "total_abandoned_value": float(total_abandoned_value),
                "total_recovered": float(total_recovered),
                "carts_attempted": decisions.count(),
                "carts_recovered": recovered_count,
                "recovery_rate_percent": round((recovered_count / decisions.count()) * 100, 1) if decisions.count() else 0,
            },
        })
