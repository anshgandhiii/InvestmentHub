from django.urls import path
from .views import AssetListView, PortfolioView, TransactionView, SuggestionView

urlpatterns = [
    path('assets/', AssetListView.as_view(), name='asset-list'),
    path('portfolio/', PortfolioView.as_view(), name='portfolio'),
    path('transactions/', TransactionView.as_view(), name='transactions'),
    path('suggestions/', SuggestionView.as_view(), name='suggestions'),
]