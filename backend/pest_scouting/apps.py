from django.apps import AppConfig


class PestScoutingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pest_scouting'

    def ready(self):
        import pest_scouting.signals  # noqa: F401

