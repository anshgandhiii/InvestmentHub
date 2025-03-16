from django.db import models
from account.models import UserProfile
from django.contrib.auth.models import User

class Portfolio(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    asset_symbol = models.CharField(max_length=100)  # e.g., "IBM"
    quantity = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user_profile} - {self.asset_symbol}"

class Transaction(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    asset_symbol = models.CharField(max_length=100)  # e.g., "IBM"
    quantity = models.IntegerField()
    transaction_type = models.CharField(max_length=4, choices=[('buy', 'Buy'), ('sell', 'Sell')])
    price = models.DecimalField(max_digits=15, decimal_places=2)  # Price at transaction time
    amount = models.DecimalField(max_digits=15, decimal_places=2)  # Total cost/value
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_profile} - {self.transaction_type} {self.quantity} of {self.asset_symbol} at {self.price}"