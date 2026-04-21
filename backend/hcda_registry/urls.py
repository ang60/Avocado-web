from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import FarmerRegistrationViewSet

router = DefaultRouter()
router.register(r'farmers', FarmerRegistrationViewSet, basename='farmer-registration')

urlpatterns = [
    path('', include(router.urls)),
]

