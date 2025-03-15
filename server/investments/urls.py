from django.urls import path
from .views import AssetListView, PortfolioView, TransactionView, SuggestionView, agent_chat, SentimentAnalysisView, InsuranceView

urlpatterns = [
    path('assets/', AssetListView.as_view(), name='asset-list'),
    path('portfolio/<int:id>/', PortfolioView.as_view(), name='portfolio'),
    path('transactions/<int:id>', TransactionView.as_view(), name='transactions-list'),
    path('transactions/', TransactionView.as_view(), name='transactions-create'),
    path('suggestions/', SuggestionView.as_view(), name='suggestions'),
    path('sentiment/', SentimentAnalysisView.as_view(), name='sentiment-analysis'),
    path('agent/', agent_chat, name='agent-chat'),
    path('mock-insurance/', InsuranceView.as_view(), name='mock-insurance'),
]