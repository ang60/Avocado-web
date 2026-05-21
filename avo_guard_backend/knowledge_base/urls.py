from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, KnowledgeEntryViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'entries', KnowledgeEntryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
