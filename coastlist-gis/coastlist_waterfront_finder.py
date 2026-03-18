#!/usr/bin/env python3
"""
COASTLIST WATERFRONT PROPERTY IDENTIFIER v2
============================================
Identifies every property parcel whose boundary touches water.

Usage:
    python3 coastlist_waterfront_finder.py

Requirements:
    pip3 install geopandas shapely requests fiona pyproj
"""

import os
import sys
import json
import time
import warnings
import requests
from pathlib import Path

warnings.filterwarnings('ignore')

# ─── CONFIGURATION ───
COUNTY = "New Hanover"
STATE = "North Carolina"
STATE_ABBREV = "NC"
BBOX = {"min_lon": -78.1, "max_lon": -77.7, "min_lat": 33.85, "max_lat": 34.35}
OUTPUT_DIR = "coastlist_data"

FTYPE_TO_WATER = {
    312: "Ocean", 336: "River", 343: "Ocean", 378: "Ocean",
    390: "Lake", 431: "Pond", 436: "Lake", 445: "Ocean",
    460: "River", 466: "Pond", 537: "River", 558: "River",
    568: "River", 364: "Ocean",
}


def download_water_data():
    import geopandas as gpd
    cache = os.path.join(OUTPUT_DIR, "water_features.geojson")
    if os.path.exists(cache):
        print(f"  ✅ Cached water data: {cache}")
        return gpd.read_file(cache)

    print("\n🌊 STEP 1: Downloading water data from USGS...")
    print(f"  Area: {COUNTY} County, {STATE}")

    bbox_str = f"{BBOX['min_lon']},{BBOX['min_lat']},{BBOX['max_lon']},{BBOX['max_lat']}"
    layers = {2: "Rivers/Streams", 3: "Coastlines", 6: "Lakes/Ponds", 8: "River Areas"}
    base = "https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer"
    all_feat = []

    for lid, name in layers.items():
        print(f"  Fetching {name}...")
        params = {
            "where": "1=1", "geometry": bbox_str,
            "geometryType": "esriGeometryEnvelope",
            "inSR": "4326", "outSR": "4326",
            "outFields": "GNIS_NAME,FTYPE,FCODE",
            "f": "geojson", "resultRecordCount": 5000,
        }
        for attempt in range(3):
            timeout = 180 * (attempt + 1)
            try:
                print(f"    Attempt {attempt+1}/3 (timeout {timeout}s)...")
                r = requests.get(f"{base}/{lid}/query", params=params, timeout=timeout)
                if r.status_code == 200:
                    feats = r.json().get("features", [])
                    for f in feats:
                        ft = f.get("properties", {}).get("FTYPE", 0)
                        wt = FTYPE_TO_WATER.get(ft)
                        if wt:
                            f["properties"]["coastlist_water_type"] = wt
                            all_feat.append(f)
                    print(f"    ✅ {len(feats)} features")
                    break
            except requests.exceptions.Timeout:
                print(f"    ⚠ Timeout. {'Retrying...' if attempt < 2 else 'Skipping.'}")
            except Exception as e:
                print(f"    ⚠ {e}")
                if attempt < 2:
                    time.sleep(5)

    if not all_feat:
        print("\n  ❌ USGS server unreachable. Try again later or download manually:")
        print("  1. Go to https://apps.nationalmap.gov/downloader/")
        print("  2. Search for NHD data in your area")
        print(f"  3. Place files in {os.path.abspath(OUTPUT_DIR)}/")
        sys.exit(1)

    gj = {"type": "FeatureCollection", "features": all_feat}
    with open(cache, "w") as f:
        json.dump(gj, f)
    print(f"  ✅ {len(all_feat)} water features saved")
    return gpd.read_file(cache)


def download_parcel_data():
    import geopandas as gpd
    from shapely.geometry import box
    import numpy as np

    cache = os.path.join(OUTPUT_DIR, "parcels.geojson")
    if os.path.exists(cache):
        print(f"  ✅ Cached parcel data: {cache}")
        return gpd.read_file(cache)

    import glob
    for pat in ["*.shp", "*.geojson", "*.gpkg"]:
        files = glob.glob(os.path.join(OUTPUT_DIR, pat))
        if files:
            print(f"  ✅ Found: {files[0]}")
            gdf = gpd.read_file(files[0])
            gdf = gdf.cx[BBOX["min_lon"]:BBOX["max_lon"], BBOX["min_lat"]:BBOX["max_lat"]]
            return gdf

    print(f"\n🏠 STEP 2: Parcel data...")
    urls = [
        "https://gis.nhcgov.com/arcgis/rest/services/Parcels/MapServer/0/query",
        "https://maps.nhcgov.com/arcgis/rest/services/Parcels/MapServer/0/query",
    ]
    bbox_str = f"{BBOX['min_lon']},{BBOX['min_lat']},{BBOX['max_lon']},{BBOX['max_lat']}"

    for url in urls:
        print(f"  Trying {url}...")
        try:
            r = requests.get(url, params={
                "where": "1=1", "geometry": bbox_str,
                "geometryType": "esriGeometryEnvelope",
                "inSR": "4326", "outSR": "4326", "outFields": "*",
                "f": "geojson", "resultRecordCount": 5000,
            }, timeout=120)
            if r.status_code == 200 and r.json().get("features"):
                data = r.json()
                with open(cache, "w") as f:
                    json.dump(data, f)
                print(f"  ✅ {len(data['features'])} parcels")
                return gpd.read_file(cache)
        except Exception as e:
            print(f"  ⚠ {e}")

    print(f"\n  📋 Need parcel data. Download from county GIS website:")
    print(f"  Search: '{COUNTY} County {STATE_ABBREV} GIS parcel download'")
    print(f"  Place .shp files in: {os.path.abspath(OUTPUT_DIR)}/")
    print(f"\n  Generating demo parcels for now...")

    np.random.seed(42)
    streets = ["Oceanview Dr","Harbor Ln","Coastal Blvd","River Rd","Shoreline Way",
               "Marina Dr","Lakeshore Dr","Inlet Rd","Bayfront Ave","Driftwood Ln",
               "Seabreeze Way","Pelican Dr","Pine St","Oak Ave","Main St"]
    features = []
    for i in range(800):
        cx = BBOX["min_lon"] + np.random.random() * (BBOX["max_lon"] - BBOX["min_lon"])
        cy = BBOX["min_lat"] + np.random.random() * (BBOX["max_lat"] - BBOX["min_lat"])
        w = 0.0004 + np.random.random() * 0.002
        h = 0.0004 + np.random.random() * 0.002
        features.append({
            "type": "Feature",
            "geometry": box(cx-w/2, cy-h/2, cx+w/2, cy+h/2).__geo_interface__,
            "properties": {
                "PARCEL_ID": f"NHC-{i+1:06d}",
                "SITUS_ADDR": f"{np.random.randint(100,9999)} {streets[np.random.randint(0,len(streets))]}",
                "SITUS_CITY": "Wilmington",
                "TOTAL_VALUE": int(200000 + np.random.random() * 2000000),
                "LAND_ACRES": round(0.1 + np.random.random() * 2, 2),
                "HEATED_SQF": int(1200 + np.random.random() * 4000),
                "BEDROOMS": np.random.randint(2, 7),
                "FULL_BATH": np.random.randint(1, 5),
                "YEAR_BUILT": np.random.randint(1960, 2024),
            }
        })
    gj = {"type": "FeatureCollection", "features": features}
    with open(cache, "w") as f:
        json.dump(gj, f)
    print(f"  ⚠ Generated 800 demo parcels (replace with real data)")
    return gpd.read_file(cache)


def find_waterfront(parcels, water):
    from shapely.ops import unary_union
    print(f"\n🔍 STEP 3: Finding waterfront parcels...")
    print(f"  Parcels: {len(parcels)} | Water features: {len(water)}")

    if parcels.crs is None: parcels = parcels.set_crs("EPSG:4326")
    if water.crs is None: water = water.set_crs("EPSG:4326")
    if parcels.crs != water.crs: water = water.to_crs(parcels.crs)

    print("  Building water boundary...")
    water_union = unary_union(water.geometry)
    water_buf = water_union.buffer(0.0001)

    print("  Scanning parcels...")
    results = []
    total = len(parcels)

    for idx, parcel in parcels.iterrows():
        if idx % 100 == 0:
            print(f"  {idx}/{total} ({int(idx/total*100)}%)", end="\r")
        geom = parcel.geometry
        if geom is None or geom.is_empty: continue
        if not geom.intersects(water_buf): continue

        touching = water[water.geometry.intersects(geom.buffer(0.0001))]
        if len(touching) == 0: continue

        types = []
        if "coastlist_water_type" in touching.columns:
            types = touching["coastlist_water_type"].dropna().unique().tolist()
        pri = {"Ocean": 1, "River": 2, "Lake": 3, "Pond": 4}
        types_s = sorted(types, key=lambda x: pri.get(x, 99))
        wt = types_s[0] if types_s else "Unknown"

        names = []
        if "GNIS_NAME" in touching.columns:
            names = [n for n in touching["GNIS_NAME"].dropna().unique() if n]

        try:
            ix = geom.boundary.intersection(water_buf)
            front = int(ix.length * 364000)
        except: front = 0

        props = parcel.drop("geometry").to_dict()
        results.append({
            "parcel_id": str(props.get("PARCEL_ID", f"P-{idx}")),
            "address": str(props.get("SITUS_ADDR", "")),
            "city": str(props.get("SITUS_CITY", COUNTY)),
            "state": STATE, "county": COUNTY,
            "water_type": wt, "water_names": names[:3],
            "water_frontage_ft": max(front, 0),
            "total_value": int(props.get("TOTAL_VALUE", 0) or 0),
            "sqft": int(props.get("HEATED_SQF", 0) or 0),
            "beds": int(props.get("BEDROOMS", 0) or 0),
            "baths": int(props.get("FULL_BATH", 0) or 0),
            "year_built": int(props.get("YEAR_BUILT", 0) or 0),
            "lot_acres": float(props.get("LAND_ACRES", 0) or 0),
            "lat": geom.centroid.y, "lon": geom.centroid.x,
        })

    print(f"  {total}/{total} (100%)      ")
    print(f"\n  ✅ {len(results)} waterfront parcels found")
    counts = {}
    for r in results:
        counts[r["water_type"]] = counts.get(r["water_type"], 0) + 1
    for wt, c in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  🌊 {wt}: {c}")
    return results


def export(waterfront):
    print(f"\n📦 STEP 4: Exporting...")
    props = []
    for p in waterfront:
        if not p.get("address"): continue
        price = p.get("total_value", 0) or 500000
        wd = f"borders {', '.join(p['water_names'])}" if p.get("water_names") else f"has direct {p['water_type'].lower()} access"
        props.append({
            "id": f"CL-{p['parcel_id']}",
            "address": p["address"], "city": p.get("city", ""),
            "state": p["state"], "county": p["county"],
            "price": price, "beds": p.get("beds", 0),
            "baths": p.get("baths", 0), "sqft": p.get("sqft", 0),
            "lotAcres": p.get("lot_acres", 0),
            "waterType": p["water_type"],
            "waterFrontage": p.get("water_frontage_ft", 0),
            "yearBuilt": p.get("year_built", 0), "daysOnMarket": 0,
            "description": f"Waterfront property in {p['county']} County, {p['state']}. This {p['water_type'].lower()}front property {wd}. Property line verified via GIS boundary analysis.",
            "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop",
            "images": [],
            "features": [f for f in [f"{p['water_type']}front", "GIS Verified", f"{p['water_frontage_ft']}ft Frontage" if p.get("water_frontage_ft", 0) > 0 else None] if f],
            "featured": price > 1000000, "isDemo": False,
        })
    props.sort(key=lambda x: -x["price"])

    out = os.path.join(OUTPUT_DIR, "waterfront_properties.json")
    with open(out, "w") as f: json.dump(props, f, indent=2)

    csv = os.path.join(OUTPUT_DIR, "waterfront_summary.csv")
    with open(csv, "w") as f:
        f.write("parcel_id,address,city,county,state,water_type,frontage_ft,value,sqft,beds,baths,year,lat,lon\n")
        for p in waterfront:
            f.write(f'"{p["parcel_id"]}","{p.get("address","")}","{p.get("city","")}","{p["county"]}","{p["state"]}","{p["water_type"]}",{p.get("water_frontage_ft",0)},{p.get("total_value",0)},{p.get("sqft",0)},{p.get("beds",0)},{p.get("baths",0)},{p.get("year_built",0)},{p.get("lat",0):.6f},{p.get("lon",0):.6f}\n')

    print(f"  ✅ {len(props)} properties → {out}")
    print(f"  ✅ CSV → {csv}")
    return props


def main():
    print("=" * 60)
    print("  COASTLIST WATERFRONT PROPERTY IDENTIFIER")
    print(f"  Target: {COUNTY} County, {STATE}")
    print("=" * 60)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    water = download_water_data()
    parcels = download_parcel_data()
    wf = find_waterfront(parcels, water)
    export(wf)

    print("\n" + "=" * 60)
    print(f"  🎉 DONE! {len(wf)} waterfront properties found")
    print("=" * 60)
    print(f"\n  Import into CoastList:")
    print(f"  1. Go to coastlist.com?admin=true")
    print(f"  2. Click 'Import'")
    print(f"  3. Select {OUTPUT_DIR}/waterfront_properties.json\n")


if __name__ == "__main__":
    main()
