import pandas as pd
import numpy as np
import json
import re
import glob
import os
from typing import List, Dict, Any, Optional

# Day name mapping
DAY_MAPPING = {
    'Monday': 'mon',
    'Tuesday': 'tue',
    'Wednesday': 'wed',
    'Thursday': 'thu',
    'Friday': 'fri',
    'Saturday': 'sat',
    'Sunday': 'sun'
}

ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
ALL_DAYS_ABBR = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']


def parse_time_range(time_str: str) -> Optional[Dict[str, str]]:
    """
    Parse time string like "6 pm-12 am" or "4:30-8:30 pm" to {"start": "18:00", "end": "00:00"}
    Handles various formats including "Open 24 hours" and "Closed"
    """
    if pd.isna(time_str) or time_str == '':
        return None
    
    time_str = str(time_str).strip()
    
    # Handle special cases
    if 'Open 24 hours' in time_str or '24 hours' in time_str:
        return {"start": "00:00", "end": "23:59", "note": "Open 24 hours"}
    
    if 'Closed' in time_str:
        return None  # Skip closed days
    
    # Parse time range like "6 pm-12 am" or "4:30-8:30 pm"
    # Pattern: (hour)(:minute)? (am|pm)? - (hour)(:minute)? (am|pm)?
    pattern = r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?'
    match = re.search(pattern, time_str, re.IGNORECASE)
    
    if not match:
        return None
    
    start_hour = int(match.group(1))
    start_min = int(match.group(2)) if match.group(2) else 0
    start_ampm = (match.group(3) or '').lower()
    
    end_hour = int(match.group(4))
    end_min = int(match.group(5)) if match.group(5) else 0
    end_ampm = (match.group(6) or '').lower()
    
    # Convert to 24-hour format
    if start_ampm == 'pm' and start_hour != 12:
        start_hour += 12
    elif start_ampm == 'am' and start_hour == 12:
        start_hour = 0
    
    if end_ampm == 'pm' and end_hour != 12:
        end_hour += 12
    elif end_ampm == 'am' and end_hour == 12:
        end_hour = 0
    
    # Handle midnight (12 am = 00:00)
    if end_hour == 12 and end_ampm == 'am':
        end_hour = 0
    
    start_time = f"{start_hour:02d}:{start_min:02d}"
    end_time = f"{end_hour:02d}:{end_min:02d}"
    
    return {"start": start_time, "end": end_time}


def transform_hours_to_schedule(hours_str: str) -> List[Dict[str, Any]]:
    """
    Transform hours JSON array to schedule format matching codebase structure.
    Input: [{"day":"Monday","times":["6 pm-12 am"]}]
    Output: [{"days": ["mon"], "times": [{"start": "18:00", "end": "00:00"}]}]
    """
    if pd.isna(hours_str) or hours_str == '' or hours_str == '[]':
        return []
    
    try:
        hours_data = json.loads(hours_str) if isinstance(hours_str, str) else hours_str
    except (json.JSONDecodeError, TypeError):
        return []
    
    if not isinstance(hours_data, list):
        return []
    
    # Group days by their times
    schedule_map = {}
    
    for day_entry in hours_data:
        if not isinstance(day_entry, dict) or 'day' not in day_entry or 'times' not in day_entry:
            continue
        
        day_name = day_entry['day']
        times_list = day_entry['times']
        
        if not isinstance(times_list, list) or len(times_list) == 0:
            continue
        
        # Parse the first time entry (assuming single time range per day)
        time_str = times_list[0] if times_list else ''
        time_obj = parse_time_range(time_str)
        
        if time_obj is None:
            continue  # Skip closed days
        
        # Create a key for grouping (same times = same schedule entry)
        time_key = json.dumps(time_obj, sort_keys=True)
        
        if time_key not in schedule_map:
            schedule_map[time_key] = {
                'times': [time_obj],
                'days': []
            }
        
        # Convert day name to abbreviation
        day_abbr = DAY_MAPPING.get(day_name, day_name.lower()[:3])
        schedule_map[time_key]['days'].append(day_abbr)
    
    # Convert to final format and sort days
    schedule = []
    for time_key, data in schedule_map.items():
        # Sort days in order
        sorted_days = sorted(data['days'], key=lambda x: ALL_DAYS_ABBR.index(x) if x in ALL_DAYS_ABBR else 999)
        schedule.append({
            'days': sorted_days,
            'times': data['times']
        })
    
    # Sort schedule entries by first day
    schedule.sort(key=lambda x: ALL_DAYS_ABBR.index(x['days'][0]) if x['days'] and x['days'][0] in ALL_DAYS_ABBR else 999)
    
    return schedule


def transform_closed_on_to_opening_day(closed_on_str: str) -> List[str]:
    """
    Transform closed_on to opening_day (inverse logic).
    - "Open All Days" → all 7 days
    - JSON array like ["Monday","Tuesday"] → remaining days
    - empty/null → all 7 days
    """
    if pd.isna(closed_on_str) or closed_on_str == '':
        return ALL_DAYS_ABBR.copy()
    
    closed_on_str = str(closed_on_str).strip()
    
    if closed_on_str == 'Open All Days':
        return ALL_DAYS_ABBR.copy()
    
    # Try to parse as JSON array
    try:
        closed_days = json.loads(closed_on_str) if isinstance(closed_on_str, str) else closed_on_str
        if isinstance(closed_days, list):
            # Convert closed days to abbreviations
            closed_abbr = [DAY_MAPPING.get(day, day.lower()[:3]) for day in closed_days if day in DAY_MAPPING]
            # Return remaining days
            opening_days = [day for day in ALL_DAYS_ABBR if day not in closed_abbr]
            return opening_days if opening_days else ALL_DAYS_ABBR.copy()
    except (json.JSONDecodeError, TypeError):
        pass
    
    # If parsing fails, assume all days are open
    return ALL_DAYS_ABBR.copy()


def parse_coordinates(coord_str: str) -> Optional[Dict[str, float]]:
    """
    Parse coordinates JSON string to dict format.
    Input: '{"latitude":5.2781252,"longitude":115.24570569999999}'
    Output: {"latitude": 5.2781252, "longitude": 115.24570569999999}
    """
    if pd.isna(coord_str) or coord_str == '':
        return None
    
    try:
        coords = json.loads(coord_str) if isinstance(coord_str, str) else coord_str
        if isinstance(coords, dict) and 'latitude' in coords and 'longitude' in coords:
            return {
                "latitude": float(coords['latitude']),
                "longitude": float(coords['longitude'])
            }
    except (json.JSONDecodeError, TypeError, ValueError, KeyError):
        pass
    
    return None


def create_location_jsonb(latitude: float, longitude: float, gmaps_link: str) -> str:
    """
    Create location JSONB combining latitude, longitude, and gmaps_link.
    """
    location = {
        "latitude": float(latitude) if not pd.isna(latitude) else None,
        "longitude": float(longitude) if not pd.isna(longitude) else None,
        "gmaps_link": str(gmaps_link) if not pd.isna(gmaps_link) else ""
    }
    return json.dumps(location)


# Load all CSV files matching the pattern
# Try both relative paths (if run from root) and current directory (if run from dataset/)
csv_files = glob.glob('dataset/pasar-malam-in-*.csv') + glob.glob('pasar-malam-in-*.csv')
csv_files = list(set(csv_files))  # Remove duplicates
print(f"Found {len(csv_files)} CSV files to process")

# Load all dataframes
dataframes = []
for csv_file in csv_files:
    try:
        df = pd.read_csv(csv_file)
        dataframes.append(df)
        print(f"Loaded {csv_file}: {len(df)} rows")
    except Exception as e:
        print(f"Error loading {csv_file}: {e}")

if not dataframes:
    print("No dataframes loaded. Exiting.")
    exit(1)

# Merge all dataframes
df = pd.concat(dataframes, ignore_index=True)
print(f"\nTotal rows after merge: {len(df)}")

# Columns to remove
columns_to_remove = [
    'place_id', 'description', 'is_spending_on_ads', 'reviews', 'rating', 'competitors',
    'website', 'phone', 'can_claim', 'owner', 'owner_posts', 'featured_image',
    'main_category', 'categories', 'status', 'is_temporarily_closed', 'is_permanently_closed',
    'price_range', 'reviews_per_rating', 'reviews_link', 'plus_code', 'detailed_address',
    'time_zone', 'cid', 'data_id', 'kgmid', 'about', 'most_popular_times', 'popular_times',
    'menu', 'reservations', 'order_online_links', 'image_count', 'images', 'featured_images',
    'on_site_places', 'customer_updates', 'featured_question', 'review_keywords',
    'featured_reviews', 'detailed_reviews', 'query'
]

# Filter rows before removing columns (we need is_temporarily_closed and is_permanently_closed for filtering)
print("\nFiltering rows...")
initial_count = len(df)

# Filter out rows where is_temporarily_closed or is_permanently_closed have truthy values
if 'is_temporarily_closed' in df.columns:
    # Remove rows where value is truthy (non-empty, non-null, not "false", not "0")
    mask_temp = df['is_temporarily_closed'].apply(
        lambda x: pd.isna(x) or str(x).strip().lower() in ['', 'false', '0', 'nan', 'none']
    )
    df = df[mask_temp]

if 'is_permanently_closed' in df.columns:
    mask_perm = df['is_permanently_closed'].apply(
        lambda x: pd.isna(x) or str(x).strip().lower() in ['', 'false', '0', 'nan', 'none']
    )
    df = df[mask_perm]

filtered_count = len(df)
print(f"Filtered out {initial_count - filtered_count} rows (temporarily/permanently closed)")

# Remove columns (only if they exist)
columns_to_remove_existing = [col for col in columns_to_remove if col in df.columns]
df = df.drop(columns=columns_to_remove_existing, errors='ignore')
print(f"Removed {len(columns_to_remove_existing)} columns")

# Rename columns
rename_map = {}
if 'link' in df.columns:
    rename_map['link'] = 'gmaps_link'
if 'workday_timing' in df.columns:
    rename_map['workday_timing'] = 'opening_hour'

if rename_map:
    df = df.rename(columns=rename_map)
    print(f"Renamed columns: {rename_map}")

# Transform closed_on to opening_day
if 'closed_on' in df.columns:
    print("\nTransforming closed_on to opening_day...")
    df['opening_day'] = df['closed_on'].apply(transform_closed_on_to_opening_day)
    # Convert to JSON string for storage
    df['opening_day'] = df['opening_day'].apply(lambda x: json.dumps(x) if isinstance(x, list) else json.dumps([]))
    df = df.drop(columns=['closed_on'], errors='ignore')
    print("Transformed closed_on to opening_day")

# Transform coordinates
if 'coordinates' in df.columns:
    print("\nTransforming coordinates...")
    df['coordinates_jsonb'] = df['coordinates'].apply(
        lambda x: json.dumps(parse_coordinates(x)) if parse_coordinates(x) else None
    )
    # Extract latitude and longitude for location JSONB
    coords_data = df['coordinates'].apply(parse_coordinates)
    df['_latitude'] = coords_data.apply(lambda x: x['latitude'] if x and 'latitude' in x else None)
    df['_longitude'] = coords_data.apply(lambda x: x['longitude'] if x and 'longitude' in x else None)
    df = df.drop(columns=['coordinates'], errors='ignore')
    print("Transformed coordinates to JSONB format")

# Create location JSONB
if 'gmaps_link' in df.columns and '_latitude' in df.columns and '_longitude' in df.columns:
    print("\nCreating location JSONB...")
    df['location'] = df.apply(
        lambda row: create_location_jsonb(
            row['_latitude'],
            row['_longitude'],
            row['gmaps_link']
        ),
        axis=1
    )
    # Remove temporary columns
    df = df.drop(columns=['_latitude', '_longitude', 'coordinates_jsonb'], errors='ignore')
    print("Created location JSONB")

# Transform hours to schedule
if 'hours' in df.columns:
    print("\nTransforming hours to schedule...")
    df['schedule'] = df['hours'].apply(
        lambda x: json.dumps(transform_hours_to_schedule(x)) if not pd.isna(x) else json.dumps([])
    )
    df = df.drop(columns=['hours'], errors='ignore')
    print("Transformed hours to schedule format")

# Save to output file
# Try both relative paths (if run from root) and current directory (if run from dataset/)
if os.path.exists('dataset'):
    output_file = 'dataset/processed-markets.csv'
else:
    output_file = 'processed-markets.csv'
print(f"\nSaving to {output_file}...")
df.to_csv(output_file, index=False)
print(f"Saved {len(df)} rows to {output_file}")
print(f"\nFinal columns: {list(df.columns)}")
print("\nProcessing complete!")
