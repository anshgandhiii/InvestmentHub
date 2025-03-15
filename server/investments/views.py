from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Asset, Portfolio, Transaction
from .serializers import AssetSerializer, PortfolioSerializer, TransactionSerializer
from account.models import UserProfile

class AssetListView(APIView):
    def get(self, request):
        assets = Asset.objects.all()
        serializer = AssetSerializer(assets, many=True)
        return Response(serializer.data)

class PortfolioView(APIView):
    def get(self, request):
        profile = UserProfile.objects.get(user=request.user)
        portfolio = Portfolio.objects.filter(user_profile=profile)
        serializer = PortfolioSerializer(portfolio, many=True)
        return Response(serializer.data)

class TransactionView(APIView):
    def post(self, request):
        profile = UserProfile.objects.get(user=request.user)
        asset = Asset.objects.get(id=request.data['asset_id'])
        quantity = int(request.data['quantity'])
        transaction_type = request.data['transaction_type']
        amount = asset.price * quantity

        if transaction_type == 'buy':
            if profile.balance < amount:
                return Response({"error": "Insufficient balance"}, status=status.HTTP_400_BAD_REQUEST)
            profile.balance -= amount
            Portfolio.objects.update_or_create(
                user_profile=profile, asset=asset,
                defaults={'quantity': models.F('quantity') + quantity}
            )
        elif transaction_type == 'sell':
            portfolio = Portfolio.objects.get(user_profile=profile, asset=asset)
            if portfolio.quantity < quantity:
                return Response({"error": "Not enough assets to sell"}, status=status.HTTP_400_BAD_REQUEST)
            profile.balance += amount
            portfolio.quantity -= quantity
            if portfolio.quantity == 0:
                portfolio.delete()
            else:
                portfolio.save()

        profile.save()
        transaction = Transaction.objects.create(
            user_profile=profile, asset=asset, quantity=quantity,
            transaction_type=transaction_type, amount=amount
        )
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class SuggestionView(APIView):
    def get(self, request):
        profile = UserProfile.objects.get(user=request.user)
        assets = Asset.objects.filter(risk_level=profile.risk_tolerance)
        serializer = AssetSerializer(assets, many=True)
        return Response(serializer.data)