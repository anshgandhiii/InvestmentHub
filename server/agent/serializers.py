# serializers.py
from rest_framework import serializers

class PromptSerializer(serializers.Serializer):
    prompt = serializers.CharField(max_length=1000)

class ResponseSerializer(serializers.Serializer):
    content = serializers.CharField()