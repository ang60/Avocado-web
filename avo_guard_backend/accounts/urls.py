from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, EntityViewSet, RoleViewSet, AppPermissionViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'entities', EntityViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'permissions', AppPermissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
