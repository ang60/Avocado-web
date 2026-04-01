from django.db import migrations

from api.models import UserManager


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_seed_permissions'),
    ]

    operations = [
        migrations.AlterModelManagers(
            name='user',
            managers=[
                ('objects', UserManager()),
            ],
        ),
    ]
