from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pest_scouting', '0002_alter_weeklyrecord_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='farmblock',
            name='boundary_points',
            field=models.JSONField(blank=True, default=list),
        ),
    ]

