// app/api/discover-waterfront/route.js
// Discovers waterfront properties by querying government GIS data
// Uses Florida Statewide Parcels + USGS NHD water bodies for spatial intersection

// ─── ArcGIS REST Service URLs ───
const FLORIDA_PARCELS = "https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer/0";
const NHD_WATERBODY = "https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer/12"; // Large-scale waterbodies
const NHD_FLOWLINE = "https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer/6";  // Rivers/streams

// Florida county FIPS codes for coastal counties
const COASTAL_COUNTIES = {
  "Miami-Dade": "086", "Palm Beach": "099", "Monroe": "087",
  "Collier": "021", "Sarasota": "115", "Pinellas": "103",
  "Lee": "071", "Martin": "085", "Brevard": "009",
  "Volusia": "127", "St. Johns": "109", "Duval": "031",
  "Bay": "005", "Walton": "131", "Nassau": "089",
  "St. Lucie": "111", "Indian River": "061", "Manatee": "081",
  "Hillsborough": "057", "Pasco": "101", "Citrus": "017",
  "Hernando": "053", "Flagler": "035", "Broward": "011",
};

// DOR use codes for residential properties (we want homes, not vacant land)
const RESIDENTIAL_DOR_CODES = [
  "0100", // Single Family
  "0200", // Mobile Home
  "0400", // Condominiums
  "0800", // Multi-family < 10 units
];

async function queryArcGIS(serviceUrl, params) {
  const url = `${serviceUrl}/query`;
  const body = new URLSearchParams({
    f: "geojson",
    outFields: "*",
    returnGeometry: "true",
    ...params,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`ArcGIS query failed: ${res.status}`);
  return res.json();
}

// Step 1: Get water body polygons for an area (bounding box)
async function getWaterBodies(bbox) {
  const { xmin, ymin, xmax, ymax } = bbox;
  const geometry = JSON.stringify({
    xmin, ymin, xmax, ymax,
    spatialReference: { wkid: 4326 },
  });

  return queryArcGIS(NHD_WATERBODY, {
    geometry,
    geometryType: "esriGeometryEnvelope",
    spatialRel: "esriSpatialRelIntersects",
    where: "FTYPE IN (390, 436, 466, 361)", // Lake/Pond, Reservoir, Swamp/Marsh, Playa — plus we query flowlines separately
    resultRecordCount: "50",
  });
}

// Step 2: Find parcels that intersect with a water body polygon
async function findParcelsNearWater(waterGeometry, countyCode) {
  const geometry = JSON.stringify(waterGeometry);
  let where = "1=1";
  if (countyCode) {
    where = `CO_NO = '${countyCode}'`;
  }

  return queryArcGIS(FLORIDA_PARCELS, {
    geometry,
    geometryType: "esriGeometryPolygon",
    spatialRel: "esriSpatialRelIntersects",
    where,
    resultRecordCount: "100",
    outFields: "PARCEL_ID,SITUS_ADDR,SITUS_CITY,SITUS_ZIP,DOR_UC,JV,AV_SD,NO_BULDNG,ACT_YR_BLT,TOT_LVG_AR,LND_SQFOOT",
  });
}

// Step 3: Alternative — query parcels directly by bounding box and filter by DOR code
async function findResidentialParcelsInArea(bbox, countyCode) {
  const { xmin, ymin, xmax, ymax } = bbox;
  const geometry = JSON.stringify({
    xmin, ymin, xmax, ymax,
    spatialReference: { wkid: 4326 },
  });

  // Build WHERE clause for residential properties only
  const dorFilter = RESIDENTIAL_DOR_CODES.map(c => `'${c}'`).join(",");
  let where = `DOR_UC IN (${dorFilter})`;
  if (countyCode) {
    where += ` AND CO_NO = '${countyCode}'`;
  }

  return queryArcGIS(FLORIDA_PARCELS, {
    geometry,
    geometryType: "esriGeometryEnvelope",
    spatialRel: "esriSpatialRelIntersects",
    where,
    resultRecordCount: "200",
    outFields: "PARCEL_ID,SITUS_ADDR,SITUS_CITY,SITUS_ZIP,DOR_UC,JV,AV_SD,NO_BULDNG,ACT_YR_BLT,TOT_LVG_AR,LND_SQFOOT",
  });
}

// Classify likely water type based on NHD feature type and location
function classifyWaterType(nhdFeature, county) {
  const ftype = nhdFeature?.properties?.FTYPE;
  const gnis_name = (nhdFeature?.properties?.GNIS_NAME || "").toLowerCase();
  const countyLower = (county || "").toLowerCase();

  // Ocean-adjacent counties
  const oceanCounties = ["monroe", "miami-dade", "broward", "palm beach", "martin",
    "st. lucie", "indian river", "brevard", "volusia", "flagler", "st. johns",
    "duval", "nassau", "bay", "walton", "pinellas", "sarasota", "collier", "lee", "manatee"];

  if (gnis_name.includes("ocean") || gnis_name.includes("atlantic") ||
      gnis_name.includes("gulf") || gnis_name.includes("bay") ||
      gnis_name.includes("intracoastal")) {
    return "Ocean";
  }
  if (gnis_name.includes("river") || gnis_name.includes("creek") || gnis_name.includes("stream")) {
    return "River";
  }
  if (gnis_name.includes("pond")) return "Pond";
  if (gnis_name.includes("lake") || ftype === 390) return "Lake";

  // Default based on county
  if (oceanCounties.includes(countyLower)) return "Ocean";
  return "Lake";
}

// Format parcel data into a simplified address object
function formatParcel(feature) {
  const p = feature.properties || {};
  return {
    parcelId: p.PARCEL_ID || "",
    address: (p.SITUS_ADDR || "").trim(),
    city: (p.SITUS_CITY || "").trim(),
    state: "Florida",
    zipcode: (p.SITUS_ZIP || "").trim(),
    justValue: p.JV || 0,
    assessedValue: p.AV_SD || 0,
    yearBuilt: p.ACT_YR_BLT || 0,
    livingArea: p.TOT_LVG_AR || 0,
    lotSqft: p.LND_SQFOOT || 0,
    dorCode: p.DOR_UC || "",
    hasBuilding: (p.NO_BULDNG || 0) > 0,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { county, bbox, limit = 50 } = body;

    if (!county && !bbox) {
      return Response.json({
        error: "Provide either 'county' (e.g. 'Miami-Dade') or 'bbox' ({xmin, ymin, xmax, ymax} in lat/lng).",
      }, { status: 400 });
    }

    const countyCode = county ? COASTAL_COUNTIES[county] : null;
    if (county && !countyCode) {
      return Response.json({
        error: `Unknown county '${county}'. Available: ${Object.keys(COASTAL_COUNTIES).join(", ")}`,
      }, { status: 400 });
    }

    // Default bounding boxes for popular counties (approximate)
    const countyBboxes = {
      "Miami-Dade": { xmin: -80.88, ymin: 25.14, xmax: -80.11, ymax: 25.98 },
      "Palm Beach": { xmin: -80.89, ymin: 26.32, xmax: -80.03, ymax: 26.97 },
      "Monroe": { xmin: -82.00, ymin: 24.54, xmax: -80.25, ymax: 25.35 },
      "Collier": { xmin: -81.82, ymin: 25.80, xmax: -80.87, ymax: 26.32 },
      "Sarasota": { xmin: -82.85, ymin: 27.03, xmax: -82.10, ymax: 27.40 },
      "Pinellas": { xmin: -82.85, ymin: 27.62, xmax: -82.53, ymax: 28.17 },
      "Lee": { xmin: -82.32, ymin: 26.33, xmax: -81.56, ymax: 26.78 },
      "Brevard": { xmin: -81.11, ymin: 27.82, xmax: -80.48, ymax: 28.63 },
      "Volusia": { xmin: -81.66, ymin: 28.76, xmax: -80.82, ymax: 29.43 },
      "Duval": { xmin: -82.05, ymin: 30.10, xmax: -81.34, ymax: 30.59 },
      "Broward": { xmin: -80.84, ymin: 25.96, xmax: -80.07, ymax: 26.32 },
      "St. Johns": { xmin: -81.68, ymin: 29.62, xmax: -81.21, ymax: 30.25 },
    };

    const searchBbox = bbox || countyBboxes[county] || countyBboxes["Miami-Dade"];

    // Use a smaller search area for efficiency (quarter of the county bbox)
    const midX = (searchBbox.xmin + searchBbox.xmax) / 2;
    const midY = (searchBbox.ymin + searchBbox.ymax) / 2;
    const quarterBbox = {
      xmin: midX - (midX - searchBbox.xmin) / 2,
      ymin: midY - (midY - searchBbox.ymin) / 2,
      xmax: midX + (searchBbox.xmax - midX) / 2,
      ymax: midY + (searchBbox.ymax - midY) / 2,
    };

    // Step 1: Get water bodies in the area
    let waterBodies;
    try {
      waterBodies = await getWaterBodies(quarterBbox);
    } catch (e) {
      return Response.json({ error: `Failed to query USGS water data: ${e.message}` }, { status: 502 });
    }

    if (!waterBodies.features || waterBodies.features.length === 0) {
      // Fall back to finding residential parcels in the area directly
      const parcels = await findResidentialParcelsInArea(quarterBbox, countyCode);
      const formatted = (parcels.features || []).map(formatParcel).filter(p => p.address && p.hasBuilding);
      return Response.json({
        success: true,
        method: "area_search",
        note: "No water bodies found in search area. Returning residential parcels in the area (not confirmed waterfront).",
        count: formatted.length,
        addresses: formatted.slice(0, limit),
      });
    }

    // Step 2: For each water body, find parcels that intersect
    const allParcels = [];
    const seenIds = new Set();

    for (const waterFeature of waterBodies.features.slice(0, 10)) {
      try {
        const parcels = await findParcelsNearWater(waterFeature.geometry, countyCode);
        const waterType = classifyWaterType(waterFeature, county);

        for (const parcel of (parcels.features || [])) {
          const formatted = formatParcel(parcel);
          if (formatted.address && formatted.hasBuilding && !seenIds.has(formatted.parcelId)) {
            seenIds.add(formatted.parcelId);
            allParcels.push({
              ...formatted,
              waterType,
              waterBodyName: waterFeature.properties?.GNIS_NAME || "Unknown",
            });
          }
        }
      } catch (e) {
        // Skip this water body on error, continue with others
        continue;
      }

      if (allParcels.length >= limit) break;
    }

    return Response.json({
      success: true,
      method: "spatial_intersection",
      county: county || "custom bbox",
      waterBodiesFound: waterBodies.features.length,
      count: allParcels.length,
      addresses: allParcels.slice(0, limit),
    });

  } catch (error) {
    return Response.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    endpoint: "/api/discover-waterfront",
    method: "POST",
    description: "Discover waterfront property addresses by spatially intersecting Florida parcel data with USGS water body polygons",
    data_sources: {
      parcels: "Florida Statewide Cadastral (DOR/Property Appraiser data via ArcGIS)",
      water: "USGS National Hydrography Dataset (NHD) via ArcGIS MapServer",
    },
    body: {
      county: "(optional) Florida coastal county name, e.g. 'Miami-Dade', 'Palm Beach', 'Monroe'",
      bbox: "(optional) Custom bounding box: { xmin, ymin, xmax, ymax } in WGS84 lat/lng",
      limit: "(optional) Max addresses to return, default 50",
    },
    available_counties: Object.keys(COASTAL_COUNTIES),
    example: { county: "Palm Beach", limit: 25 },
  });
}
