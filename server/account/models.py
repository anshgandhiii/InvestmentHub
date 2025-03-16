from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=10000.00)
    risk_tolerance = models.CharField(max_length=10, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='medium')
    email = models.EmailField(max_length=254, blank=True)
    boughtsum = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    stocks = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    bonds = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    insurance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)

    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
