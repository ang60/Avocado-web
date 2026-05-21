
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from django.views.generic import TemplateView

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/', include('api.urls')),
    path('api/pest-scouting/', include('pest_scouting.urls')),
    path('api/case-management/', include('case_management.urls')),
    path('api/knowledge-base/', include('knowledge_base.urls')),
    path('api/kephis-quarantine/', include('kephis_quarantine.urls')),
    path('api/hcda-registry/', include('hcda_registry.urls')),
    path('api/advisory-services/', include('advisory_services.urls')),
    path('api/alerts/', include('alerts.urls')),
    # API Schema:
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Optional UI:
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

_default_storage = settings.STORAGES.get('default', {}).get('BACKEND', '')
if settings.DEBUG or 'FileSystemStorage' in _default_storage:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
if settings.DEBUG:
    urlpatterns += static('/', document_root=settings.BASE_DIR)
