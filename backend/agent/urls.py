from django.urls import path
from .views import GenerateRecoveryView, MarkRecoveredView, DashboardView

urlpatterns = [
    path("agent/recover/", GenerateRecoveryView.as_view()),
    path("agent/mark_recovered/", MarkRecoveredView.as_view()),
    path("agent/dashboard/", DashboardView.as_view()),
]
