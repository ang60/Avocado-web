from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pest_scouting', '0005_scoutingsession_weeklyrecord_session'),
    ]

    operations = [
        migrations.AddField(
            model_name='weeklyrecord',
            name='actions_taken_list',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='weeklyrecord',
            name='beneficial_insects_observed_list',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='weeklyrecord',
            name='disease_list',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='weeklyrecord',
            name='disease_plant_parts_list',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='weeklyrecord',
            name='outcome_list',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='weeklyrecord',
            name='pest_plant_parts_affected_list',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='weeklyrecord',
            name='pests_observed_list',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='weeklyrecord',
            name='raw_payload',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
