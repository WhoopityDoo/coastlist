"""
COASTLIST COUNTY CONFIGURATIONS

Each entry defines a county to scan for waterfront properties.
Edit this file to add more counties.

To find your county's bounding box:
  1. Go to https://boundingbox.klokantech.com/
  2. Search for your county
  3. Copy the CSV values (W,S,E,N format)

To find your HU4 code:
  Go to https://water.usgs.gov/wsc/map_index.html
"""

COUNTIES = [
    # ─── FLORIDA ───
    {
        "county_name": "Miami-Dade",
        "state_name": "Florida",
        "state_abbrev": "FL",
        "bbox": {"min_lon": -80.87, "max_lon": -80.11, "min_lat": 25.24, "max_lat": 25.98},
        "hu4_code": "0309",
    },
    {
        "county_name": "Palm Beach",
        "state_name": "Florida",
        "state_abbrev": "FL",
        "bbox": {"min_lon": -80.88, "max_lon": -79.97, "min_lat": 26.32, "max_lat": 26.97},
        "hu4_code": "0309",
    },
    {
        "county_name": "Monroe",
        "state_name": "Florida",
        "state_abbrev": "FL",
        "bbox": {"min_lon": -82.24, "max_lon": -80.26, "min_lat": 24.54, "max_lat": 25.49},
        "hu4_code": "0309",
    },
    {
        "county_name": "Collier",
        "state_name": "Florida",
        "state_abbrev": "FL",
        "bbox": {"min_lon": -82.18, "max_lon": -80.87, "min_lat": 25.84, "max_lat": 26.52},
        "hu4_code": "0309",
    },
    {
        "county_name": "Sarasota",
        "state_name": "Florida",
        "state_abbrev": "FL",
        "bbox": {"min_lon": -82.85, "max_lon": -82.06, "min_lat": 27.04, "max_lat": 27.47},
        "hu4_code": "0310",
    },
    
    # ─── NORTH CAROLINA ───
    {
        "county_name": "New Hanover",
        "state_name": "North Carolina",
        "state_abbrev": "NC",
        "bbox": {"min_lon": -78.1, "max_lon": -77.7, "min_lat": 33.85, "max_lat": 34.35},
        "hu4_code": "0302",
    },
    {
        "county_name": "Dare",
        "state_name": "North Carolina",
        "state_abbrev": "NC",
        "bbox": {"min_lon": -76.1, "max_lon": -75.46, "min_lat": 35.26, "max_lat": 36.22},
        "hu4_code": "0302",
    },
    {
        "county_name": "Carteret",
        "state_name": "North Carolina",
        "state_abbrev": "NC",
        "bbox": {"min_lon": -77.14, "max_lon": -76.28, "min_lat": 34.54, "max_lat": 35.06},
        "hu4_code": "0302",
    },
    
    # ─── SOUTH CAROLINA ───
    {
        "county_name": "Charleston",
        "state_name": "South Carolina",
        "state_abbrev": "SC",
        "bbox": {"min_lon": -80.52, "max_lon": -79.52, "min_lat": 32.49, "max_lat": 33.14},
        "hu4_code": "0305",
    },
    {
        "county_name": "Beaufort",
        "state_name": "South Carolina",
        "state_abbrev": "SC",
        "bbox": {"min_lon": -81.01, "max_lon": -80.39, "min_lat": 32.03, "max_lat": 32.6},
        "hu4_code": "0305",
    },
    
    # ─── MASSACHUSETTS ───
    {
        "county_name": "Barnstable",
        "state_name": "Massachusetts",
        "state_abbrev": "MA",
        "bbox": {"min_lon": -70.68, "max_lon": -69.93, "min_lat": 41.52, "max_lat": 41.97},
        "hu4_code": "0109",
    },
    {
        "county_name": "Nantucket",
        "state_name": "Massachusetts",
        "state_abbrev": "MA",
        "bbox": {"min_lon": -70.29, "max_lon": -69.94, "min_lat": 41.22, "max_lat": 41.39},
        "hu4_code": "0109",
    },
    
    # ─── MAINE ───
    {
        "county_name": "Cumberland",
        "state_name": "Maine",
        "state_abbrev": "ME",
        "bbox": {"min_lon": -70.72, "max_lon": -69.88, "min_lat": 43.57, "max_lat": 44.16},
        "hu4_code": "0106",
    },
    {
        "county_name": "York",
        "state_name": "Maine",
        "state_abbrev": "ME",
        "bbox": {"min_lon": -71.05, "max_lon": -70.27, "min_lat": 43.08, "max_lat": 43.75},
        "hu4_code": "0106",
    },
    
    # ─── CALIFORNIA ───
    {
        "county_name": "Monterey",
        "state_name": "California",
        "state_abbrev": "CA",
        "bbox": {"min_lon": -122.05, "max_lon": -120.21, "min_lat": 35.79, "max_lat": 36.92},
        "hu4_code": "1806",
    },
    {
        "county_name": "Santa Barbara",
        "state_name": "California",
        "state_abbrev": "CA",
        "bbox": {"min_lon": -120.65, "max_lon": -119.22, "min_lat": 34.27, "max_lat": 35.09},
        "hu4_code": "1806",
    },
    {
        "county_name": "Marin",
        "state_name": "California",
        "state_abbrev": "CA",
        "bbox": {"min_lon": -123.07, "max_lon": -122.35, "min_lat": 37.81, "max_lat": 38.32},
        "hu4_code": "1805",
    },
    
    # ─── NEW YORK ───
    {
        "county_name": "Suffolk",
        "state_name": "New York",
        "state_abbrev": "NY",
        "bbox": {"min_lon": -73.5, "max_lon": -71.85, "min_lat": 40.6, "max_lat": 41.18},
        "hu4_code": "0202",
    },
    
    # ─── TEXAS ───
    {
        "county_name": "Galveston",
        "state_name": "Texas",
        "state_abbrev": "TX",
        "bbox": {"min_lon": -95.25, "max_lon": -94.5, "min_lat": 29.0, "max_lat": 29.6},
        "hu4_code": "1204",
    },
    
    # ─── HAWAII ───
    {
        "county_name": "Honolulu",
        "state_name": "Hawaii",
        "state_abbrev": "HI",
        "bbox": {"min_lon": -158.29, "max_lon": -157.65, "min_lat": 21.25, "max_lat": 21.72},
        "hu4_code": "2002",
    },
]
