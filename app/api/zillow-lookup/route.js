// app/api/zillow-lookup/route.js
// Looks up an address on Zillow via the RapidAPI Zillow Scraper API
// Returns a Zillow listing URL and property data if found
//
// Requires: RAPIDAPI_KEY environment variable set in Vercel

const RAPIDAPI_HOST = process.env.ZILLOW_RAPIDAPI_HOST || "zillow56.p.rapidapi.com";

async function searchZillow(address, rapidApiKey) {
  // Try the search endpoint to find the property by address
  const searchUrl = `https://${RAPIDAPI_HOST}/search?location=${encodeURIComponent(address)}`;

  const res = await fetch(searchUrl, {
    headers: {
      "X-RapidAPI-Key": rapidApiKey,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
  });

  if (!res.ok) {
    throw new Error(`Zillow search returned ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

async function getPropertyByZpid(zpid, rapidApiKey) {
  const url = `https://${RAPIDAPI_HOST}/property?zpid=${zpid}`;

  const res = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": rapidApiKey,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
  });

  if (!res.ok) {
    throw new Error(`Zillow property lookup returned ${res.status}`);
  }

  return res.json();
}

function extractListingData(zillowData) {
  // Normalize Zillow response into CoastList format
  // Different Zillow APIs return slightly different shapes
  const d = zillowData || {};

  return {
    address: d.streetAddress || d.address || "",
    city: d.city || "",
    state: d.state || "",
    zipcode: d.zipcode || d.zip || "",
    price: d.price || d.zestimate || d.rentZestimate || 0,
    beds: d.bedrooms || d.beds || 0,
    baths: d.bathrooms || d.baths || 0,
    sqft: d.livingArea || d.livingAreaValue || d.sqft || 0,
    lotAcres: d.lotSize ? parseFloat((d.lotSize / 43560).toFixed(2)) : (d.lotAreaValue || 0),
    yearBuilt: d.yearBuilt || 0,
    description: (d.description || d.homeDescription || "").substring(0, 1000),
    images: (d.photos || d.images || d.responsivePhotos || [])
      .map(p => typeof p === "string" ? p : (p?.mixedSources?.jpeg?.[0]?.url || p?.url || p?.href || ""))
      .filter(Boolean)
      .slice(0, 8),
    zpid: String(d.zpid || ""),
    latitude: d.latitude || d.lat || 0,
    longitude: d.longitude || d.lng || d.long || 0,
    zillowUrl: d.url || (d.zpid ? `https://www.zillow.com/homedetails/${d.zpid}_zpid/` : ""),
    homeStatus: d.homeStatus || d.status || "",
    homeType: d.homeType || d.propertyType || "",
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { address, zpid, rapidApiKey } = body;

    // API key from request body OR environment variable
    const apiKey = rapidApiKey || process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return Response.json({
        error: "No RapidAPI key provided. Either pass 'rapidApiKey' in the request body or set RAPIDAPI_KEY in your Vercel environment variables.",
        setup_instructions: {
          step1: "Go to rapidapi.com and sign up (free)",
          step2: "Subscribe to a Zillow scraper API (search 'zillow' on RapidAPI)",
          step3: "Copy your API key from the RapidAPI dashboard",
          step4: "In Vercel: Settings → Environment Variables → Add RAPIDAPI_KEY",
          step5: "Optionally set ZILLOW_RAPIDAPI_HOST to match your specific API's host",
        },
      }, { status: 400 });
    }

    if (!address && !zpid) {
      return Response.json({ error: "Provide 'address' (full street address) or 'zpid' (Zillow property ID)" }, { status: 400 });
    }

    let listing;

    if (zpid) {
      // Direct lookup by zpid
      const data = await getPropertyByZpid(zpid, apiKey);
      listing = extractListingData(data);
    } else {
      // Search by address
      const searchResults = await searchZillow(address, apiKey);

      // Handle different response formats
      let results = [];
      if (Array.isArray(searchResults)) {
        results = searchResults;
      } else if (searchResults?.results) {
        results = searchResults.results;
      } else if (searchResults?.props) {
        results = searchResults.props;
      } else if (searchResults?.searchResults?.listResults) {
        results = searchResults.searchResults.listResults;
      } else if (searchResults?.zpid) {
        // Direct match
        listing = extractListingData(searchResults);
      }

      if (!listing && results.length > 0) {
        // Take the first result
        const firstResult = results[0];
        if (firstResult.zpid) {
          // Get full details
          try {
            const fullData = await getPropertyByZpid(firstResult.zpid, apiKey);
            listing = extractListingData(fullData);
          } catch {
            listing = extractListingData(firstResult);
          }
        } else {
          listing = extractListingData(firstResult);
        }
      }
    }

    if (!listing || (!listing.address && !listing.zpid)) {
      return Response.json({
        success: false,
        error: "No listing found for this address on Zillow",
        searchedFor: address || `zpid:${zpid}`,
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      listing,
    });

  } catch (error) {
    return Response.json({ error: `Zillow lookup failed: ${error.message}` }, { status: 500 });
  }
}

// Batch lookup: multiple addresses at once
export async function PUT(request) {
  try {
    const body = await request.json();
    const { addresses, rapidApiKey } = body;

    const apiKey = rapidApiKey || process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return Response.json({ error: "No RapidAPI key. See GET /api/zillow-lookup for setup." }, { status: 400 });
    }

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return Response.json({ error: "Provide 'addresses' array of { address, waterType } objects" }, { status: 400 });
    }

    if (addresses.length > 20) {
      return Response.json({ error: "Max 20 addresses per batch" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < addresses.length; i++) {
      const entry = addresses[i];
      const addr = typeof entry === "string" ? entry : entry.address;
      const waterType = entry.waterType || "Ocean";

      try {
        const searchResults = await searchZillow(addr, apiKey);
        let match = null;

        if (Array.isArray(searchResults) && searchResults.length > 0) {
          match = searchResults[0];
        } else if (searchResults?.results?.length > 0) {
          match = searchResults.results[0];
        } else if (searchResults?.zpid) {
          match = searchResults;
        }

        if (match) {
          const listing = extractListingData(match);
          results.push({
            ...listing,
            id: `CL-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            waterType,
            waterFrontage: 0,
            featured: false,
            daysOnMarket: 1,
            image: listing.images?.[0] || "",
            addedAt: new Date().toISOString(),
            source: "discovery-agent",
          });
        } else {
          errors.push({ address: addr, error: "Not found on Zillow" });
        }
      } catch (e) {
        errors.push({ address: addr, error: e.message });
      }

      // Rate limit: wait between requests
      if (i < addresses.length - 1) {
        await new Promise(r => setTimeout(r, 1200));
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

export async function GET() {
  return Response.json({
    endpoint: "/api/zillow-lookup",
    methods: {
      POST: "Look up a single address or zpid on Zillow",
      PUT: "Batch look up multiple addresses on Zillow",
    },
    requires: "RapidAPI key (set as RAPIDAPI_KEY env var or pass in request body)",
    setup: {
      step1: "Sign up at rapidapi.com (free tier available)",
      step2: "Subscribe to a Zillow API (search 'zillow' in the marketplace)",
      step3: "Note your API key and the API host (e.g. zillow56.p.rapidapi.com)",
      step4: "In Vercel dashboard: Settings → Environment Variables → add RAPIDAPI_KEY and optionally ZILLOW_RAPIDAPI_HOST",
    },
    single_example: {
      method: "POST",
      body: { address: "123 Ocean Drive, Miami Beach, FL 33139" },
    },
    batch_example: {
      method: "PUT",
      body: {
        addresses: [
          { address: "123 Ocean Drive, Miami Beach, FL", waterType: "Ocean" },
          { address: "456 Lake Rd, Palm Beach, FL", waterType: "Lake" },
        ],
      },
    },
  });
}
