from rest_framework import serializers


class CreateSubscriptionSerializer(serializers.Serializer):
    term = serializers.CharField()
    course_reference_numbers = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
    )


class DeleteSubscriptionSerializer(serializers.Serializer):
    term = serializers.CharField()
    course_reference_numbers = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
    )
