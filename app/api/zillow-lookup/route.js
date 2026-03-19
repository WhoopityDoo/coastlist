// app/api/zillow-lookup/route.js
// Looks up properties on Zillow via the "Zillow Scraper API" by PullAPI on RapidAPI
// Host: zillow-scraper-api.p.rapidapi.com
//
// Endpoints used:
//   GET /zillow/search?location=...  → search by city/zip/address
//   GET /zillow/property/{zpid}      → full property details by zpid
//   GET /zillow/photos/{zpid}        → property photos by zpid
//
// Requires: RAPIDAPI_KEY environment variable set in Vercel

const API_HOST = "zillow-scraper-api.p.rapidapi.com";
const BASE_URL = `https://${API_HOST}`;

function getApiKey(requestBody) {
  return requestBody?.rapidApiKey || process.env.RAPIDAPI_KEY;
}

function rapidHeaders(apiKey) {
  return {
    "Content-Type": "application/json",
    "X-RapidAPI-Host": API_HOST,
    "X-RapidAPI-Key": apiKey,
  };
}

// Search listings by location (city, zip, or address)
async function searchListings(location, apiKey) {
  const params = new URLSearchParams({
    location,
    listing_type: "for_sale",
    home_type: "house",
    page: "1",
  });

  const res = await fetch(`${BASE_URL}/zillow/search?${params}`, {
    headers: rapidHeaders(apiKey),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search returned ${res.status}: ${text.substring(0, 200)}`);
  }

  return res.json();
}

// Get full property details by zpid
async function getPropertyDetails(zpid, apiKey) {
  const res = await fetch(`${BASE_URL}/zillow/property/${zpid}`, {
    headers: rapidHeaders(apiKey),
  });

  if (!res.ok) {
    throw new Error(`Property details returned ${res.status}`);
  }

  return res.json();
}

// Get property photos by zpid
async function getPropertyPhotos(zpid, apiKey) {
  const res = await fetch(`${BASE_URL}/zillow/photos/${zpid}`, {
    headers: rapidHeaders(apiKey),
  });

  if (!res.ok) return { photos: [] };
  return res.json();
}

// Normalize a search result listing into CoastList format
// Zillow Scraper API returns: zpid, address, city, state, zipcode, price,
// bedrooms, bathrooms, living_area_sqft, lot_size_sqft, home_type,
// listing_status, days_on_zillow, image_url, detail_url
function normalizeSearchResult(item) {
  return {
    zpid: String(item.zpid || item.id || ""),
    address: item.address || item.streetAddress || "",
    city: item.city || "",
    state: item.state || "",
    zipcode: item.zipcode || item.zipCode || item.zip || "",
    price: item.price || item.unformattedPrice || 0,
    beds: item.bedrooms || item.beds || 0,
    baths: item.bathrooms || item.baths || 0,
    sqft: item.living_area_sqft || item.sqft || item.livingArea || 0,
    lotAcres: item.lot_size_sqft ? parseFloat((item.lot_size_sqft / 43560).toFixed(2)) : 0,
    yearBuilt: item.yearBuilt || item.year_built || 0,
    description: (item.description || "").substring(0, 1000),
    images: [item.image_url || item.imgSrc || item.image || ""].filter(Boolean),
    latitude: item.latitude || item.lat || 0,
    longitude: item.longitude || item.lng || 0,
    zillowUrl: item.detail_url || item.detailUrl || (item.zpid ? `https://www.zillow.com/homedetails/${item.zpid}_zpid/` : ""),
    homeStatus: item.listing_status || item.listingStatus || "",
    homeType: item.home_type || item.homeType || "",
    daysOnZillow: item.days_on_zillow || item.daysOnZillow || 0,
  };
}

// Normalize full property details into CoastList format
function normalizePropertyDetails(d) {
  const photos = (d.photos || d.images || d.responsivePhotos || [])
    .map(p => {
      if (typeof p === "string") return p;
      if (p?.mixedSources?.jpeg) return p.mixedSources.jpeg.sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.url || "";
      return p?.url || p?.href || p?.src || "";
    })
    .filter(Boolean)
    .slice(0, 10);

  return {
    zpid: String(d.zpid || ""),
    address: d.streetAddress || d.address || "",
    city: d.city || "",
    state: d.state || "",
    zipcode: d.zipcode || d.zip || "",
    price: d.price || d.zestimate || 0,
    beds: d.bedrooms || d.beds || 0,
    baths: d.bathrooms || d.baths || 0,
    sqft: d.livingArea || d.livingAreaValue || d.sqft || 0,
    lotAcres: d.lotSize ? parseFloat((d.lotSize / 43560).toFixed(2)) : (d.lotAreaValue || 0),
    yearBuilt: d.yearBuilt || 0,
    description: (d.description || d.homeDescription || "").substring(0, 1000),
    images: photos,
    latitude: d.latitude || 0,
    longitude: d.longitude || 0,
    zillowUrl: d.url || `https://www.zillow.com/homedetails/${d.zpid}_zpid/`,
    homeStatus: d.homeStatus || "",
    homeType: d.homeType || d.propertyType || "",
    daysOnZillow: d.daysOnZillow || 0,
    features: (d.facts || d.features || []).map(f => typeof f === "string" ? f : f?.factLabel || f?.name || "").filter(Boolean).slice(0, 10),
  };
}

// ─── POST: Single address/zpid lookup ───
export async function POST(request) {
  try {
    const body = await request.json();
    const { address, zpid, rapidApiKey } = body;

    const apiKey = getApiKey(body);
    if (!apiKey) {
      return Response.json({
        error: "No RapidAPI key. Set RAPIDAPI_KEY in Vercel env vars or pass 'rapidApiKey' in body.",
        setup: "Subscribe to 'Zillow Scraper API' by PullAPI on RapidAPI (free tier available), then add RAPIDAPI_KEY to Vercel Settings → Environment Variables.",
      }, { status: 400 });
    }

    if (!address && !zpid) {
      return Response.json({ error: "Provide 'address' (city/zip/address) or 'zpid' (Zillow property ID)" }, { status: 400 });
    }

    let listing;

    if (zpid) {
      const data = await getPropertyDetails(zpid, apiKey);
      listing = normalizePropertyDetails(data);
      // Also get photos
      try {
        const photoData = await getPropertyPhotos(zpid, apiKey);
        if (photoData.photos?.length) {
          listing.images = photoData.photos.map(p => p.url || p.src || p).filter(Boolean).slice(0, 10);
        }
      } catch {}
    } else {
      const searchData = await searchListings(address, apiKey);
      const results = searchData?.data?.listings || searchData?.listings || searchData?.results || (Array.isArray(searchData) ? searchData : []);

      if (results.length === 0) {
        return Response.json({
          success: false,
          error: "No listings found for this location",
          searchedFor: address,
          debug: {
            apiSuccess: searchData?.success,
            hasData: !!searchData?.data,
            dataKeys: searchData?.data ? Object.keys(searchData.data) : null,
            topLevelKeys: Object.keys(searchData || {}),
            apiError: searchData?.error,
            creditsUsed: searchData?.credits_used,
            hasApiKey: !!apiKey,
            apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : null,
          }
        }, { status: 404 });
      }

      // Take best match
      listing = normalizeSearchResult(results[0]);

      // If we got a zpid, fetch full details
      if (listing.zpid) {
        try {
          const details = await getPropertyDetails(listing.zpid, apiKey);
          listing = normalizePropertyDetails(details);
        } catch {}
      }
    }

    if (!listing || (!listing.address && !listing.zpid)) {
      return Response.json({ success: false, error: "No listing found", searchedFor: address || `zpid:${zpid}` }, { status: 404 });
    }

    return Response.json({ success: true, listing });

  } catch (error) {
    return Response.json({ error: `Zillow lookup failed: ${error.message}` }, { status: 500 });
  }
}

// ─── PUT: Batch lookup (multiple addresses) ───
export async function PUT(request) {
  try {
    const body = await request.json();
    const { addresses, rapidApiKey } = body;

    const apiKey = getApiKey(body);
    if (!apiKey) {
      return Response.json({ error: "No RapidAPI key. See GET /api/zillow-lookup for setup." }, { status: 400 });
    }

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return Response.json({ error: "Provide 'addresses' array of { address, waterType } objects" }, { status: 400 });
    }

    if (addresses.length > 15) {
      return Response.json({ error: "Max 15 per batch on free tier to stay within rate limits" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < addresses.length; i++) {
      const entry = addresses[i];
      const addr = typeof entry === "string" ? entry : entry.address;
      const waterType = entry.waterType || "Ocean";

      try {
        const searchData = await searchListings(addr, apiKey);
        const listings = searchData?.data?.listings || searchData?.listings || searchData?.results || (Array.isArray(searchData) ? searchData : []);

        if (listings.length > 0) {
          const listing = normalizeSearchResult(listings[0]);
          results.push({
            ...listing,
            id: `CL-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            waterType,
            waterFrontage: 0,
            featured: false,
            daysOnMarket: listing.daysOnZillow || 1,
            image: listing.images?.[0] || "",
            addedAt: new Date().toISOString(),
            source: "discovery-agent",
          });
        } else {
          errors.push({ address: addr, error: "No listings found" });
        }
      } catch (e) {
        errors.push({ address: addr, error: e.message });
      }

      // Rate limit: 1.5s between requests
      if (i < addresses.length - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    return Response.json({
      success: true,
      found: results.length,
      failed: errors.length,
      properties: results,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    return Response.json({ error: `Batch lookup failed: ${error.message}` }, { status: 500 });
  }
}

// ─── GET: Documentation ───
export async function GET() {
  return Response.json({
    endpoint: "/api/zillow-lookup",
    api: "Zillow Scraper API by PullAPI (RapidAPI)",
    host: API_HOST,
    methods: {
      POST: "Look up a single address or zpid",
      PUT: "Batch look up multiple addresses (max 15)",
    },
    requires: "RAPIDAPI_KEY env var (subscribe at rapidapi.com/pullapi-pullapi-default/api/zillow-scraper-api)",
    post_example: { address: "33037" },
    put_example: {
      addresses: [
        { address: "34957", waterType: "Ocean" },
        { address: "Key Largo, FL", waterType: "Ocean" },
      ],
    },
  });
}
