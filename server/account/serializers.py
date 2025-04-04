from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
from rest_framework import serializers
from .models import UserProfile

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['user', 'balance', 'boughtsum', 'stocks', 'bonds', 'insurance', 'risk_tolerance', 'email', 'virtualbalance', 'virtualboughtsum', 'virtualstocks', 'virtualbonds', 'virtualinsurance']
