from rest_framework import serializers
from .models import RecoveryDecision


class RecoveryDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecoveryDecision
        fields = "__all__"
