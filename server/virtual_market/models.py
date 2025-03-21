from django.db import models
from account.models import UserProfile

class VirtualPortfolio(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    virtual_asset_symbol = models.CharField(max_length=100)  # e.g., "IBM"
    virtual_quantity = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user_profile} - {self.virtual_asset_symbol}"

class VirtualTransaction(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    virtual_asset_symbol = models.CharField(max_length=100)  # e.g., "IBM"
    virtual_quantity = models.IntegerField()
    virtual_transaction_type = models.CharField(max_length=4, choices=[('buy', 'Buy'), ('sell', 'Sell')])
    virtual_price = models.DecimalField(max_digits=15, decimal_places=2)  # Price at transaction time
    virtual_amount = models.DecimalField(max_digits=15, decimal_places=2)  # Total cost/value
    virtual_created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_profile} - {self.virtual_transaction_type} {self.virtual_quantity} of {self.virtual_asset_symbol} at {self.virtual_price}"