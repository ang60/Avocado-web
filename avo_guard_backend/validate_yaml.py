import yaml
import sys

try:
    with open('schema.yml', 'r', encoding='utf-8') as f:
        yaml.safe_load(f)
    print("YAML is valid UTF-8.")
except Exception as e:
    print(f"YAML is invalid: {e}")
    sys.exit(1)
