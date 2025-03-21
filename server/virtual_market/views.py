from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import VirtualPortfolio, VirtualTransaction
from .serializers import VirtualPortfolioSerializer, VirtualTransactionSerializer
from account.models import UserProfile
from decimal import Decimal

class VirtualPortfolioView(APIView):
    def get(self, request, id=None):
        try:
            profile = UserProfile.objects.get(user__id=id)
            virtual_portfolios = VirtualPortfolio.objects.filter(user_profile=profile)
            serializer = VirtualPortfolioSerializer(virtual_portfolios, many=True)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

class VirtualTransactionView(APIView):
    def get(self, request, id=None):
        if not id:
            return Response({"error": "User ID is required for GET requests"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile = UserProfile.objects.get(user__id=id)
            virtual_transactions = VirtualTransaction.objects.filter(user_profile=profile)
            serializer = VirtualTransactionSerializer(virtual_transactions, many=True)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, id=None):
        user_id = request.data.get('user_id')
        virtual_asset_type = request.data.get('virtual_asset_type')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = UserProfile.objects.get(user__id=user_id)
            virtual_asset_symbol = request.data.get('virtual_asset_symbol')
            virtual_price = request.data.get('virtual_price')
            virtual_quantity = request.data.get('virtual_quantity', 0)
            virtual_transaction_type = request.data.get('virtual_transaction_type')
            print(virtual_asset_symbol, virtual_price, virtual_quantity, virtual_transaction_type)

            if not all([virtual_asset_symbol, virtual_price, virtual_quantity, virtual_transaction_type]):
                missing_fields = [field for field, value in {
                    "virtual_asset_symbol": virtual_asset_symbol,
                    "virtual_price": virtual_price,
                    "virtual_quantity": virtual_quantity,
                    "virtual_transaction_type": virtual_transaction_type
                }.items() if not value]
                return Response({"error": f"Missing required fields: {missing_fields}"}, status=status.HTTP_400_BAD_REQUEST)

            # Convert and validate virtual_price
            try:
                virtual_price = Decimal(str(virtual_price))
                if virtual_price <= 0:
                    return Response({"error": "Virtual price must be a positive number"}, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError) as e:
                return Response({"error": f"Invalid virtual price format: '{virtual_price}'"}, status=status.HTTP_400_BAD_REQUEST)

            # Convert and validate virtual_quantity
            try:
                virtual_quantity = int(virtual_quantity)
                if virtual_quantity <= 0:
                    return Response({"error": "Virtual quantity must be a positive integer"}, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError) as e:
                return Response({"error": f"Invalid virtual quantity format: '{virtual_quantity}'"}, status=status.HTTP_400_BAD_REQUEST)

            virtual_amount = virtual_price * virtual_quantity

            if virtual_transaction_type == 'buy':
                if profile.virtualbalance < virtual_amount:
                    return Response({"error": "Insufficient virtual balance"}, status=status.HTTP_400_BAD_REQUEST)
                profile.virtualbalance -= virtual_amount
                profile.virtualboughtsum += virtual_amount
                if virtual_asset_type == 'stock':
                    profile.virtualstocks += virtual_amount
                elif virtual_asset_type == 'bond':
                    profile.virtualbonds += virtual_amount
                else:
                    profile.virtualinsurance += virtual_amount

                # Check if VirtualPortfolio exists, create or update accordingly
                try:
                    virtual_portfolio = VirtualPortfolio.objects.get(user_profile=profile, virtual_asset_symbol=virtual_asset_symbol)
                    virtual_portfolio.virtual_quantity = models.F('virtual_quantity') + virtual_quantity
                    virtual_portfolio.save()
                except VirtualPortfolio.DoesNotExist:
                    VirtualPortfolio.objects.create(
                        user_profile=profile,
                        virtual_asset_symbol=virtual_asset_symbol,
                        virtual_quantity=virtual_quantity
                    )

            elif virtual_transaction_type == 'sell':
                try:
                    virtual_portfolio = VirtualPortfolio.objects.get(user_profile=profile, virtual_asset_symbol=virtual_asset_symbol)
                    if virtual_portfolio.virtual_quantity < virtual_quantity:
                        return Response({"error": "Not enough virtual assets to sell"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Calculate virtual profit/loss
                    buy_transactions = VirtualTransaction.objects.filter(
                        user_profile=profile, virtual_asset_symbol=virtual_asset_symbol, virtual_transaction_type='buy'
                    ).order_by('virtual_created_at')
                    remaining_quantity = virtual_quantity
                    total_buy_cost = Decimal('0.00')
                    
                    for buy in buy_transactions:
                        if remaining_quantity <= 0:
                            break
                        qty_to_use = min(remaining_quantity, buy.virtual_quantity)
                        total_buy_cost += qty_to_use * buy.virtual_price
                        remaining_quantity -= qty_to_use
                    
                    virtual_profit_loss = (virtual_amount - total_buy_cost).quantize(Decimal('0.01'))

                    profile.virtualbalance += virtual_amount
                    profile.virtualboughtsum -= virtual_amount
                    if virtual_asset_type == 'stock':
                        profile.virtualstocks -= virtual_amount
                    elif virtual_asset_type == 'bond':
                        profile.virtualbonds -= virtual_amount
                    else:
                        profile.virtualinsurance -= virtual_amount
                        
                    virtual_portfolio.virtual_quantity -= virtual_quantity
                    if virtual_portfolio.virtual_quantity == 0:
                        virtual_portfolio.delete()
                    else:
                        virtual_portfolio.save()

                except VirtualPortfolio.DoesNotExist:
                    return Response({"error": "Virtual portfolio entry not found"}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({"error": "Invalid virtual_transaction_type"}, status=status.HTTP_400_BAD_REQUEST)

            if profile.virtualboughtsum < 0:
                profile.virtualboughtsum = 0
            if profile.virtualstocks < 0:
                profile.virtualstocks = 0

            profile.save()

            virtual_transaction = VirtualTransaction.objects.create(
                user_profile=profile,
                virtual_asset_symbol=virtual_asset_symbol,
                virtual_quantity=virtual_quantity,
                virtual_transaction_type=virtual_transaction_type,
                virtual_price=virtual_price,
                virtual_amount=virtual_amount
            )
            serializer = VirtualTransactionSerializer(virtual_transaction)

            response_data = serializer.data
            if virtual_transaction_type == 'sell':
                response_data['virtual_profit_loss'] = str(virtual_profit_loss)

            return Response(response_data, status=status.HTTP_201_CREATED)

        except UserProfile.DoesNotExist:
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)