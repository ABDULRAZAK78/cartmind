from django.urls import path
from .views import CreateOrderView, VerifyPaymentView

urlpatterns = [
    path("payments/create_order/", CreateOrderView.as_view()),
    path("payments/verify/", VerifyPaymentView.as_view()),
]
