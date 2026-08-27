from django.urls import path
from .views import CartViewSet, AbandonedCartListView

urlpatterns = [
    path("cart/abandoned/", AbandonedCartListView.as_view({"get": "list"})),
    path("cart/<str:pk>/", CartViewSet.as_view({"get": "retrieve"})),
    path("cart/<str:pk>/add_item/", CartViewSet.as_view({"post": "add_item"})),
    path("cart/<str:pk>/remove_item/", CartViewSet.as_view({"post": "remove_item"})),
    path("cart/<str:pk>/abandon/", CartViewSet.as_view({"post": "abandon"})),
]
