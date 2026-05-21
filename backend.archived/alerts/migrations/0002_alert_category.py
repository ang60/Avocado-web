from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('alerts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='alert',
            name='category',
            field=models.CharField(blank=True, default='', max_length=64),
        ),
    ]
