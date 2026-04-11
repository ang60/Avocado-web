from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuarantineManagementViewSet

router = DefaultRouter()
router.register(r'management', QuarantineManagementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

