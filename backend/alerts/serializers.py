from rest_framework import serializers

from courses.serializers import SectionSerializer

from .models import Subscription


class CreateSubscriptionSerializer(serializers.Serializer):
    section_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )


class DeleteSubscriptionSerializer(serializers.Serializer):
    subscription_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )


class SubscriptionSerializer(serializers.ModelSerializer):
    section = SectionSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = ["id", "section"]
