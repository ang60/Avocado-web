import uuid
from django.db import models
from django.conf import settings


class FarmBlock(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='farm_blocks')
    block_name = models.CharField(max_length=255)
    number_of_trees = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.block_name} - {self.farmer.phone_number}"


class WeeklyRecord(models.Model):
    YES_NO_CHOICES = (
        ('Yes', 'Yes'),
        ('No', 'No'),
    )

    PEST_CHOICES = (
        ('🦟 Mango fruit fly', '🦟 Mango fruit fly'),
        (' Mediterranean fruit fly', '🦟 Mediterranean fruit fly'),
        ('🦟 Natal fruit fly', '🦟 Natal fruit fly'),
        ('🐛 False codling moth', '🐛 False codling moth'),
        ('🦗 Thrips', '🦗 Thrips'),
        ('🐛 Caterpillars', '🐛 Caterpillars'),
        ('🕷 Persea mites', '🕷 Persea mites'),
        ('🪲 Fig wax scale', '🪲 Fig wax scale'),
        ('🪲 Red wax scale', '🪲 Red wax scale'),
        ('🦟 Melon fly', '🦟 Melon fly'),
        ('🐛 Whitefly', '🐛 Whitefly'),
        ('🦟 Oriental fruit fly', '🦟 Oriental fruit fly'),
        ('🐛 Broad mite', '🐛 Broad mite'),
        ('🪲 Shot-hole borer', '🪲 Shot-hole borer'),
    )

    BENEFICIAL_INSECT_CHOICES = (
        ('🐝 Bees', '🐝 Bees'),
        ('🐞 Ladybirds', '🐞 Ladybirds'),
        ('🪰 Lacewings', '🪰 Lacewings'),
        ('🕷️ Predatory mites', '🕷️ Predatory mites'),
    )

    PLANT_PART_CHOICES = (
        ('🍃 Leaves', '🍃 Leaves'),
        ('🌸 Flowers', '🌸 Flowers'),
        ('🥑Fruits', '🥑Fruits'),
        ('🌿 Branches', '🌿 Branches'),
        ('🌱 Roots', '🌱 Roots'),
        ('❓ Other', '❓ Other'),
    )

    CROP_STAGE_CHOICES = (
        ('🌸 Flowering', '🌸 Flowering'),
        ('🟢 Pin head', '🟢 Pin head'),
        ('⛳ Golf size', '⛳ Golf size'),
        ('🟡 Maturing', '🟡 Maturing'),
        ('🥑 Mature', '🥑 Mature'),
    )

    DETECTION_METHOD_CHOICES = (
        ('👁 Self-observation', '👁 Self-observation'),
        ('👷 Extension officer', '👷 Extension officer'),
        ('🏢 Agronomist', '🏢 Agronomist'),
        ('🔬 KEPHIS inspector', '🔬 KEPHIS inspector'),
    )

    DISEASE_CHOICES = (
        ('🟤 Anthracnose', '🟤 Anthracnose'),
        ('⚫ Black spot', '⚫ Black spot'),
        ('🌊 Phytophthora root rot', '🌊 Phytophthora root rot'),
        ('🍄 Armillaria root rot', '🍄 Armillaria root rot'),
        ('🦠 Sunblotch viroid', '🦠 Sunblotch viroid'),
        ('🟡 Cercospora spot', '🟡 Cercospora spot'),
        ('🔴 Stem end rot', '🔴 Stem end rot'),
        ('🟫 Avocado scab', '🟫 Avocado scab'),
        ('🦠 Bacterial canker', '🦠 Bacterial canker'),
        ('🍂 Fruit rot', '🍂 Fruit rot'),
        ('🌿 Weeds', '🌿 Weeds'),
        ('⚡ Nutrient deficiency', '⚡ Nutrient deficiency'),
        ('❄️ Frost damage', '❄️ Frost damage'),
    )

    ACTION_TAKEN_CHOICES = (
        ('🌿 Farm sanitation', '🌿 Farm sanitation'),
        ('✂️ Pruning', '✂️ Pruning'),
        ('🪤 Traps installed', '🪤 Traps installed'),
        ('🔧 Traps serviced', '🔧 Traps serviced'),
        ('💊 Chemical control', '💊 Chemical control'),
        ('🐞 Biological control', '🐞 Biological control'),
        ('❌ No action taken', '❌ No action taken'),
    )

    OUTCOME_CHOICES = (
        ('✅ Controlled', '✅ Controlled'),
        ('📉 Reduced', '📉 Reduced'),
        ('⚠️ Still present', '⚠️ Still present'),
        ('🔄 Follow-up needed', '🔄 Follow-up needed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='weekly_records')
    block = models.ForeignKey(FarmBlock, on_delete=models.CASCADE, related_name='weekly_records')
    variety = models.CharField(max_length=100)
    type_of_trap = models.CharField(max_length=100)
    number_of_trap = models.PositiveIntegerField()
    traps_replaced = models.PositiveIntegerField()
    any_pests_observed = models.CharField(max_length=3, choices=YES_NO_CHOICES)
    pests_observed = models.CharField(max_length=255, choices=PEST_CHOICES, null=True, blank=True)
    beneficial_insects_observed = models.CharField(max_length=255, choices=BENEFICIAL_INSECT_CHOICES, null=True, blank=True)
    number_of_trees_affected = models.PositiveIntegerField()
    pest_plant_part_affected = models.CharField(max_length=100, choices=PLANT_PART_CHOICES, null=True, blank=True)
    pest_crop_stage = models.CharField(max_length=100, choices=CROP_STAGE_CHOICES, null=True, blank=True)
    pest_detection_method = models.CharField(max_length=100, choices=DETECTION_METHOD_CHOICES, null=True, blank=True)
    pests_per_trap = models.DecimalField(max_digits=10, decimal_places=2)
    any_diseases_observed = models.CharField(max_length=3, choices=YES_NO_CHOICES)
    disease = models.CharField(max_length=255, choices=DISEASE_CHOICES, null=True, blank=True)
    disease_plant_part = models.CharField(max_length=100, choices=PLANT_PART_CHOICES, null=True, blank=True)
    disease_crop_stage = models.CharField(max_length=100, choices=CROP_STAGE_CHOICES, null=True, blank=True)
    disease_detection_method = models.CharField(max_length=100, choices=DETECTION_METHOD_CHOICES, null=True, blank=True)
    number_of_photos_taken = models.PositiveIntegerField(default=0)
    voice_note = models.FileField(upload_to='voice_notes/', null=True, blank=True)
    additional_notes = models.TextField(null=True, blank=True)
    actions_taken = models.CharField(max_length=100, choices=ACTION_TAKEN_CHOICES)
    outcome = models.CharField(max_length=100, choices=OUTCOME_CHOICES)
    remarks = models.TextField(null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    location = models.CharField(max_length=255)
    gps_latitude = models.DecimalField(max_digits=18, decimal_places=15, null=True, blank=True)
    gps_longitude = models.DecimalField(max_digits=18, decimal_places=15, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Weekly Record - {self.block.block_name} - {self.timestamp.date()}"

    class Meta:
        ordering = ['-timestamp']

