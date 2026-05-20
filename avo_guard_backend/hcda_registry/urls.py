from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import FarmerRegistrationViewSet, HcdaCountyOverviewAPIView

router = DefaultRouter()
router.register(r'farmers', FarmerRegistrationViewSet, basename='farmer-registration')

urlpatterns = [
    path('county-overview/', HcdaCountyOverviewAPIView.as_view(), name='hcda-county-overview'),
    path('', include(router.urls)),
]

