from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuarantineManagementViewSet, ChinaFarmCertificationViewSet

router = DefaultRouter()
router.register(r'management', QuarantineManagementViewSet)
router.register(r'china-farms', ChinaFarmCertificationViewSet, basename='china-farms')

urlpatterns = [
    path('', include(router.urls)),
]

