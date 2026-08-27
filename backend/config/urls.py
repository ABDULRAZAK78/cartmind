from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("catalog.urls")),
    path("api/", include("cart.urls")),
    path("api/", include("agent.urls")),
    path("api/", include("payments.urls")),
    path("api/", include("accounts.urls")),
]
