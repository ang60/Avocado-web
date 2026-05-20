from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('kephis_quarantine', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='KephisThresholdSetting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fruit_fly_limit', models.PositiveIntegerField(default=5)),
                ('fcm_limit', models.PositiveIntegerField(default=2)),
                ('thrips_limit', models.PositiveIntegerField(default=10)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'KEPHIS Threshold Setting',
                'verbose_name_plural': 'KEPHIS Threshold Settings',
            },
        ),
    ]
