from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = 'api'

    def ready(self):
        # Register signals (idempotent import).
        from . import signals  # noqa: F401
