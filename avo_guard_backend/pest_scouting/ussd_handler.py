from .models import ProblemReport
from accounts.models import User
from django.db import transaction

PEST_MAP = {
    "1": "Nzi wa matunda",
    "2": "Kipepeo bandia (FCM)",
    "3": "Utitiri wa Persea",
    "4": "Wadudu gamba",
    "5": "Wadudu magome",
    "6": "Vithiripi wa parachichi",
    "7": "Wadudu wengine"
}

DISEASE_MAP = {
    "1": "Madoa meusi (Black spot)",
    "2": "Madoa meusi kwenye matunda (Anthracnose)",
    "3": "Kuoza kwa mizizi (Root rot)",
    "4": "Madoa kahawia kwenye majani (Sunburn spot)",
    "5": "Kidonda cha gome (Bacterial canker)",
    "6": "Kuoza kwa matunda tawini (Stem end rot)",
    "7": "Ugonjwa mwingine"
}

SEVERITY_MAP = {
    "1": "Low",
    "2": "Medium",
    "3": "Urgent!",
    "4": "Urgent!"
}

SEVERITY_TEXT_MAP = {
    "1": "Kidogo (1-10% ya miti)",
    "2": "Kati (11-30% ya miti)",
    "3": "Kubwa (31-50% ya miti)",
    "4": "Kali (Zaidi ya 50%)"
}

def handle_ussd(phone_number, text):
    parts = []
    for part in text.split('*'):
        if not part:
            continue
        if part == '0':
            if parts:
                parts.pop()
        elif part == '00':
            parts = []
        else:
            parts.append(part)

    if not parts:
        return show_main_menu()

    level1 = parts[0]
    if level1 == '1':  # Pest
        if len(parts) == 1:
            return show_pest_menu()

        pest_choice = parts[1]
        if pest_choice not in PEST_MAP:
            return "CON Choice invalid. Select 1-7 or 0 for Back:\n" + show_pest_menu().split('\n', 1)[1]

        if len(parts) == 2:
            return show_severity_menu(PEST_MAP[pest_choice])

        severity_choice = parts[2]
        if severity_choice not in SEVERITY_MAP:
            return "CON Severity invalid. Select 1-4 or 0 for Back:\n" + show_severity_menu(PEST_MAP[pest_choice]).split('\n', 1)[1]

        if len(parts) == 3:
            # We reached the end. Save the report and show thank you.
            is_other = (pest_choice == "7")
            save_report(phone_number, "Pest", PEST_MAP[pest_choice], severity_choice, is_other)
            return show_thank_you_screen("Wadudu", PEST_MAP[pest_choice], SEVERITY_TEXT_MAP[severity_choice], severity_choice, is_other)

    elif level1 == '2':  # Disease
        if len(parts) == 1:
            return show_disease_menu()

        disease_choice = parts[1]
        if disease_choice not in DISEASE_MAP:
            return "CON Choice invalid. Select 1-7 or 0 for Back:\n" + show_disease_menu().split('\n', 1)[1]

        if len(parts) == 2:
            return show_severity_menu(DISEASE_MAP[disease_choice])

        severity_choice = parts[2]
        if severity_choice not in SEVERITY_MAP:
            return "CON Severity invalid. Select 1-4 or 0 for Back:\n" + show_severity_menu(DISEASE_MAP[disease_choice]).split('\n', 1)[1]

        if len(parts) == 3:
            is_other = (disease_choice == "7")
            save_report(phone_number, "Disease", DISEASE_MAP[disease_choice], severity_choice, is_other)
            return show_thank_you_screen("Ugonjwa", DISEASE_MAP[disease_choice], SEVERITY_TEXT_MAP[severity_choice], severity_choice, is_other)

    elif level1 == '3':  # No problem
        return "END Habari njema! Hakuna wadudu au ugonjwa ulioripotiwa.\nEndelea kufanya uchunguzi kila wiki.\n\n✓ Asante, kwa kuripoti."

    elif level1 == '0':  # Exit
        return "END ✓ Asante, kwa kuripoti.\nUtapewa ushauri kwa SMS ndani ya saa 24."

    return show_main_menu()

def show_main_menu():
    return ("CON Ripoti Tatizo la Dharura\n"
            "1. Wadudu\n"
            "2. Ugonjwa\n"
            "3. Hakuna tatizo\n"
            "0. Ondoka\n"
            "-----------------\n"
            "Chagua nambari:")

def show_pest_menu():
    return ("CON Chagua wadudu uliyeona:\n"
            "1. Nzi wa matunda\n"
            "2. Kipepeo bandia (FCM)\n"
            "3. Utitiri wa Persea\n"
            "4. Wadudu gamba\n"
            "5. Wadudu magome\n"
            "6. Vithiripi wa parachichi\n"
            "7. Wadudu wengine\n"
            "0. Rudi")

def show_disease_menu():
    return ("CON Chagua ugonjwa uliyeona:\n"
            "1. Madoa meusi (Black spot)\n"
            "2. Madoa meusi kwenye matunda (Anthracnose)\n"
            "3. Kuoza kwa mizizi (Root rot)\n"
            "4. Madoa kahawia kwenye majani (Sunburn spot)\n"
            "5. Kidonda cha gome (Bacterial canker)\n"
            "6. Kuoza kwa matunda tawini (Stem end rot)\n"
            "7. Ugonjwa mwingine\n"
            "0. Rudi")

def show_severity_menu(name):
    return (f"CON Umebainisha: {name}\n"
            "Ukali wa tatizo?\n"
            "1. Kidogo (1-10% ya miti)\n"
            "2. Kati (11-30% ya miti)\n"
            "3. Kubwa (31-50% ya miti)\n"
            "4. Kali (Zaidi ya 50%)\n"
            "0. Rudi")

def show_thank_you_screen(category_text, name, severity_text, severity_choice, is_other=False):
    issue_name = name
    if is_other:
        issue_name += " (Inachunguzwa)"
    
    issue_string = f"{category_text}: {issue_name}"
    if int(severity_choice) >= 3:
        prefix = "⚠️ ALERT: Agronomist atatumwa kwa shamba lako karibuni.\n"
        issue_string = prefix + issue_string

    return (f"CON ✓ Taarifa yako imetumwa kwa agronomist.\n"
            f"{issue_string}\n"
            f"Ukali: {severity_text}\n"
            f"Utapewa ushauri kwa SMS ndani ya saa 24.\n\n"
            f"00. Ripoti tatizo lingine\n"
            f"01. Ondoka")

def save_report(phone_number, problem_type, issue_name, severity_choice, is_other=False):
    try:
        user = User.objects.filter(phone_number=phone_number).first()
        
        urgency = SEVERITY_MAP.get(severity_choice, "Medium")
        full_issue_name = issue_name
        if is_other:
            full_issue_name += " (Inachunguzwa)"

        description = f"Reported via USSD by {phone_number}: {full_issue_name}"
        if int(severity_choice) >= 3:
            description = "⚠️ HIGH SEVERITY ALERT! " + description

        ProblemReport.objects.create(
            farmer=user,
            problem_type=problem_type,
            urgency=urgency,
            description=description
        )
    except Exception as e:
        # If farmer field is missing, try without it
        try:
             ProblemReport.objects.create(
                problem_type=problem_type,
                urgency=urgency,
                description=description + f" (User ID lookup failed or field missing. Phone: {phone_number})"
            )
        except Exception as e2:
            print(f"Error saving USSD report: {e2}")
