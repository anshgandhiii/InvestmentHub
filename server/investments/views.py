from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Portfolio, Transaction
from .serializers import PortfolioSerializer, TransactionSerializer
from account.models import UserProfile
import google.generativeai as genai
from .tools import InvestmentPortalTools
import yfinance as yf
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.db import models
from decimal import Decimal
# import logging

# Configure logging
# logger = logging.getLogger(_name_)

class PortfolioView(APIView):
    def get(self, request, id=None):
        try:
            profile = UserProfile.objects.get(user__id=id)
            portfolios = Portfolio.objects.filter(user_profile=profile)
            serializer = PortfolioSerializer(portfolios, many=True)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

class TransactionView(APIView):
    def get(self, request, id=None):
        # logger.info(f"GET request received with id={id}")
        if not id:
            # logger.error("User ID is required for GET requests")
            return Response({"error": "User ID is required for GET requests"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile = UserProfile.objects.get(user__id=id)
            # logger.info(f"Found UserProfile for user_id={id}")
            transactions = Transaction.objects.filter(user_profile=profile)
            serializer = TransactionSerializer(transactions, many=True)
            # logger.info(f"Returning {len(serializer.data)} transactions for user_id={id}")
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            # logger.error(f"UserProfile not found for user_id={id}")
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, id=None):
        # logger.info(f"POST request received with data: {request.data}")
        
        user_id = request.data.get('user_id')
        asset_type = request.data.get('asset_type')
        if not user_id:
            # logger.error("user_id is missing in request data")
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = UserProfile.objects.get(user__id=user_id)
            # logger.info(f"Found UserProfile for user_id={user_id}")

            asset_symbol = request.data.get('asset_symbol')
            price = request.data.get('price')
            quantity = request.data.get('quantity', 0)
            transaction_type = request.data.get('transaction_type')

            # logger.info(f"Parsed data: asset_symbol={asset_symbol}, price={price}, quantity={quantity}, transaction_type={transaction_type}")

            if not all([asset_symbol, price, quantity, transaction_type]):
                missing_fields = [field for field, value in {
                    "asset_symbol": asset_symbol,
                    "price": price,
                    "quantity": quantity,
                    "transaction_type": transaction_type
                }.items() if not value]
                # logger.error(f"Missing required fields: {missing_fields}")
                return Response({"error": f"Missing required fields: {missing_fields}"}, status=status.HTTP_400_BAD_REQUEST)

            # Convert and validate price
            try:
                price = Decimal(str(price))
                if price <= 0:
                    # logger.error(f"Invalid price: {price} (must be positive)")
                    return Response({"error": "Price must be a positive number"}, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError) as e:
                # logger.error(f"Failed to convert price '{price}' to Decimal: {str(e)}")
                return Response({"error": f"Invalid price format: '{price}'"}, status=status.HTTP_400_BAD_REQUEST)

            # Convert and validate quantity
            try:
                quantity = int(quantity)
                if quantity <= 0:
                    # logger.error(f"Invalid quantity: {quantity} (must be positive)")
                    return Response({"error": "Quantity must be a positive integer"}, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError) as e:
                # logger.error(f"Failed to convert quantity '{quantity}' to int: {str(e)}")
                return Response({"error": f"Invalid quantity format: '{quantity}'"}, status=status.HTTP_400_BAD_REQUEST)

            amount = price * quantity
            # logger.info(f"Calculated amount: {amount}")

            if transaction_type == 'buy':
                if profile.balance < amount:
                    # logger.error(f"Insufficient balance: {profile.balance} < {amount}")
                    return Response({"error": "Insufficient balance"}, status=status.HTTP_400_BAD_REQUEST)
                profile.balance -= amount
                profile.boughtsum += amount
                if asset_type == 'stock':
                    profile.stocks += amount
                elif asset_type == 'bond':
                    profile.bonds += amount
                else:
                    profile.insurance += amount
                # logger.info(f"Buying {quantity} of {asset_symbol} at {price} for {amount}")

                # Check if Portfolio exists, create or update accordingly
                try:
                    portfolio = Portfolio.objects.get(user_profile=profile, asset_symbol=asset_symbol)
                    # logger.info(f"Found existing portfolio for {asset_symbol}, updating quantity")
                    portfolio.quantity = models.F('quantity') + quantity
                    portfolio.save()
                except Portfolio.DoesNotExist:
                    # logger.info(f"No portfolio found for {asset_symbol}, creating new entry")
                    Portfolio.objects.create(
                        user_profile=profile,
                        asset_symbol=asset_symbol,
                        quantity=quantity
                    )

            elif transaction_type == 'sell':
                try:
                    portfolio = Portfolio.objects.get(user_profile=profile, asset_symbol=asset_symbol)
                    if portfolio.quantity < quantity:
                        # logger.error(f"Not enough assets to sell: {portfolio.quantity} < {quantity}")
                        return Response({"error": "Not enough assets to sell"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Calculate profit/loss
                    buy_transactions = Transaction.objects.filter(
                        user_profile=profile, asset_symbol=asset_symbol, transaction_type='buy'
                    ).order_by('created_at')
                    remaining_quantity = quantity
                    total_buy_cost = Decimal('0.00')
                    
                    for buy in buy_transactions:
                        if remaining_quantity <= 0:
                            break
                        qty_to_use = min(remaining_quantity, buy.quantity)
                        total_buy_cost += qty_to_use * buy.price
                        remaining_quantity -= qty_to_use
                    
                    profit_loss = (amount - total_buy_cost).quantize(Decimal('0.01'))
                    # logger.info(f"Selling {quantity} of {asset_symbol} at {price} for {amount}. Profit/Loss: {profit_loss}")

                    profile.balance += amount
                    profile.boughtsum -= amount
                    if asset_type == 'stock':
                        profile.stocks -= amount
                    elif asset_type == 'bond':
                        profile.bonds -= amount
                    else:
                        profile.insurance -= amount
                        
                    portfolio.quantity -= quantity
                    if portfolio.quantity == 0:
                        portfolio.delete()
                        # logger.info(f"Deleted portfolio entry for {asset_symbol}")
                    else:
                        portfolio.save()
                        # logger.info(f"Updated portfolio quantity for {asset_symbol} to {portfolio.quantity}")

                except Portfolio.DoesNotExist:
                    # logger.error(f"Portfolio entry not found for {asset_symbol}")
                    return Response({"error": "Portfolio entry not found"}, status=status.HTTP_404_NOT_FOUND)
            else:
                # logger.error(f"Invalid transaction_type: {transaction_type}")
                return Response({"error": "Invalid transaction_type"}, status=status.HTTP_400_BAD_REQUEST)

            if profile.boughtsum < 0:
                profile.boughtsum = 0
            if profile.stocks < 0:
                profile.stocks = 0

            profile.save()
            # logger.info(f"Updated UserProfile: balance={profile.balance}, boughtsum={profile.boughtsum}, stocks={profile.stocks}")

            transaction = Transaction.objects.create(
                user_profile=profile, asset_symbol=asset_symbol, quantity=quantity,
                transaction_type=transaction_type, price=price, amount=amount
            )
            serializer = TransactionSerializer(transaction)
            # logger.info(f"Created transaction: {transaction}")

            response_data = serializer.data
            if transaction_type == 'sell':
                response_data['profit_loss'] = str(profit_loss)
                # logger.info(f"Added profit_loss to response: {profit_loss}")

            return Response(response_data, status=status.HTTP_201_CREATED)

        except UserProfile.DoesNotExist:
            # logger.error(f"UserProfile not found for user_id={user_id}")
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # logger.error(f"Unexpected error: {str(e)}")
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
    - Buy assets: Call tools.buy_asset(user_id, asset_name, quantity)
    - Sell assets: Call tools.sell_asset(user_id, asset_name, quantity)
    - Check portfolio: Call tools.get_portfolio(user_id)
    - Get sentiment: Call tools.get_sentiment(asset_name) (returns {{'sentiment': {{'score': float, 'sentiment': str}}}})
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