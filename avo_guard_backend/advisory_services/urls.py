from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdvisoryViewSet

router = DefaultRouter()
router.register(r'advisories', AdvisoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
