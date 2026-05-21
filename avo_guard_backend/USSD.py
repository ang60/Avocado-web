from flask import Flask, request

app = Flask(__name__)

# Session state variables
current_step = "main"  # main, pest_type, disease_type, severity, thank_you
selected_category = None  # 'pest' or 'disease'
is_unclassified = False
temp_pest_name = ""
temp_disease_name = ""
last_issue = ""
last_severity_text = ""


@app.route('/ussd', methods=['POST'])
def ussd():
    global current_step, selected_category, is_unclassified
    global temp_pest_name, temp_disease_name, last_issue, last_severity_text

    # Get the user's input from Africa's Talking
    text = request.form.get('text', '')
    phone_number = request.form.get('phoneNumber', '')
    session_id = request.form.get('sessionId', '')

    # Split the user input (e.g., "1*2" becomes ["1", "2"])
    user_input = text.split('*') if text else []
    current_choice = user_input[-1] if user_input else ""

    # ==================== MAIN MENU ====================
    if current_step == "main":
        if text == "":
            # First request - show main menu
            response = "CON Ripoti Tatizo la Dharura\n"
            response += "1. Wadudu\n"
            response += "2. Ugonjwa\n"
            response += "3. Hakuna tatizo\n"
            response += "0. Ondoka\n"
            response += "-----------------\n"
            response += "Chagua nambari:"
            return response

        elif current_choice == "1":
            # User selected Pest
            current_step = "pest_type"
            selected_category = "pest"
            response = "CON Chagua wadudu uliyeona:\n"
            response += "1. Nzi wa matunda\n"
            response += "2. Kipepeo bandia (FCM)\n"
            response += "3. Utitiri wa Persea\n"
            response += "4. Wadudu gamba\n"
            response += "5. Wadudu magome\n"
            response += "6. Vithiripi wa parachichi\n"
            response += "7. Wadudu wengine\n"
            response += "0. Rudi"
            return response

        elif current_choice == "2":
            # User selected Disease
            current_step = "disease_type"
            selected_category = "disease"
            response = "CON Chagua ugonjwa uliyeona:\n"
            response += "1. Madoa meusi (Black spot)\n"
            response += "2. Madoa meusi kwenye matunda (Anthracnose)\n"
            response += "3. Kuoza kwa mizizi (Root rot)\n"
            response += "4. Madoa kahawia kwenye majani (Sunburn spot)\n"
            response += "5. Kidonda cha gome (Bacterial canker)\n"
            response += "6. Kuoza kwa matunda tawini (Stem end rot)\n"
            response += "7. Ugonjwa mwingine\n"
            response += "0. Rudi"
            return response

        elif current_choice == "3":
            # Clean report - no pest/disease
            response = "END Habari njema! Hakuna wadudu au ugonjwa ulioripotiwa.\n"
            response += "Endelea kufanya uchunguzi kila wiki.\n\n"
            response += "✓ Asante, kwa kuripoti."
            return response

        elif current_choice == "0":
            # Exit
            response = "END ✓ Asante, kwa kuripoti.\n"
            response += "Utapewa ushauri kwa SMS ndani ya saa 24."
            return response

        else:
            # Invalid input
            response = "CON Chaguo si sahihi. Tafadhali chagua 1,2,3 au 0.\n"
            response += "-----------------\n"
            response += "Ripoti Tatizo la Dharura\n"
            response += "1. Wadudu\n"
            response += "2. Ugonjwa\n"
            response += "3. Hakuna tatizo\n"
            response += "0. Ondoka"
            return response

    # ==================== PEST TYPES ====================
    elif current_step == "pest_type":
        if current_choice == "0":
            # Back to main menu
            current_step = "main"
            response = "CON Ripoti Tatizo la Dharura\n"
            response += "1. Wadudu\n"
            response += "2. Ugonjwa\n"
            response += "3. Hakuna tatizo\n"
            response += "0. Ondoka\n"
            response += "-----------------\n"
            response += "Chagua nambari:"
            return response

        # Map pest selection
        pest_map = {
            "1": ("Nzi wa matunda", 101),
            "2": ("Kipepeo bandia (FCM)", 102),
            "3": ("Utitiri wa Persea", 103),
            "4": ("Wadudu gamba", 104),
            "5": ("Wadudu magome", 104),
            "6": ("Vithiripi wa parachichi", 106),
            "7": ("Wadudu wengine", 999)
        }

        if current_choice in pest_map:
            temp_pest_name, pest_id = pest_map[current_choice]
            if pest_id == 999:
                is_unclassified = True
            current_step = "severity"
            response = f"CON Umebainisha: {temp_pest_name}\n"
            response += "Ukali wa tatizo?\n"
            response += "1. Kidogo (1-10% ya miti)\n"
            response += "2. Kati (11-30% ya miti)\n"
            response += "3. Kubwa (31-50% ya miti)\n"
            response += "4. Kali (Zaidi ya 50%)\n"
            response += "0. Rudi"
            return response
        else:
            # Invalid input
            response = "CON Chagua wadudu kwa namba (1-7 au 0 kurejea):\n"
            response += "1. Nzi wa matunda\n"
            response += "2. Kipepeo bandia\n"
            response += "3. Utitiri wa Persea\n"
            response += "4. Wadudu gamba\n"
            response += "5. Wadudu magome\n"
            response += "6. Vithiripi\n"
            response += "7. Wadudu wengine\n"
            response += "0. Rudi"
            return response

    # ==================== DISEASE TYPES ====================
    elif current_step == "disease_type":
        if current_choice == "0":
            # Back to main menu
            current_step = "main"
            response = "CON Ripoti Tatizo la Dharura\n"
            response += "1. Wadudu\n"
            response += "2. Ugonjwa\n"
            response += "3. Hakuna tatizo\n"
            response += "0. Ondoka\n"
            response += "-----------------\n"
            response += "Chagua nambari:"
            return response

        # Map disease selection
        disease_map = {
            "1": ("Madoa meusi (Black spot)", 201),
            "2": ("Madoa meusi kwenye matunda (Anthracnose)", 202),
            "3": ("Kuoza kwa mizizi (Root rot)", 203),
            "4": ("Madoa kahawia kwenye majani (Sunburn spot)", 204),
            "5": ("Kidonda cha gome (Bacterial canker)", 205),
            "6": ("Kuoza kwa matunda tawini (Stem end rot)", 206),
            "7": ("Ugonjwa mwingine", 999)
        }

        if current_choice in disease_map:
            temp_disease_name, disease_id = disease_map[current_choice]
            if disease_id == 999:
                is_unclassified = True
            current_step = "severity"
            response = f"CON Umebainisha: {temp_disease_name}\n"
            response += "Ukali wa tatizo?\n"
            response += "1. Kidogo (1-10% ya miti)\n"
            response += "2. Kati (11-30% ya miti)\n"
            response += "3. Kubwa (31-50% ya miti)\n"
            response += "4. Kali (Zaidi ya 50%)\n"
            response += "0. Rudi"
            return response
        else:
            # Invalid input
            response = "CON Chagua ugonjwa kwa namba (1-7 au 0 kurejea):\n"
            response += "1. Madoa meusi\n"
            response += "2. Anthracnose\n"
            response += "3. Kuoza mizizi\n"
            response += "4. Madoa kahawia\n"
            response += "5. Kidonda gome\n"
            response += "6. Kuoza tawini\n"
            response += "7. Ugonjwa mwingine\n"
            response += "0. Rudi"
            return response

    # ==================== SEVERITY ====================
    elif current_step == "severity":
        if current_choice == "0":
            # Go back to previous category screen
            if selected_category == "pest":
                current_step = "pest_type"
                response = "CON Chagua wadudu uliyeona:\n"
                response += "1. Nzi wa matunda\n"
                response += "2. Kipepeo bandia\n"
                response += "3. Utitiri wa Persea\n"
                response += "4. Wadudu gamba\n"
                response += "5. Wadudu magome\n"
                response += "6. Vithiripi\n"
                response += "7. Wadudu wengine\n"
                response += "0. Rudi"
            else:
                current_step = "disease_type"
                response = "CON Chagua ugonjwa uliyeona:\n"
                response += "1. Madoa meusi\n"
                response += "2. Anthracnose\n"
                response += "3. Kuoza mizizi\n"
                response += "4. Madoa kahawia\n"
                response += "5. Kidonda gome\n"
                response += "6. Kuoza tawini\n"
                response += "7. Ugonjwa mwingine\n"
                response += "0. Rudi"
            return response

        # Map severity
        severity_map = {
            "1": "Kidogo (Low)",
            "2": "Kati (Medium)",
            "3": "Kubwa (High)",
            "4": "Kali (Severe)"
        }

        if current_choice in severity_map:
            severity_text = severity_map[current_choice]
            severity_level = int(current_choice)

            # Build issue string
            if selected_category == "pest":
                issue_name = temp_pest_name
                report_type = "Wadudu"
            else:
                issue_name = temp_disease_name
                report_type = "Ugonjwa"

            issue_string = f"{report_type}: {issue_name}"

            if is_unclassified:
                issue_string = f"{report_type}: {issue_name} (Inachunguzwa)"

            if severity_level >= 3 and not is_unclassified:
                issue_string = f"⚠️ ALERT: Agronomist atatumwa kwa shamba lako karibuni.\n{issue_string}"

            # Store for thank you screen
            last_issue = issue_string
            last_severity_text = severity_text

            # Move to thank you screen
            current_step = "thank_you"

            response = f"CON ✓ Taarifa yako imetumwa kwa agronomist.\n"
            response += f"{issue_string}\n"
            response += f"Ukali: {severity_text}\n"
            response += f"Utapewa ushauri kwa SMS ndani ya saa 24.\n\n"
            response += f"00. Ripoti tatizo lingine\n"
            response += f"01. Ondoka"
            return response
        else:
            response = "CON Ukali si sahihi. Chagua 1,2,3 au 4:\n"
            response += "1. Kidogo (1-10%)\n"
            response += "2. Kati (11-30%)\n"
            response += "3. Kubwa (31-50%)\n"
            response += "4. Kali (>50%)\n"
            response += "0. Rudi"
            return response

    # ==================== THANK YOU SCREEN ====================
    elif current_step == "thank_you":
        if current_choice == "00":
            # Ripoti tatizo lingine - go back to main menu
            current_step = "main"
            selected_category = None
            is_unclassified = False
            temp_pest_name = ""
            temp_disease_name = ""
            response = "CON Ripoti Tatizo la Dharura\n"
            response += "1. Wadudu\n"
            response += "2. Ugonjwa\n"
            response += "3. Hakuna tatizo\n"
            response += "0. Ondoka\n"
            response += "-----------------\n"
            response += "Chagua nambari:"
            return response

        elif current_choice == "01":
            # Exit
            current_step = "main"
            selected_category = None
            is_unclassified = False
            response = "END ✓ Asante, kwa kuripoti.\n"
            response += "Utapewa ushauri kwa SMS ndani ya saa 24."
            return response

        else:
            # Invalid - show thank you screen again
            response = f"CON ✓ Taarifa yako imetumwa kwa agronomist.\n"
            response += f"{last_issue}\n"
            response += f"Ukali: {last_severity_text}\n"
            response += f"Utapewa ushauri kwa SMS ndani ya saa 24.\n\n"
            response += f"00. Ripoti tatizo lingine\n"
            response += f"01. Ondoka"
            return response

    # Fallback - should never reach here
    current_step = "main"
    return "CON Ripoti Tatizo la Dharura\n1. Wadudu\n2. Ugonjwa\n3. Hakuna tatizo\n0. Ondoka"


if __name__ == '__main__':
    app.run(port=5001, debug=True)