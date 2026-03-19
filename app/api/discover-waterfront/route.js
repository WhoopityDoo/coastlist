// app/api/discover-waterfront/route.js
// Discovers waterfront properties using OpenFEMA flood insurance data
// VE zones = Coastal High Hazard = properties ON the waterfront
// Free API, no key required, lat/lng + zip for every insured property

const FEMA_API = "https://www.fema.gov/api/open/v2/FimaNfipPolicies";

// States we support
const SUPPORTED_STATES = [
  "FL", "CA", "NC", "SC", "MA", "ME", "OR", "WA", "HI", "TX",
  "NJ", "CT", "VA", "MD", "GA", "NY", "RI", "NH", "DE", "AL", "MS", "LA",
];

// State abbreviation to full name
const STATE_NAMES = {
  FL: "Florida", CA: "California", NC: "North Carolina", SC: "South Carolina",
  MA: "Massachusetts", ME: "Maine", OR: "Oregon", WA: "Washington",
  HI: "Hawaii", TX: "Texas", NJ: "New Jersey", CT: "Connecticut",
  VA: "Virginia", MD: "Maryland", GA: "Georgia", NY: "New York",
  RI: "Rhode Island", NH: "New Hampshire", DE: "Delaware",
  AL: "Alabama", MS: "Mississippi", LA: "Louisiana",
};

// Flood zones and what they mean for water proximity
// VE, V, V1-V30 = Coastal high hazard (waves), AE near coast = flood-prone near water
// A, AE = General flood zones (rivers, lakes)
const COASTAL_ZONES = ["VE", "V", "V1", "V2", "V3", "V4", "V5"];
const RIVER_LAKE_ZONES = ["AE", "A", "AO", "AH"];

function classifyWaterType(floodZone, state) {
  // VE/V zones are always coastal
  if (COASTAL_ZONES.some(z => floodZone.startsWith(z))) {
    return "Ocean";
  }
  // A/AE zones could be river or lake - rough guess based on state
  const lakeyStates = ["MI", "MN", "WI", "NY", "ME", "NH", "VT"];
  if (lakeyStates.includes(state)) return "Lake";
  return "River";
}

async function queryFEMA(states, floodZones, minCoverage, limit, skip) {
  // Build OData filter
  const stateFilter = states.map(s => `propertyState eq '${s}'`).join(" or ");
  const zoneFilter = floodZones.map(z => `ratedFloodZone eq '${z}'`).join(" or ");

  let filter = `(${stateFilter}) and (${zoneFilter}) and occupancyType eq 1`;
  if (minCoverage > 0) {
    filter += ` and totalBuildingInsuranceCoverage gt ${minCoverage}`;
  }

  const params = new URLSearchParams({
    $filter: filter,
    $top: String(limit),
    $skip: String(skip),
    $select: "reportedCity,reportedZipCode,propertyState,ratedFloodZone,latitude,longitude,totalBuildingInsuranceCoverage,originalConstructionDate,numberOfFloorsInInsuredBuilding",
    $orderby: "totalBuildingInsuranceCoverage desc",
  });

  const res = await fetch(`${FEMA_API}?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FEMA API returned ${res.status}: ${text.substring(0, 200)}`);
  }

  return res.json();
}

// Deduplicate by rounding lat/lng to avoid near-duplicates
function deduplicateByLocation(properties) {
  const seen = new Set();
  return properties.filter(p => {
    // Round to ~100m precision to group nearby properties
    const key = `${Math.round(p.latitude * 100) / 100},${Math.round(p.longitude * 100) / 100}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      states = ["FL"],
      floodZones = COASTAL_ZONES,
      minCoverage = 100000,
      limit = 50,
      skip = 0,
      includeRiverLake = false,
    } = body;

    // Validate states
    const validStates = states.filter(s => SUPPORTED_STATES.includes(s.toUpperCase())).map(s => s.toUpperCase());
    if (validStates.length === 0) {
      return Response.json({
        error: `No valid states provided. Supported: ${SUPPORTED_STATES.join(", ")}`,
      }, { status: 400 });
    }

    // Combine flood zones if requested
    const zones = includeRiverLake ? [...COASTAL_ZONES, ...RIVER_LAKE_ZONES] : floodZones;

    const data = await queryFEMA(validStates, zones, minCoverage, Math.min(limit, 1000), skip);
    const policies = data.FimaNfipPolicies || [];

    // Transform into useful address objects
    const properties = policies.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
      zipCode: p.reportedZipCode,
      city: p.reportedCity !== "Currently Unavailable" ? p.reportedCity : "",
      state: STATE_NAMES[p.propertyState] || p.propertyState,
      stateCode: p.propertyState,
      floodZone: p.ratedFloodZone,
      waterType: classifyWaterType(p.ratedFloodZone, p.propertyState),
      insuranceCoverage: p.totalBuildingInsuranceCoverage,
      yearBuilt: p.originalConstructionDate ? new Date(p.originalConstructionDate).getFullYear() : null,
      floors: p.numberOfFloorsInInsuredBuilding,
    })).filter(p => p.latitude && p.longitude);

    // Deduplicate nearby properties
    const unique = deduplicateByLocation(properties);

    return Response.json({
      success: true,
      source: "OpenFEMA NFIP Policies (VE/V flood zones = confirmed coastal waterfront)",
      statesQueried: validStates,
      floodZonesQueried: zones,
      totalReturned: policies.length,
      uniqueLocations: unique.length,
      properties: unique.slice(0, limit),
      next: {
        skip: skip + policies.length,
        note: "Pass this 'skip' value to get the next page of results",
      },
    });

  } catch (error) {
    return Response.json({ error: `Discovery failed: ${error.message}` }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    endpoint: "/api/discover-waterfront",
    method: "POST",
    description: "Discover confirmed waterfront properties using FEMA flood insurance data. VE/V zones are coastal high-hazard areas — these properties are on the water.",
    source: "OpenFEMA NFIP Policies API (free, no key required)",
    body: {
      states: "(optional) Array of state codes, default ['FL']. Supported: " + SUPPORTED_STATES.join(", "),
      floodZones: "(optional) Array of flood zone codes, default VE/V zones (coastal)",
      minCoverage: "(optional) Minimum building insurance coverage in $, default 100000. Higher = more valuable properties.",
      limit: "(optional) Max results, default 50, max 1000",
      skip: "(optional) Pagination offset, default 0",
      includeRiverLake: "(optional) Boolean, also include A/AE zones (rivers/lakes), default false",
    },
    examples: {
      coastal_florida: { states: ["FL"], limit: 25 },
      multi_state_mix: { states: ["FL", "NC", "SC", "CA", "MA"], limit: 50 },
      high_value_only: { states: ["FL"], minCoverage: 300000, limit: 20 },
      rivers_and_lakes: { states: ["FL", "NC"], includeRiverLake: true, limit: 30 },
    },
  });
}
