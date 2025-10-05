#!/usr/bin/env python3
"""
CSV to TypeScript Markets Data Transformer

This script transforms CSV data of Malaysian night markets (pasar malam) 
into TypeScript code that matches the markets-data.ts interface.

Features:
- Robust error handling and data validation
- Flexible input handling for different CSV formats
- Automatic ID generation from market names
- Schedule parsing from operating days and hours
- TypeScript code generation with proper formatting
"""

import pandas as pd
import re
import json
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MarketDataTransformer:
    """Transforms CSV market data to TypeScript format."""
    
    def __init__(self):
        # Day name mappings (Malay to English)
        self.day_mappings = {
            'isnin': 'mon', 'monday': 'mon',
            'selasa': 'tue', 'tuesday': 'tue',
            'rabu': 'wed', 'wednesday': 'wed',
            'khamis': 'thu', 'thursday': 'thu',
            'jumaat': 'fri', 'friday': 'fri',
            'sabtu': 'sat', 'saturday': 'sat',
            'ahad': 'sun', 'sunday': 'sun'
        }
        
        # Weekday enum for TypeScript
        self.weekday_enum = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    
    def clean_and_validate_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and validate the input DataFrame."""
        logger.info("Cleaning and validating data...")
        
        # Remove completely empty rows
        df = df.dropna(how='all')
        
        # Clean string columns
        string_columns = ['name', 'address', 'district', 'state', 'operating_day', 'operating_hour']
        for col in string_columns:
            if col in df.columns:
                df[col] = df[col].astype(str).str.strip()
                df[col] = df[col].replace('nan', '')
        
        # Clean numeric columns
        numeric_columns = ['latitude', 'longitude', 'postcode']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Handle combined lat/lng columns (from data-cleaner.py logic)
        if 'latitude' in df.columns:
            has_combined_coords = df['latitude'].astype(str).str.contains(',', na=False)
            if has_combined_coords.any():
                logger.info(f"Found {has_combined_coords.sum()} rows with combined coordinates")
                split_parts = df.loc[has_combined_coords, 'latitude'].astype(str).str.split(',', expand=True)
                df.loc[has_combined_coords, 'latitude'] = pd.to_numeric(split_parts[0].str.strip(), errors='coerce')
                df.loc[has_combined_coords, 'longitude'] = pd.to_numeric(split_parts[1].str.strip(), errors='coerce')
        
        logger.info(f"Data cleaned. {len(df)} valid rows remaining.")
        return df
    
    def generate_market_id(self, name: str) -> str:
        """Generate a market ID from the market name."""
        if not name or name == 'nan':
            return 'unknown-market'
        
        # Convert to lowercase and replace spaces/special chars with hyphens
        id_name = re.sub(r'[^\w\s-]', '', name.lower())
        id_name = re.sub(r'[-\s]+', '-', id_name)
        id_name = id_name.strip('-')
        
        # Limit length
        if len(id_name) > 50:
            id_name = id_name[:50].rstrip('-')
        
        return id_name
    
    def parse_operating_days(self, operating_day: str) -> List[str]:
        """Parse operating days string into weekday array."""
        if not operating_day or str(operating_day).lower() in ['nan', 'none', ''] or pd.isna(operating_day):
            return []
        
        days = []
        # Convert to string and split by common separators
        day_str = str(operating_day).lower()
        day_parts = re.split(r'[,&]|\s+and\s+', day_str)
        
        for part in day_parts:
            part = part.strip()
            if part in self.day_mappings:
                mapped_day = self.day_mappings[part]
                if mapped_day not in days:
                    days.append(mapped_day)
            else:
                # Try to find partial matches
                for malay_day, eng_day in self.day_mappings.items():
                    if malay_day in part or eng_day in part:
                        if eng_day not in days:
                            days.append(eng_day)
                        break
        
        return sorted(days, key=lambda x: self.weekday_enum.index(x))
    
    def parse_operating_hours(self, operating_hour: str) -> List[Dict[str, str]]:
        """Parse operating hours string into time objects."""
        if not operating_hour or str(operating_hour).lower() in ['nan', 'none', ''] or pd.isna(operating_hour):
            return []
        
        times = []
        # Convert to string and split by comma for multiple time slots
        hour_str = str(operating_hour)
        hour_parts = hour_str.split(',')
        
        for part in hour_parts:
            part = part.strip()
            if not part:
                continue
                
            # Parse time format (e.g., "4-10pm", "5-10pm", "4.30pm-10.30pm")
            time_match = re.search(r'(\d+(?:\.\d+)?)(?:am|pm)?\s*-\s*(\d+(?:\.\d+)?)(am|pm)', part.lower())
            if time_match:
                start_time = time_match.group(1)
                end_time = time_match.group(2)
                end_period = time_match.group(3)
                
                # Convert to 24-hour format
                start_24h = self.convert_to_24h(start_time, 'pm' if 'pm' in part.lower() and float(start_time) < 12 else 'am')
                end_24h = self.convert_to_24h(end_time, end_period)
                
                times.append({
                    'start': start_24h,
                    'end': end_24h,
                    'note': 'Night market'
                })
        
        return times
    
    def convert_to_24h(self, time_str: str, period: str) -> str:
        """Convert time to 24-hour format."""
        try:
            time_val = float(time_str)
            if period == 'pm' and time_val < 12:
                time_val += 12
            elif period == 'am' and time_val == 12:
                time_val = 0
            
            hours = int(time_val)
            minutes = int((time_val - hours) * 60)
            
            return f"{hours:02d}:{minutes:02d}"
        except (ValueError, TypeError):
            return "00:00"
    
    def parse_amenities(self, amenities_str: str) -> Dict[str, bool]:
        """Parse amenities string into boolean flags."""
        if not amenities_str or str(amenities_str).lower() in ['nan', 'none', ''] or pd.isna(amenities_str):
            return {'toilet': False, 'prayer_room': False}
        
        amenities_lower = str(amenities_str).lower()
        return {
            'toilet': 'toilet' in amenities_lower,
            'prayer_room': 'prayer' in amenities_lower or 'surau' in amenities_lower
        }
    
    def parse_parking(self, parking_str: str) -> Dict[str, Any]:
        """Parse parking information."""
        if not parking_str or str(parking_str).lower() in ['nan', 'none', ''] or pd.isna(parking_str):
            return {
                'available': False,
                'accessible': False,
                'notes': 'No parking information available'
            }
        
        parking_lower = str(parking_str).lower()
        available = 'no' not in parking_lower and 'tiada' not in parking_lower
        accessible = 'accessible' in parking_lower or 'handicap' in parking_lower
        
        return {
            'available': available,
            'accessible': accessible,
            'notes': str(parking_str) if parking_str else 'No parking information available'
        }
    
    def clean_area_m2(self, area_str: str) -> Optional[float]:
        """Clean and convert area string to float."""
        if not area_str or str(area_str).lower() in ['nan', 'none', ''] or pd.isna(area_str):
            return None
        
        # Extract numbers from area string
        numbers = re.findall(r'[\d,]+\.?\d*', str(area_str))
        if numbers:
            try:
                # Remove commas and convert to float
                area_value = float(numbers[0].replace(',', ''))
                return area_value
            except (ValueError, TypeError):
                pass
        
        return None
    
    def transform_market_row(self, row: pd.Series) -> Dict[str, Any]:
        """Transform a single market row to the target format."""
        try:
            # Generate ID
            market_id = self.generate_market_id(row.get('name', ''))
            
            # Parse schedule
            days = self.parse_operating_days(row.get('operating_day', ''))
            times = self.parse_operating_hours(row.get('operating_hour', ''))
            
            schedule = []
            if days and times:
                # Group times by days (simplified - assumes all days have same times)
                for day in days:
                    schedule.append({
                        'days': [day],
                        'times': times
                    })
            
            # Parse amenities
            amenities = self.parse_amenities(row.get('amenities', ''))
            
            # Parse parking
            parking = self.parse_parking(row.get('parking', ''))
            
            # Clean area
            area_m2 = self.clean_area_m2(row.get('area_m2', ''))
            
            # Clean total_shop
            total_shop = None
            if 'total_shop' in row and pd.notna(row['total_shop']):
                try:
                    total_shop = int(row['total_shop'])
                except (ValueError, TypeError):
                    pass
            
            # Build location object
            location = None
            if pd.notna(row.get('latitude')) and pd.notna(row.get('longitude')):
                location = {
                    'latitude': float(row['latitude']),
                    'longitude': float(row['longitude']),
                    'gmaps_link': row.get('gmaps_link', '') if pd.notna(row.get('gmaps_link')) else ''
                }
            
            market_data = {
                'id': market_id,
                'name': str(row.get('name', '')) if pd.notna(row.get('name')) else '',
                'address': str(row.get('address', '')) if pd.notna(row.get('address')) else '',
                'district': str(row.get('district', '')) if pd.notna(row.get('district')) else '',
                'state': str(row.get('state', '')) if pd.notna(row.get('state')) else '',
                'schedule': schedule,
                'parking': parking,
                'amenities': amenities,
                'status': str(row.get('status', '')) if pd.notna(row.get('status')) else '',
                'area_m2': area_m2,
                'total_shop': total_shop,
                'description': None,  # Will be filled later if needed
                'contact': None,  # Will be filled later if needed
                'location': location
            }
            
            return market_data
            
        except Exception as e:
            logger.error(f"Error transforming market row: {e}")
            logger.error(f"Row data: {row.to_dict()}")
            return None
    
    def transform_csv_to_markets(self, csv_path: str) -> List[Dict[str, Any]]:
        """Transform CSV file to markets data."""
        logger.info(f"Loading CSV from: {csv_path}")
        
        try:
            # Try different encodings
            encodings = ['utf-8', 'latin-1', 'cp1252']
            df = None
            
            for encoding in encodings:
                try:
                    df = pd.read_csv(csv_path, encoding=encoding)
                    logger.info(f"Successfully loaded CSV with {encoding} encoding")
                    break
                except UnicodeDecodeError:
                    continue
            
            if df is None:
                raise ValueError("Could not read CSV with any supported encoding")
            
            # Clean and validate data
            df = self.clean_and_validate_data(df)
            
            # Transform each row
            markets = []
            for index, row in df.iterrows():
                market_data = self.transform_market_row(row)
                if market_data:
                    markets.append(market_data)
            
            logger.info(f"Successfully transformed {len(markets)} markets")
            return markets
            
        except Exception as e:
            logger.error(f"Error transforming CSV: {e}")
            raise
    
    def generate_typescript_code(self, markets: List[Dict[str, Any]]) -> str:
        """Generate TypeScript code from markets data."""
        logger.info("Generating TypeScript code...")
        
        # TypeScript header
        ts_code = '''export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface MarketSchedule {
  days: Weekday[]
  times: {
    start: string
    end: string
    note?: string
  }[]
}

export interface Market {
  id: string
  name: string
  address: string
  district: string
  state: string
  schedule: MarketSchedule[]
  parking: {
    available: boolean
    accessible: boolean
    notes: string
  }
  amenities: {
    toilet: boolean
    prayer_room: boolean
  }
  status: string
  area_m2: number | null
  total_shop: number | null
  description?: string
  contact?: {
    phone?: string
    email?: string
  }
  location?: {
    latitude: number
    longitude: number
    gmaps_link: string
  }
}

export const marketsData: Market[] = [
'''
        
        # Add each market
        for i, market in enumerate(markets):
            ts_code += '  {\n'
            ts_code += f'    id: "{market["id"]}",\n'
            ts_code += f'    name: "{market["name"]}",\n'
            ts_code += f'    address: "{market["address"]}",\n'
            ts_code += f'    district: "{market["district"]}",\n'
            ts_code += f'    state: "{market["state"]}",\n'
            
            # Schedule
            ts_code += '    schedule: [\n'
            for schedule_item in market['schedule']:
                ts_code += '      {\n'
                ts_code += f'        days: {json.dumps(schedule_item["days"])},\n'
                ts_code += '        times: [\n'
                for time_item in schedule_item['times']:
                    ts_code += '          {\n'
                    ts_code += f'            start: "{time_item["start"]}",\n'
                    ts_code += f'            end: "{time_item["end"]}",\n'
                    if time_item.get('note'):
                        ts_code += f'            note: "{time_item["note"]}",\n'
                    ts_code += '          },\n'
                ts_code += '        ],\n'
                ts_code += '      },\n'
            ts_code += '    ],\n'
            
            # Parking
            ts_code += '    parking: {\n'
            ts_code += f'      available: {str(market["parking"]["available"]).lower()},\n'
            ts_code += f'      accessible: {str(market["parking"]["accessible"]).lower()},\n'
            ts_code += f'      notes: "{market["parking"]["notes"]}",\n'
            ts_code += '    },\n'
            
            # Amenities
            ts_code += '    amenities: {\n'
            ts_code += f'      toilet: {str(market["amenities"]["toilet"]).lower()},\n'
            ts_code += f'      prayer_room: {str(market["amenities"]["prayer_room"]).lower()},\n'
            ts_code += '    },\n'
            
            # Status
            ts_code += f'    status: "{market["status"]}",\n'
            
            # Area and total_shop
            area_str = str(market["area_m2"]) if market["area_m2"] is not None else "null"
            total_shop_str = str(market["total_shop"]) if market["total_shop"] is not None else "null"
            ts_code += f'    area_m2: {area_str},\n'
            ts_code += f'    total_shop: {total_shop_str},\n'
            
            # Location
            if market["location"]:
                ts_code += '    location: {\n'
                ts_code += f'      latitude: {market["location"]["latitude"]},\n'
                ts_code += f'      longitude: {market["location"]["longitude"]},\n'
                ts_code += f'      gmaps_link: "{market["location"]["gmaps_link"]}",\n'
                ts_code += '    },\n'
            
            ts_code += '  }'
            if i < len(markets) - 1:
                ts_code += ','
            ts_code += '\n'
        
        # Footer
        ts_code += ''']

export function getMarketById(id: string): Market | undefined {
  return marketsData.find((market) => market.id === id)
}

export function getAllMarkets(): Market[] {
  return marketsData
}
'''
        
        return ts_code
    
    def save_typescript_file(self, ts_code: str, output_path: str) -> None:
        """Save TypeScript code to file."""
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(ts_code)
            logger.info(f"TypeScript code saved to: {output_path}")
        except Exception as e:
            logger.error(f"Error saving TypeScript file: {e}")
            raise

def main():
    """Main function to run the transformer."""
    transformer = MarketDataTransformer()
    
    # Get the directory of this script
    script_dir = Path(__file__).parent
    
    # Input CSV file (prioritize the larger dataset)
    csv_files = [
        script_dir / 'pasar-malam-malaysia.csv',
        script_dir / 'df.csv'
    ]
    
    csv_path = None
    for csv_file in csv_files:
        if csv_file.exists():
            csv_path = csv_file
            break
    
    if not csv_path:
        logger.error("No CSV file found in the dataset directory")
        return
    
    logger.info(f"Using CSV file: {csv_path}")
    
    try:
        # Transform CSV to markets data
        markets = transformer.transform_csv_to_markets(str(csv_path))
        
        if not markets:
            logger.error("No markets data generated")
            return
        
        # Generate TypeScript code
        ts_code = transformer.generate_typescript_code(markets)
        
        # Save to output file
        output_path = script_dir / 'markets-data-generated.ts'
        transformer.save_typescript_file(ts_code, str(output_path))
        
        logger.info(f"Transformation completed successfully!")
        logger.info(f"Generated {len(markets)} markets")
        logger.info(f"Output saved to: {output_path}")
        
    except Exception as e:
        logger.error(f"Transformation failed: {e}")
        raise

if __name__ == "__main__":
    main()
