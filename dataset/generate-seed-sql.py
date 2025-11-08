import pandas as pd
import json
import re
from datetime import datetime, timezone
from typing import Optional, Tuple

# Malaysian states mapping (common variations)
STATE_MAPPING = {
    'Kedah': 'Kedah',
    'Kelantan': 'Kelantan',
    'Kuala Lumpur': 'Kuala Lumpur',
    'Labuan': 'Labuan',
    'Labuan Federal Territory': 'Labuan',
    'Wilayah Persekutuan Labuan': 'Labuan',
    'Melaka': 'Melaka',
    'Malacca': 'Melaka',
    'Negeri Sembilan': 'Negeri Sembilan',
    'Pahang': 'Pahang',
    'Penang': 'Pulau Pinang',
    'Pulau Pinang': 'Pulau Pinang',
    'Perak': 'Perak',
    'Perlis': 'Perlis',
    'Putrajaya': 'Putrajaya',
    'Wilayah Persekutuan Putrajaya': 'Putrajaya',
    'Sabah': 'Sabah',
    'Sarawak': 'Sarawak',
    'Selangor': 'Selangor',
    'Terengganu': 'Terengganu',
    'Johor': 'Johor',
    'Johor Bahru': 'Johor',
}


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug format."""
    if pd.isna(text) or text == '':
        return 'unknown'
    
    # Convert to lowercase
    text = str(text).lower()
    
    # Remove special characters, keep alphanumeric and spaces
    text = re.sub(r'[^\w\s-]', '', text)
    
    # Replace spaces and multiple hyphens with single hyphen
    text = re.sub(r'[\s_-]+', '-', text)
    
    # Remove leading/trailing hyphens
    text = text.strip('-')
    
    # Limit length
    if len(text) > 120:
        text = text[:120].rstrip('-')
    
    return text or 'unknown'


def extract_state_and_district(address: str) -> Tuple[str, str]:
    """
    Extract state and district from address.
    State is usually at the end, district might be in the middle.
    """
    if pd.isna(address) or address == '':
        return 'Unknown', 'Unknown'
    
    address = str(address).strip()
    
    # Split by comma
    parts = [p.strip() for p in address.split(',')]
    
    # State is usually the last part
    state = 'Unknown'
    if parts:
        last_part = parts[-1]
        # Check if it matches known states
        for key, value in STATE_MAPPING.items():
            if key.lower() in last_part.lower():
                state = value
                break
    
    # District: try to find from address parts
    # Common patterns: "Taman X", "Bandar X", "Kampung X", or city name
    district = 'Unknown'
    if len(parts) >= 2:
        # Try second-to-last or third-to-last part
        for part in reversed(parts[:-1]):
            # Skip postal codes (numbers)
            if not re.match(r'^\d+$', part):
                # Check for common prefixes
                if any(part.startswith(prefix) for prefix in ['Taman', 'Bandar', 'Kampung', 'Kg.', 'Jalan']):
                    district = part
                    break
                elif len(part) > 3 and not part.isdigit():
                    district = part
                    break
    
    # If still unknown, use first meaningful part
    if district == 'Unknown' and parts:
        for part in parts:
            if not re.match(r'^\d+$', part) and len(part) > 3:
                district = part
                break
    
    return state, district


def escape_sql_string(value: str) -> str:
    """Escape single quotes in SQL strings."""
    if pd.isna(value):
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"


def format_jsonb(value: str) -> str:
    """Format JSON string for JSONB column."""
    if pd.isna(value) or value == '' or value == '[]' or value == 'null':
        return "'[]'::jsonb"
    
    try:
        # Parse and re-stringify to ensure valid JSON
        parsed = json.loads(value) if isinstance(value, str) else value
        json_str = json.dumps(parsed, ensure_ascii=False)
        # Escape single quotes for SQL
        json_str = json_str.replace("'", "''")
        return f"'{json_str}'::jsonb"
    except (json.JSONDecodeError, TypeError):
        return "'[]'::jsonb"


def format_boolean(value: any) -> str:
    """Format boolean value for SQL."""
    if pd.isna(value):
        return 'false'
    if isinstance(value, bool):
        return 'true' if value else 'false'
    if isinstance(value, str):
        return 'true' if value.lower() in ['true', '1', 'yes'] else 'false'
    return 'false'


def format_nullable_string(value: any) -> str:
    """Format nullable string for SQL."""
    if pd.isna(value) or value == '':
        return 'NULL'
    return escape_sql_string(str(value))


def format_timestamp() -> str:
    """Generate current timestamp for SQL."""
    return f"'{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S.%f')}+00'"


# Load processed CSV
print("Loading processed-markets.csv...")
df = pd.read_csv('dataset/processed-markets.csv')

print(f"Loaded {len(df)} rows")

# Generate SQL
print("\nGenerating SQL INSERT statements...")

sql_lines = []
sql_lines.append("-- SQL Seed Script for pasar_malams table")
sql_lines.append(f"-- Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
sql_lines.append(f"-- Total records: {len(df)}")
sql_lines.append("")
sql_lines.append("INSERT INTO \"public\".\"pasar_malams\" (")
sql_lines.append("    \"id\", \"name\", \"address\", \"district\", \"state\", \"status\",")
sql_lines.append("    \"description\", \"area_m2\", \"total_shop\",")
sql_lines.append("    \"parking_available\", \"parking_accessible\", \"parking_notes\",")
sql_lines.append("    \"amen_toilet\", \"amen_prayer_room\",")
sql_lines.append("    \"location\", \"schedule\",")
sql_lines.append("    \"created_at\", \"updated_at\", \"shop_list\"")
sql_lines.append(") VALUES")
sql_lines.append("")

values = []
for idx, row in df.iterrows():
    # Generate ID from name
    market_id = slugify(row['name'])
    
    # Extract state and district from address
    state, district = extract_state_and_district(row['address'])
    
    # Prepare values
    value_parts = [
        escape_sql_string(market_id),  # id
        escape_sql_string(row['name']),  # name
        escape_sql_string(row['address']),  # address
        escape_sql_string(district),  # district
        escape_sql_string(state),  # state
        "'Active'",  # status (default)
        format_nullable_string(None),  # description
        'NULL',  # area_m2
        'NULL',  # total_shop
        'false',  # parking_available
        'false',  # parking_accessible
        'NULL',  # parking_notes
        'false',  # amen_toilet
        'false',  # amen_prayer_room
        format_jsonb(row['location']),  # location
        format_jsonb(row['schedule']),  # schedule
        format_timestamp(),  # created_at
        format_timestamp(),  # updated_at
        'NULL',  # shop_list
    ]
    
    values.append("(" + ", ".join(value_parts) + ")")
    
    if (idx + 1) % 100 == 0:
        print(f"  Processed {idx + 1}/{len(df)} rows...")

# Join values with commas
sql_lines.append(",\n".join(values))
sql_lines.append(";")
sql_lines.append("")
sql_lines.append("-- End of seed script")

# Write to file
output_file = 'supabase/seed-2.sql'
print(f"\nWriting SQL to {output_file}...")

with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f"Generated {len(df)} INSERT statements")
print(f"Saved to {output_file}")
print("\nDone!")

