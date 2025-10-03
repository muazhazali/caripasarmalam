'''
Script to clean messy dataset of all pasar malam in Malaysia.
'''

import pandas as pd

# read the dataset csv
df = pd.read_csv('./pasar-malam-malaysia.csv', encoding='utf-8')

df.head()

# mask for rows where latitude contains a comma
has_combined_coords = df['latitude'].str.contains(',', na=False)

if has_combined_coords.any():
    
    # split the latitude column by comma
    split_parts = df.loc[has_combined_coords, 'latitude'].str.split(',', expand=True)

    # assign first part to latitude and second part to longitude (where needed)
    df.loc[has_combined_coords, 'latitude'] = split_parts[0].str.strip()
    df.loc[has_combined_coords, 'longitude'] = split_parts[1].str.strip()

df['latitude'] = df['latitude'].str.strip()
df['longitude'] = df['longitude'].str.strip()

df.head()
    
