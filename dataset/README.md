# Dataset Processing

This directory contains CSV files with pasar malam (night market) data for different states in Malaysia, along with a Python script to process and transform the data.

## Files

- `pasar-malam-in-*.csv` - Raw CSV files for each state containing market data scraped from Google Maps
- `data-processing.py` - Python script to process, transform, and merge all CSV files
- `processed-markets.csv` - Output file containing processed and transformed data (generated after running the script)

## Data Processing Script

### Overview

The `data-processing.py` script performs the following operations:

1. **Loads all CSV files** matching the pattern `pasar-malam-in-*.csv`
2. **Filters rows** - Removes markets that are temporarily or permanently closed
3. **Removes unnecessary columns** - Drops 40+ columns not needed for the database
4. **Renames columns** - Standardizes column names
5. **Transforms data formats** - Converts data to match database schema requirements
6. **Merges all data** - Combines all state files into a single output file

### Usage

```bash
# Install required dependencies
pip install pandas numpy

# Run the processing script
python dataset/data-processing.py
```

The script will generate `dataset/processed-markets.csv` with the transformed data.

### Transformations

#### 1. Column Removal

The following columns are removed from the dataset:
- `place_id`, `description`, `is_spending_on_ads`, `reviews`, `rating`, `competitors`
- `website`, `phone`, `can_claim`, `owner`, `owner_posts`, `featured_image`
- `main_category`, `categories`, `status`, `is_temporarily_closed`, `is_permanently_closed`
- `price_range`, `reviews_per_rating`, `reviews_link`, `plus_code`, `detailed_address`
- `time_zone`, `cid`, `data_id`, `kgmid`, `about`, `most_popular_times`, `popular_times`
- `menu`, `reservations`, `order_online_links`, `image_count`, `images`, `featured_images`
- `on_site_places`, `customer_updates`, `featured_question`, `review_keywords`
- `featured_reviews`, `detailed_reviews`, `query`

#### 2. Column Renaming

- `link` → `gmaps_link`
- `workday_timing` → `opening_hour`

#### 3. Closed On → Opening Day Transformation

The `closed_on` column is transformed to `opening_day` using inverse logic:

- **"Open All Days"** → All 7 days (`["mon", "tue", "wed", "thu", "fri", "sat", "sun"]`)
- **JSON array** like `["Monday","Tuesday"]` → Remaining days (all days except those listed)
- **Empty/null** → All 7 days

Day names are converted to lowercase abbreviations:
- Monday → mon
- Tuesday → tue
- Wednesday → wed
- Thursday → thu
- Friday → fri
- Saturday → sat
- Sunday → sun

The result is stored as a JSON string array.

#### 4. Coordinates Transformation

The `coordinates` column (JSON string format) is parsed and transformed:
- **Input**: `'{"latitude":5.2781252,"longitude":115.24570569999999}'`
- **Output**: JSON string with same structure, stored temporarily for location JSONB creation
- The original `coordinates` column is removed after transformation

#### 5. Location JSONB Creation

A new `location` column is created combining:
- `latitude` (from coordinates)
- `longitude` (from coordinates)
- `gmaps_link` (from renamed `link` column)

**Format**: `{"latitude": 5.2781252, "longitude": 115.24570569999999, "gmaps_link": "https://..."}`

Stored as a JSON string (will be parsed as JSONB in the database).

#### 6. Hours → Schedule Transformation

The `hours` column is transformed to match the codebase schedule format:

**Input format**:
```json
[{"day":"Monday","times":["6 pm-12 am"]},{"day":"Tuesday","times":["6 pm-12 am"]}]
```

**Output format**:
```json
[{"days": ["mon", "tue"], "times": [{"start": "18:00", "end": "00:00"}]}]
```

**Special cases handled**:
- **"Open 24 hours"** → `{"start": "00:00", "end": "23:59", "note": "Open 24 hours"}`
- **"Closed"** → Day is skipped (not included in schedule)
- **Time ranges** like "6 pm-12 am" → Parsed to 24-hour format `{"start": "18:00", "end": "00:00"}`
- **Consecutive days with same times** → Grouped into single schedule entries

**Time parsing examples**:
- `"6 pm-12 am"` → `{"start": "18:00", "end": "00:00"}`
- `"4:30-8:30 pm"` → `{"start": "16:30", "end": "20:30"}`
- `"Open 24 hours"` → `{"start": "00:00", "end": "23:59", "note": "Open 24 hours"}`

The result is stored as a JSON string array.

#### 7. Row Filtering

Rows are removed if:
- `is_temporarily_closed` has a truthy value (non-empty, not "false", not "0")
- `is_permanently_closed` has a truthy value (non-empty, not "false", not "0")

### Output Format

The processed CSV file (`processed-markets.csv`) contains the following columns:

- `name` - Market name
- `address` - Full address
- `gmaps_link` - Google Maps link (renamed from `link`)
- `opening_hour` - Workday timing (renamed from `workday_timing`)
- `opening_day` - JSON array of opening days (transformed from `closed_on`)
- `location` - JSONB object with latitude, longitude, and gmaps_link
- `schedule` - JSONB array with schedule format matching codebase structure
- Other columns that were not removed

All JSON fields are stored as JSON strings in the CSV file and will be parsed as JSONB when imported into the database.

### Database Schema Compatibility

The processed data is compatible with the `pasar_malams` table schema:

- **location** (jsonb): `{"latitude": number, "longitude": number, "gmaps_link": string}`
- **schedule** (jsonb): Array of `{"days": string[], "times": [{"start": string, "end": string, "note": string}]}`

### Notes

- The script handles missing/null values gracefully
- Data types are preserved (strings, numbers, booleans)
- Coordinate precision is maintained
- Various time formats are parsed and normalized
- Days are automatically grouped when they have identical schedules

