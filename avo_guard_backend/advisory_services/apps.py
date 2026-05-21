from django.apps import AppConfig


class AdvisoryServicesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'advisory_services'

    def ready(self):
        import advisory_services.signals
