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
from decimal import Decimal
import os, json

class InsuranceView(APIView):
    def load_insurance_plans(self):
        """Load insurance plans from insurance.json."""
        file_path = os.path.join(os.path.dirname(__file__), 'insurance.json')
        with open(file_path, 'r') as f:
            return json.load(f)

    def get(self, request):
        """Return insurance plans from insurance.json."""
        user_id = request.headers.get('User-Id')
        if not user_id:
            return Response({"error": "User-Id header is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = UserProfile.objects.get(user__id=user_id)
            plans = self.load_insurance_plans()
            filtered_plans = [plan for plan in plans if plan["risk_level"] == profile.risk_tolerance]
            return Response(filtered_plans if filtered_plans else plans)
        except UserProfile.DoesNotExist:
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except FileNotFoundError:
            return Response({"error": "Insurance data file not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Purchase an insurance plan and store it in the backend."""
        user_id = request.data.get('user_id')
        plan_id = request.data.get('plan_id')
        quantity = int(request.data.get('quantity', 1))

        if not all([user_id, plan_id]):
            return Response({"error": "user_id and plan_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = int(user_id)  # Ensure user_id is an integer
            plan_id = int(plan_id)  # Ensure plan_id is an integer
            profile = UserProfile.objects.get(user__id=user_id)
            plans = self.load_insurance_plans()
            plan = next((p for p in plans if p["id"] == plan_id), None)
            if not plan:
                return Response({"error": "Invalid plan_id"}, status=status.HTTP_400_BAD_REQUEST)

            price = Decimal(plan["price"])
            amount = price * quantity

            if profile.balance < amount:
                return Response({"error": "Insufficient balance"}, status=status.HTTP_400_BAD_REQUEST)

            asset, created = Asset.objects.get_or_create(
                name=plan["name"],
                defaults={
                    "price": price,
                    "asset_type": "insurance",
                    "risk_level": plan["risk_level"]
                }
            )

            profile.balance -= amount
            profile.boughtsum += amount
            profile.save()

            Portfolio.objects.update_or_create(
                user_profile=profile, asset=asset,
                defaults={'quantity': models.F('quantity') + quantity}
            )

            transaction = Transaction.objects.create(
                user_profile=profile, asset=asset, quantity=quantity,
                transaction_type='buy', amount=amount
            )
            serializer = TransactionSerializer(transaction)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except UserProfile.DoesNotExist:
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except FileNotFoundError:
            return Response({"error": "Insurance data file not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError:
            return Response({"error": "Invalid quantity, user_id, or plan_id"}, status=status.HTTP_400_BAD_REQUEST)
        
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
    def get(self, request, id=None):  # Make id optional
        if not id:
            return Response({"error": "User ID is required for GET requests"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile = UserProfile.objects.get(user__id=id)
            transactions = Transaction.objects.filter(user_profile=profile)
            serializer = TransactionSerializer(transactions, many=True)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, id=None):  # id is not needed for POST
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = UserProfile.objects.get(user__id=user_id)
            asset = Asset.objects.get(id=request.data.get('asset_id'))
            quantity = int(request.data.get('quantity', 0))
            transaction_type = request.data.get('transaction_type')

            if not all([asset, quantity, transaction_type]):
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            amount = asset.price * quantity

            if transaction_type == 'buy':
                if profile.balance < amount:
                    return Response({"error": "Insufficient balance"}, status=status.HTTP_400_BAD_REQUEST)
                profile.balance -= amount
                profile.boughtsum += amount
                Portfolio.objects.update_or_create(
                    user_profile=profile, asset=asset,
                    defaults={'quantity': models.F('quantity') + quantity}
                )
            elif transaction_type == 'sell':
                try:
                    portfolio = Portfolio.objects.get(user_profile=profile, asset=asset)
                    if portfolio.quantity < quantity:
                        return Response({"error": "Not enough assets to sell"}, status=status.HTTP_400_BAD_REQUEST)
                    profile.balance += amount
                    profile.boughtsum -= amount
                    portfolio.quantity -= quantity
                    if portfolio.quantity == 0:
                        portfolio.delete()
                    else:
                        portfolio.save()
                except Portfolio.DoesNotExist:
                    return Response({"error": "Portfolio entry not found"}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({"error": "Invalid transaction_type"}, status=status.HTTP_400_BAD_REQUEST)

            if profile.boughtsum < 0:
                profile.boughtsum = 0

            profile.save()
            transaction = Transaction.objects.create(
                user_profile=profile, asset=asset, quantity=quantity,
                transaction_type=transaction_type, amount=amount
            )
            serializer = TransactionSerializer(transaction)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except UserProfile.DoesNotExist:
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Asset.DoesNotExist:
            return Response({"error": "Asset not found"}, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)
    
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