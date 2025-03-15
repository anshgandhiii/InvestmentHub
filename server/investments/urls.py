from django.urls import path
from .views import  PortfolioView, TransactionView, agent_chat, SentimentAnalysisView

urlpatterns = [
    path('portfolio/<int:id>/', PortfolioView.as_view(), name='portfolio'),
    path('transactions/', TransactionView.as_view(), name='transactions-create'),
    path('sentiment/', SentimentAnalysisView.as_view(), name='sentiment-analysis'),
    path('agent/', agent_chat, name='agent-chat'),
]