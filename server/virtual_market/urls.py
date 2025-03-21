from django.urls import path
from .views import VirtualPortfolioView, VirtualTransactionView

urlpatterns = [
    path('portfolio/<int:id>/', VirtualPortfolioView.as_view(), name='virtual-portfolio'),
    path('transactions/<int:id>/', VirtualTransactionView.as_view(), name='virtual-transaction-get'),
    path('transactions/', VirtualTransactionView.as_view(), name='virtual-transaction-post'),
]