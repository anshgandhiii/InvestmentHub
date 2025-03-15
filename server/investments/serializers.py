from rest_framework import serializers
from .models import Asset, Portfolio, Transaction

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'name', 'asset_type', 'price', 'risk_level']

class PortfolioSerializer(serializers.ModelSerializer):
    asset = AssetSerializer()
    class Meta:
        model = Portfolio
        fields = ['id', 'asset', 'quantity', 'purchase_date']

class TransactionSerializer(serializers.ModelSerializer):
    asset = AssetSerializer()
    class Meta:
        model = Transaction
        fields = ['id', 'asset', 'quantity', 'transaction_type', 'amount', 'date']