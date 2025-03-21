from rest_framework import serializers
from .models import VirtualPortfolio, VirtualTransaction

class VirtualPortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = VirtualPortfolio
        fields = ['id', 'user_profile', 'virtual_asset_symbol', 'virtual_quantity']

class VirtualTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VirtualTransaction
        fields = ['id', 'user_profile', 'virtual_asset_symbol', 'virtual_quantity', 'virtual_transaction_type', 'virtual_price', 'virtual_amount', 'virtual_created_at']