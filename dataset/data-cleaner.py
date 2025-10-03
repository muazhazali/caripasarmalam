'''
Script to clean messy dataset of all pasar malam in Malaysia.
'''

import pandas as pd

# read the dataset csv
df = pd.read_csv('./pasar-malam-malaysia.csv', encoding='utf-8')

df.head()

# if latitude column contains comma, then split the column by comma
if df['latitude'].str.contains(',').any():

    # split the latitude column by comma
    split_df = df['latitude'].str.split(',', expand=True)

    # assign first part to latitude column, and the second part to longitude column
    df['latitude'] = split_df[0]
    df['longitude'] = split_df[1]

    # clean whitespace from the latitude and longitude columns
    df['latitude'] = df['latitude'].str.strip()
    df['longitude'] = df['longitude'].str.strip()

df.head()
    
