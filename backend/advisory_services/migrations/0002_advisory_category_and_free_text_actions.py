from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('advisory_services', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='advisory',
            name='category',
            field=models.CharField(blank=True, default='', max_length=64),
        ),
        migrations.AlterField(
            model_name='advisory',
            name='actions_taken',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='advisory',
            name='outcome',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
