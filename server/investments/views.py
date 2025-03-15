from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Asset, Portfolio, Transaction
from .serializers import AssetSerializer, PortfolioSerializer, TransactionSerializer
from account.models import UserProfile
import google.generativeai as genai
from .tools import InvestmentPortalTools
import yfinance as yf
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.db import models

class AssetListView(APIView):
    def get(self, request):
        assets = Asset.objects.all()
        serializer = AssetSerializer(assets, many=True)
        return Response(serializer.data)

class PortfolioView(APIView):
    def get(self, request, id):
        user_id = id  # Get user_id from headers
        profile = UserProfile.objects.get(user__id=user_id)
        print(profile)
        portfolio = Portfolio.objects.filter(user_profile=profile)
        print(portfolio)
        serializer = PortfolioSerializer(portfolio, many=True)
        return Response(serializer.data)

class TransactionView(APIView):
    def get(self, request, id):
        user_id = id
        profile = UserProfile.objects.get(user__id=user_id)
        transactions = Transaction.objects.filter(user_profile=profile)
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    def post(self, request):
        user_id = request.data.get('user_id')
        profile = UserProfile.objects.get(user__id=user_id)
        asset = Asset.objects.get(id=request.data['asset_id'])
        quantity = int(request.data['quantity'])
        transaction_type = request.data['transaction_type']
        amount = asset.price * quantity

        if transaction_type == 'buy':
            if profile.balance < amount:
                return Response({"error": "Insufficient balance"}, status=status.HTTP_400_BAD_REQUEST)
            profile.balance -= amount
            profile.boughtsum += amount  # Increase boughtsum for buy
            Portfolio.objects.update_or_create(
                user_profile=profile, asset=asset,
                defaults={'quantity': models.F('quantity') + quantity}
            )
        elif transaction_type == 'sell':
            portfolio = Portfolio.objects.get(user_profile=profile, asset=asset)
            if portfolio.quantity < quantity:
                return Response({"error": "Not enough assets to sell"}, status=status.HTTP_400_BAD_REQUEST)
            profile.balance += amount
            profile.boughtsum -= amount  # Decrease boughtsum for sell
            portfolio.quantity -= quantity
            if portfolio.quantity == 0:
                portfolio.delete()
            else:
                portfolio.save()

        # Ensure boughtsum doesn't go negative (optional safeguard)
        if profile.boughtsum < 0:
            profile.boughtsum = 0

        profile.save()
        transaction = Transaction.objects.create(
            user_profile=profile, asset=asset, quantity=quantity,
            transaction_type=transaction_type, amount=amount
        )
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class SuggestionView(APIView):
    def get(self, request):
        user_id = request.headers.get('User-Id')
        profile = UserProfile.objects.get(user__id=user_id)
        assets = Asset.objects.filter(risk_level=profile.risk_tolerance)
        serializer = AssetSerializer(assets, many=True)
        return Response(serializer.data)

class SentimentAnalysisView(APIView):
    def get(self, request):
        asset_name = request.query_params.get('asset', '').lower()
        # Mock sentiment analysis (replace with real logic if you have it)
        mock_sentiments = {
            'apple': {'score': 0.8, 'sentiment': 'positive'},
            'tesla': {'score': 0.4, 'sentiment': 'neutral'},
            'govbond': {'score': 0.9, 'sentiment': 'positive'}
        }
        if asset_name in mock_sentiments:
            return Response({'asset': asset_name, 'sentiment': mock_sentiments[asset_name]})
        return Response({'error': 'Asset not found or no sentiment data available'}, status=404)

# Configure Gemini API
genai.configure(api_key="AIzaSyCtPQbf7k3MGvGWgB4yyx1R264neQpgPH8")  # Replace with your key
model = genai.GenerativeModel('gemini-1.5-flash')

# Tools instance
tools = InvestmentPortalTools()

@api_view(['POST'])
def agent_chat(request):
    user_id = request.data.get('user_id')
    query = request.data.get('query', '')
    if not user_id or not query:
        return JsonResponse({'type': 'error', 'data': 'Missing user_id or query'}, status=400)

    # Get user risk tolerance
    risk_tolerance = tools.get_user_risk_tolerance(user_id)

    # Prepare prompt for Gemini with proper escaping
    prompt = f"""
    You are a financial agent for an investment portal. The user (ID: {user_id}) asked: "{query}".
    You can:
    - Buy assets: Call `tools.buy_asset(user_id, asset_name, quantity)`
    - Sell assets: Call `tools.sell_asset(user_id, asset_name, quantity)`
    - Check portfolio: Call `tools.get_portfolio(user_id)`
    - Get sentiment: Call `tools.get_sentiment(asset_name)` (returns {{'sentiment': {{'score': float, 'sentiment': str}}}})
    - Fetch stock data: Use yfinance (e.g., yf.Ticker('AAPL').info)
    - User risk tolerance: {risk_tolerance}

    Respond naturally, execute tasks if requested, and provide advice if asked (e.g., 'Should I buy X?').
    If unclear, ask for clarification. Use markdown for tables if needed.
    """

    # Call Gemini
    try:
        response = model.generate_content(prompt)
        text = response.text
    except Exception as e:
        return JsonResponse({'type': 'error', 'data': f"Error with Gemini API: {str(e)}"}, status=500)

    # Parse and execute tasks
    if 'buy_asset' in text:
        asset_name = query.split('of')[-1].strip().split()[0]  # Rough extraction
        quantity = next((int(w) for w in query.split() if w.isdigit()), 1)
        result = tools.buy_asset(user_id, asset_name, quantity)
        text += f"\n\nAction: {result}"
    elif 'sell_asset' in text:
        asset_name = query.split('of')[-1].strip().split()[0]
        quantity = next((int(w) for w in query.split() if w.isdigit()), 1)
        result = tools.sell_asset(user_id, asset_name, quantity)
        text += f"\n\nAction: {result}"
    elif 'get_portfolio' in text:
        result = tools.get_portfolio(user_id)
        text += f"\n\nPortfolio:\n{result}"
    elif 'should i buy' in query.lower():
        asset_name = query.split('buy')[-1].strip().split()[0]
        sentiment = tools.get_sentiment(asset_name)
        ticker = yf.Ticker(asset_name.upper())
        stock_info = ticker.info
        price = stock_info.get('currentPrice', 'N/A')
        advice = f"Current price: ${price}. Sentiment: {sentiment['sentiment']['sentiment']} ({sentiment['sentiment']['score']}). "
        if sentiment['sentiment']['score'] > 0.7 and risk_tolerance == 'medium':  # Simplified risk check
            advice += f"Good match for your {risk_tolerance} risk tolerance—consider buying!"
        else:
            advice += f"Caution advised—check if it fits your {risk_tolerance} risk tolerance."
        text += f"\n\n{advice}"

    return JsonResponse({'type': 'response', 'data': text})