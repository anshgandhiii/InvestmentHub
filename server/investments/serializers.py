from rest_framework import serializers
from .models import  Portfolio, Transaction
from .models import UserProfile

class PortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = ['asset_symbol', 'quantity']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'user_profile', 'asset_symbol', 'quantity', 'transaction_type', 'price', 'amount', 'created_at']