import os
import uuid
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum

class Farm(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer_name = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='farms')
    farm_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    number_of_blocks = models.PositiveIntegerField(default=0)
    farm_size = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return self.farm_name

class FarmBlock(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm_name = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='blocks', null=True, blank=True)
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='farm_blocks')
    block_name = models.CharField(max_length=255)
    number_of_trees = models.PositiveIntegerField()
    boundary_points = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.block_name} - {self.farmer.phone_number}"

def generate_unique_filename(filename):
    """Generates a unique filename using UUID while preserving the extension."""
    ext = os.path.splitext(filename)[1]
    return f"{uuid.uuid4().hex}{ext}"

def dont_know_variety_photo_path(instance, filename):
    return f'weekly_records/user_{instance.farmer.id}/record_{instance.id}/dont_know/variety_photo/{generate_unique_filename(filename)}'

def dont_know_variety_voice_path(instance, filename):
    return f'weekly_records/user_{instance.farmer.id}/record_{instance.id}/dont_know_variety_voice/{generate_unique_filename(filename)}'

def dont_know_trap_photo_path(instance, filename):
    return f'weekly_records/user_{instance.farmer.id}/record_{instance.id}/dont_know_trap_photo/{generate_unique_filename(filename)}'

def other_trap_photo_path(instance, filename):
    return f'weekly_records/user_{instance.farmer.id}/record_{instance.id}/traps/{generate_unique_filename(filename)}'

def dont_know_pest_photo_path(instance, filename):
    return f'weekly_records/user_{instance.farmer.id}/record_{instance.id}/dont_know_pest_photo/{generate_unique_filename(filename)}'

def dont_know_beneficial_insects_photo_path(instance, filename):
    return f'weekly_records/user_{instance.farmer.id}/record_{instance.id}/dont_know_beneficial_insects_photo/{generate_unique_filename(filename)}'

def overall_image_path(instance, filename):
    return f'weekly_records/user_{instance.farmer.id}/record_{instance.id}/overall/{generate_unique_filename(filename)}'

def weekly_record_voice_note_path(instance, filename):
    return f'weekly_records/user_{instance.farmer.id}/record_{instance.id}/voice_notes/{generate_unique_filename(filename)}'

class WeeklyRecord(models.Model):
    YES_NO_CHOICES = (
        ('Yes', 'Yes'),
        ('No', 'No'),
    )

    PEST_CHOICES = (
        ('Mango fruit fly', 'Mango fruit fly'),
        ('Mediterranean fruit fly', 'Mediterranean fruit fly'),
        ('Natal fruit fly', 'Natal fruit fly'),
        ('False codling moth', 'False codling moth'),
        ('Thrips', 'Thrips'),
        ('Caterpillars', 'Caterpillars'),
        ('Persea mites', 'Persea mites'),
        ('Fig wax scale', 'Fig wax scale'),
        ('Red wax scale', 'Red wax scale'),
        ('Melon fly', 'Melon fly'),
        ('Whitefly', 'Whitefly'),
        ('Oriental fruit fly', 'Oriental fruit fly'),
        ('Broad mite', 'Broad mite'),
        ('Shot-hole borer', 'Shot-hole borer'),
    )

    BENEFICIAL_INSECT_CHOICES = (
        ('Bees', 'Bees'),
        ('Ladybirds', 'Ladybirds'),
        ('Lacewings', 'Lacewings'),
        ('Predatory mites', 'Predatory mites'),
    )

    PLANT_PART_CHOICES = (
        ('Leaves', 'Leaves'),
        ('Flowers', 'Flowers'),
        ('Fruits', 'Fruits'),
        ('Branches', 'Branches'),
        ('Roots', 'Roots'),
        ('Other', 'Other'),
    )

    CROP_STAGE_CHOICES = (
        ('Flowering', 'Flowering'),
        ('Pin head', 'Pin head'),
        ('Golf size', 'Golf size'),
        ('Maturing', 'Maturing'),
        ('Mature', 'Mature'),
    )

    DETECTION_METHOD_CHOICES = (
        ('Self-observation', 'Self-observation'),
        ('Extension officer', 'Extension officer'),
        ('Agronomist', 'Agronomist'),
        ('KEPHIS inspector', 'KEPHIS inspector'),
    )

    DISEASE_CHOICES = (
        ('Anthracnose', 'Anthracnose'),
        ('Black spot', 'Black spot'),
        ('Phytophthora root rot', 'Phytophthora root rot'),
        ('Armillaria root rot', 'Armillaria root rot'),
        ('Sunblotch viroid', 'Sunblotch viroid'),
        ('Cercospora spot', 'Cercospora spot'),
        ('Stem end rot', 'Stem end rot'),
        ('Avocado scab', 'Avocado scab'),
        ('Bacterial canker', 'Bacterial canker'),
        ('Fruit rot', 'Fruit rot'),
        ('Weeds', 'Weeds'),
        ('Nutrient deficiency', 'Nutrient deficiency'),
        ('Frost damage', 'Frost damage'),
    )

    ACTION_TAKEN_CHOICES = (
        ('Farm sanitation', 'Farm sanitation'),
        ('Pruning', 'Pruning'),
        ('Traps installed', 'Traps installed'),
        ('Traps serviced', 'Traps serviced'),
        ('Chemical control', 'Chemical control'),
        ('Biological control', 'Biological control'),
        ('No action taken', 'No action taken'),
    )

    OUTCOME_CHOICES = (
        ('Controlled', 'Controlled'),
        ('Reduced', 'Reduced'),
        ('Still present', 'Still present'),
        ('Follow-up needed', 'Follow-up needed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='weekly_records')
    block = models.ForeignKey(FarmBlock, on_delete=models.CASCADE, related_name='weekly_records')
    variety = models.CharField(max_length=500)
    trap_use = models.JSONField(null=True, blank=True)
    any_pests_observed = models.CharField(max_length=3, choices=YES_NO_CHOICES)
    pests_observed = models.JSONField(null=True, blank=True)
    beneficial_insects_observed = models.JSONField(null=True, blank=True)
    other_production_challenges = models.JSONField(null=True, blank=True)
    
    # "I don't know" fields
    dont_know_variety = models.BooleanField(default=False)
    dont_know_variety_photo = models.ImageField(upload_to=dont_know_variety_photo_path, null=True, blank=True, max_length=500)
    dont_know_variety_voice = models.FileField(upload_to=dont_know_variety_voice_path, null=True, blank=True, max_length=500)
    dont_know_variety_note = models.TextField(null=True, blank=True)
    
    dont_know_trap = models.BooleanField(default=False)
    dont_know_trap_photo = models.ImageField(upload_to=dont_know_trap_photo_path, null=True, blank=True, max_length=500)
    other_trap_photo = models.ImageField(upload_to=other_trap_photo_path, null=True, blank=True, max_length=500)
    
    dont_know_pest = models.BooleanField(default=False)
    dont_know_pest_photo = models.ImageField(upload_to=dont_know_pest_photo_path, null=True, blank=True, max_length=500)
    dont_know_pest_note = models.TextField(null=True, blank=True)

    dont_know_beneficial_insects_observed = models.BooleanField(default=False)
    dont_know_beneficial_insects_observed_photo = models.ImageField(upload_to=dont_know_beneficial_insects_photo_path, null=True, blank=True, max_length=500)
    dont_know_beneficial_insects_observed_note = models.TextField(null=True, blank=True)

    dont_know_disease = models.BooleanField(default=False)
    dont_know_disease_note = models.TextField(null=True, blank=True)
    
    overall_image = models.ImageField(upload_to=overall_image_path, null=True, blank=True, max_length=500)

    any_diseases_observed = models.CharField(max_length=3, choices=YES_NO_CHOICES)
    disease = models.JSONField(null=True, blank=True)
    disease_plant_part = models.JSONField(null=True, blank=True)
    disease_crop_stage = models.CharField(max_length=500, choices=CROP_STAGE_CHOICES, null=True, blank=True)
    disease_detection_method = models.CharField(max_length=500, choices=DETECTION_METHOD_CHOICES, null=True, blank=True)
    voice_note = models.FileField(upload_to=weekly_record_voice_note_path, null=True, blank=True, max_length=500)
    additional_notes = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default="New")
    reviewed = models.BooleanField(default=False)
    review_notes = models.TextField(null=True, blank=True)
    actions_taken = models.JSONField(null=True, blank=True)
    outcome = models.CharField(max_length=500)
    remarks = models.TextField(null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    location = models.CharField(max_length=255)
    gps_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    gps_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    raw_payload = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Weekly Record - {self.block.block_name} - {self.timestamp.date()}"

    def get_formatted_pests(self):
        if not self.pests_observed:
            return ""
        if isinstance(self.pests_observed, list):
            names = []
            for p in self.pests_observed:
                if isinstance(p, dict) and 'name' in p:
                    names.append(p['name'])
                elif isinstance(p, str):
                    names.append(p)
                else:
                    names.append(str(p))
            return ", ".join(names)
        return str(self.pests_observed)

    def get_formatted_diseases(self):
        if not self.disease:
            return ""
        if isinstance(self.disease, list):
            return ", ".join([str(d) for d in self.disease])
        return str(self.disease)

    def get_formatted_beneficial_insects(self):
        if not self.beneficial_insects_observed:
            return ""
        if isinstance(self.beneficial_insects_observed, list):
            return ", ".join([str(i) for i in self.beneficial_insects_observed])
        return str(self.beneficial_insects_observed)

    def get_formatted_production_challenges(self):
        if not self.other_production_challenges:
            return ""
        if isinstance(self.other_production_challenges, list):
            return ", ".join([str(c) for c in self.other_production_challenges])
        return str(self.other_production_challenges)

    def get_formatted_actions_taken(self):
        if not self.actions_taken:
            return ""
        if isinstance(self.actions_taken, list):
            return ", ".join([str(a) for a in self.actions_taken])
        return str(self.actions_taken)

    def get_formatted_disease_plant_parts(self):
        if not self.disease_plant_part:
            return ""
        if isinstance(self.disease_plant_part, list):
            return ", ".join([str(p) for p in self.disease_plant_part])
        return str(self.disease_plant_part)

    class Meta:
        ordering = ['-timestamp']

def trap_photo_path(instance, filename):
    return f'traps/{instance.id}/{generate_unique_filename(filename)}'

class Trap(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trap_name = models.CharField(max_length=255)
    number_of_traps = models.PositiveIntegerField()
    photo = models.ImageField(upload_to=trap_photo_path, null=True, blank=True, max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return self.trap_name

def problem_report_photo_path(instance, filename):
    return f'problem_reports/{instance.id}/{generate_unique_filename(filename)}'

class ProblemReport(models.Model):
    PROBLEM_CHOICES = (
        ('Pest', 'Pest'),
        ('Disease', 'Disease'),
        ('Water Issue', 'Water Issue'),
        ('Weather', 'Weather'),
        ('Animal/Bird', 'Animal/Bird'),
        ('Other', 'Other'),
    )

    URGENCY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('Urgent!', 'Urgent!'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='problem_reports', null=True, blank=True)
    problem_type = models.CharField(max_length=50, choices=PROBLEM_CHOICES)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES)
    photo = models.ImageField(upload_to=problem_report_photo_path, null=True, blank=True, max_length=500)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.problem_type} - {self.urgency} - {self.timestamp.date()}"


class TrapLog(models.Model):
    """Trap check-in metadata from the mobile app."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='trap_logs')
    farm = models.ForeignKey(Farm, null=True, blank=True, on_delete=models.SET_NULL, related_name='trap_logs')
    trap_name = models.CharField(max_length=255)
    number_of_traps = models.PositiveIntegerField(default=0)
    photo = models.URLField(max_length=2048, blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.trap_name} x{self.number_of_traps}'


class ScoutingReview(models.Model):
    REVIEW_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('needs_follow_up', 'Needs Follow Up'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    record = models.OneToOneField(WeeklyRecord, on_delete=models.CASCADE, related_name='triage_review')
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='scouting_reviews',
    )
    identified_label = models.CharField(max_length=255)
    management_protocol = models.TextField(blank=True, null=True)
    review_status = models.CharField(max_length=20, choices=REVIEW_STATUS_CHOICES, default='confirmed')
    training_tagged = models.BooleanField(default=True)
    review_notes = models.TextField(blank=True, null=True)
    pushed_to_farmer = models.BooleanField(default=False)
    reviewed_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-reviewed_at']


@receiver(post_save, sender=FarmBlock)
@receiver(post_delete, sender=FarmBlock)
def update_farm_stats(sender, instance, **kwargs):
    try:
        if instance.farm_name:
            farm = instance.farm_name
            farm.number_of_blocks = farm.blocks.count()
            farm.farm_size = farm.blocks.aggregate(Sum('number_of_trees'))['number_of_trees__sum'] or 0
            farm.save()
    except Farm.DoesNotExist:
        # Farm already deleted during cascade deletion
        pass
