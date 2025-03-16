from django.urls import path
from .views import  UserProfileDetail, UserRegistrationView, UserLoginView, ProfileView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('profile/<int:id>', ProfileView.as_view(), name='profile'),
    path('profile/<int:user_id>/', UserProfileDetail.as_view(), name='user-profile-detail'),
]
