#!/usr/bin/env python3
"""
Run the waterfront finder across multiple counties.

Usage:
    python run_all_counties.py              # Process all counties
    python run_all_counties.py "Miami-Dade" # Process just one county
"""

import sys
import json
import os
from county_configs import COUNTIES
import coastlist_waterfront_finder as finder

def main():
    target_county = sys.argv[1] if len(sys.argv) > 1 else None
    
    all_properties = []
    
    counties_to_process = COUNTIES
    if target_county:
        counties_to_process = [c for c in COUNTIES if c["county_name"].lower() == target_county.lower()]
        if not counties_to_process:
            print(f"❌ County '{target_county}' not found in county_configs.py")
            print(f"   Available counties: {', '.join(c['county_name'] for c in COUNTIES)}")
            sys.exit(1)
    
    print(f"🌊 Processing {len(counties_to_process)} counties...\n")
    
    for i, county_config in enumerate(counties_to_process):
        print(f"\n{'='*60}")
        print(f"  [{i+1}/{len(counties_to_process)}] {county_config['county_name']} County, {county_config['state_name']}")
        print(f"{'='*60}\n")
        
        # Update the finder's config
        finder.CONFIG.update(county_config)
        finder.CONFIG["output_dir"] = f"coastlist_data/{county_config['state_abbrev']}_{county_config['county_name'].replace(' ', '_')}"
        
        try:
            finder.create_output_dir()
            water_gdf = finder.download_nhd_data()
            parcels_gdf = finder.download_parcel_data()
            waterfront = finder.find_waterfront_parcels(parcels_gdf, water_gdf)
            properties = finder.export_for_coastlist(waterfront)
            all_properties.extend(properties)
            print(f"\n✅ {county_config['county_name']}: {len(properties)} waterfront properties found")
        except Exception as e:
            print(f"\n❌ Error processing {county_config['county_name']}: {e}")
    
    # Export combined results
    if all_properties:
        combined_file = "coastlist_data/all_waterfront_properties.json"
        os.makedirs("coastlist_data", exist_ok=True)
        with open(combined_file, "w") as f:
            json.dump(all_properties, f, indent=2)
        
        print(f"\n\n{'='*60}")
        print(f"  🎉 ALL DONE!")
        print(f"  Total waterfront properties: {len(all_properties)}")
        print(f"  Combined export: {combined_file}")
        print(f"{'='*60}")
        print(f"\n  Import into CoastList:")
        print(f"  1. Go to coastlist.com?admin=true")
        print(f"  2. Click 'Import'")
        print(f"  3. Select {combined_file}")


if __name__ == "__main__":
    main()
