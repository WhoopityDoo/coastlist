// app/api/add-listing/route.js
// Full pipeline: Zillow URL → fetch → process → return complete property object
// Usage: POST /api/add-listing { url, waterType, waterFrontage?, featured? }

const WATER_TYPES = ["Ocean", "River", "Lake", "Pond"];

const STATE_MAP = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming",
};

const FEATURE_KEYWORDS = [
  "waterfront", "dock", "boat", "seawall", "bulkhead", "pool",
  "beach", "ocean", "river", "lake", "pond", "creek", "bay",
  "intracoastal", "deep water", "frontage", "marina", "pier",
  "kayak", "renovated", "new construction", "smart home",
  "elevator", "fireplace", "garage", "gated",
];

async function fetchAndParseZillow(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    throw new Error(`Zillow returned status ${res.status}`);
  }

  const html = await res.text();

  const property = {
    address: "", city: "", state: "", county: "", zipcode: "",
    price: 0, beds: 0, baths: 0, sqft: 0, lotAcres: 0, yearBuilt: 0,
    description: "", images: [], features: [], zpid: "",
    latitude: 0, longitude: 0,
  };

  // Extract zpid from URL
  const zpidMatch = url.match(/(\d+)_zpid/);
  if (zpidMatch) property.zpid = zpidMatch[1];

  // Meta tags
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/);
  const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/);

  if (ogTitle) {
    property.address = ogTitle[1].split("|")[0].trim();
  }

  // Price
  const pricePatterns = [
    /data-testid="price"[^>]*>\$?([\d,]+)/,
    /"price":\s*"?\$?([\d,]+)/,
    /property-card-price[^>]*>\$?([\d,]+)/,
    /<span[^>]*>\$([\d,]+)<\/span>/,
  ];
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match && parseInt(match[1].replace(/,/g, "")) > 10000) {
      property.price = parseInt(match[1].replace(/,/g, ""));
      break;
    }
  }
  if (!property.price) {
    const priceMeta = html.match(/"\$?([\d,]+)"\s*(?:,\s*"(?:beds|bd))/i);
    if (priceMeta) property.price = parseInt(priceMeta[1].replace(/,/g, ""));
  }

  // Beds
  const bedsMatch = html.match(/"bedrooms":\s*(\d+)/) || html.match(/(\d+)\s*(?:bd|bed|Bed)/) || html.match(/"beds":\s*(\d+)/);
  if (bedsMatch) property.beds = parseInt(bedsMatch[1]);

  // Baths
  const bathsMatch = html.match(/"bathrooms":\s*(\d+)/) || html.match(/(\d+)\s*(?:ba|bath|Bath)/) || html.match(/"baths":\s*(\d+)/);
  if (bathsMatch) property.baths = parseInt(bathsMatch[1]);

  // Sqft
  const sqftMatch = html.match(/"livingArea":\s*([\d,]+)/) || html.match(/([\d,]+)\s*sqft/) || html.match(/"area":\s*([\d,]+)/);
  if (sqftMatch) property.sqft = parseInt(sqftMatch[1].replace(/,/g, ""));

  // Year built
  const yearMatch = html.match(/"yearBuilt":\s*(\d{4})/) || html.match(/Built in\s*(\d{4})/) || html.match(/Year Built:\s*(\d{4})/i);
  if (yearMatch) property.yearBuilt = parseInt(yearMatch[1]);

  // Lot size
  const lotMatch = html.match(/"lotSize":\s*([\d.]+)/) || html.match(/([\d.]+)\s*Acres/i) || html.match(/"lotAreaValue":\s*([\d.]+)/);
  if (lotMatch) {
    property.lotAcres = parseFloat(lotMatch[1]);
    if (property.lotAcres > 1000) {
      property.lotAcres = parseFloat((property.lotAcres / 43560).toFixed(2));
    }
  }

  // Description
  const descPatterns = [
    /data-testid="description"[^>]*>(?:<[^>]*>)*([\s\S]*?)(?:<\/div|<\/section)/,
    /"description":\s*"((?:[^"\\]|\\.)*)"/,
    /"homeDescription":\s*"((?:[^"\\]|\\.)*)"/,
  ];
  for (const pattern of descPatterns) {
    const match = html.match(pattern);
    if (match && match[1].length > 50) {
      property.description = match[1]
        .replace(/<[^>]*>/g, "").replace(/\\n/g, "\n").replace(/\\r/g, "")
        .replace(/\\"/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">").replace(/&#39;/g, "'")
        .trim().substring(0, 1000);
      break;
    }
  }

  // Images
  const imgPattern = /https:\/\/photos\.zillowstatic\.com\/fp\/[a-f0-9]+-[a-z_]+\d*\.jpg/g;
  const allImages = [...new Set(html.match(imgPattern) || [])];
  const largeImages = allImages.filter(img => img.includes("cc_ft_960") || img.includes("cc_ft_768")).slice(0, 10);
  const medImages = allImages.filter(img => img.includes("cc_ft_576") || img.includes("p_e")).slice(0, 10);
  const otherImages = allImages.filter(img => !img.includes("cc_ft_960") && !img.includes("cc_ft_768") && !img.includes("cc_ft_576") && !img.includes("p_e")).slice(0, 5);
  property.images = [...largeImages, ...medImages, ...otherImages].slice(0, 8);
  if (ogImage && property.images.length === 0) property.images = [ogImage[1]];

  // Address parsing from URL
  const urlAddrMatch = url.match(/homedetails\/([^/]+)\//);
  if (urlAddrMatch) {
    const addrParts = urlAddrMatch[1].replace(/-/g, " ").split(" ");
    if (addrParts.length >= 3) {
      property.zipcode = addrParts[addrParts.length - 1];
      const stateCode = addrParts[addrParts.length - 2];
      property.state = STATE_MAP[stateCode.toUpperCase()] || stateCode;
    }
  }

  // Better address from meta
  if (ogTitle) {
    const fullAddr = ogTitle[1].split("|")[0].trim();
    const addrMatch = fullAddr.match(/^(.+),\s*(.+),\s*([A-Z]{2})\s*(\d{5})?/);
    if (addrMatch) {
      property.address = addrMatch[1].trim();
      property.city = addrMatch[2].trim();
      property.zipcode = addrMatch[4] || property.zipcode;
    } else {
      property.address = fullAddr;
    }
  }

  // Coordinates
  const latMatch = html.match(/"latitude":\s*([-\d.]+)/);
  const lngMatch = html.match(/"longitude":\s*([-\d.]+)/);
  if (latMatch) property.latitude = parseFloat(latMatch[1]);
  if (lngMatch) property.longitude = parseFloat(lngMatch[1]);

  // Features
  const descLower = (property.description || "").toLowerCase();
  property.features = FEATURE_KEYWORDS
    .filter(kw => descLower.includes(kw))
    .map(kw => kw.charAt(0).toUpperCase() + kw.slice(1))
    .slice(0, 8);

  return property;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, waterType, waterFrontage, featured } = body;

    // Validate inputs
    if (!url || !url.includes("zillow.com/homedetails")) {
      return Response.json(
        { error: "Provide a valid Zillow URL containing /homedetails/" },
        { status: 400 }
      );
    }

    if (!waterType || !WATER_TYPES.includes(waterType)) {
      return Response.json(
        { error: `waterType is required. Must be one of: ${WATER_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch and parse
    const propertyData = await fetchAndParseZillow(url);

    // Check we got meaningful data
    const hasData = propertyData.images.length > 0 || propertyData.price > 0 || propertyData.description.length > 0;
    if (!hasData) {
      return Response.json(
        { error: "Could not extract property data. Zillow may have blocked the request or the listing format changed.", partial: propertyData },
        { status: 422 }
      );
    }

    // Build the complete property object (same shape the site expects)
    const property = {
      ...propertyData,
      id: `CL-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      waterType,
      waterFrontage: Number(waterFrontage) || 0,
      featured: Boolean(featured),
      daysOnMarket: 1,
      image: propertyData.images?.[0] || "",
      addedAt: new Date().toISOString(),
      source: "api",
    };

    return Response.json({
      success: true,
      property,
      import_instructions: "POST this property to the site's admin panel via JSON import, or use the ?import_url= parameter to auto-load."
    });
  } catch (error) {
    return Response.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET endpoint for documentation / health check
export async function GET() {
  return Response.json({
    endpoint: "/api/add-listing",
    method: "POST",
    description: "Fetch a Zillow listing and return a complete CoastList property object",
    body: {
      url: "(required) Zillow listing URL containing /homedetails/",
      waterType: "(required) One of: Ocean, River, Lake, Pond",
      waterFrontage: "(optional) Water frontage in feet",
      featured: "(optional) Boolean — mark as featured listing",
    },
    example: {
      url: "https://www.zillow.com/homedetails/123-Main-St-City-ST-12345/99999_zpid/",
      waterType: "Ocean",
      waterFrontage: 150,
      featured: true,
    },
  });
}
