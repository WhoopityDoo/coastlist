// app/api/fetch-listing/route.js
// Server-side Zillow listing scraper for CoastList admin
// Fetches public property data from a Zillow URL

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes("zillow.com/homedetails")) {
      return Response.json(
        { error: "Please provide a valid Zillow listing URL (must contain /homedetails/)" },
        { status: 400 }
      );
    }

    // Fetch the Zillow page server-side (no CORS issues)
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      return Response.json(
        { error: `Failed to fetch listing (status ${res.status})` },
        { status: 502 }
      );
    }

    const html = await res.text();

    // ─── Parse the HTML for property data ───

    // Try to extract JSON-LD structured data first (most reliable)
    const jsonLdMatch = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    );
    let structuredData = null;
    if (jsonLdMatch) {
      for (const match of jsonLdMatch) {
        try {
          const json = match
            .replace(/<script type="application\/ld\+json">/, "")
            .replace(/<\/script>/, "");
          const parsed = JSON.parse(json);
          if (
            parsed["@type"] === "SingleFamilyResidence" ||
            parsed["@type"] === "Residence" ||
            parsed["@type"] === "Product" ||
            parsed.floorSize ||
            parsed.numberOfRooms
          ) {
            structuredData = parsed;
            break;
          }
        } catch (e) {}
      }
    }

    // Extract from __NEXT_DATA__ or inline scripts
    let nextData = null;
    const nextDataMatch = html.match(
      /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
    );
    if (nextDataMatch) {
      try {
        nextData = JSON.parse(nextDataMatch[1]);
      } catch (e) {}
    }

    // Also try to find the apiCache or initial Redux state
    let apiCache = null;
    const cacheMatch = html.match(
      /"apiCache":\s*(".*?")\s*[,}]/
    );
    if (cacheMatch) {
      try {
        const decoded = JSON.parse(cacheMatch[1]);
        apiCache = JSON.parse(decoded);
      } catch (e) {}
    }

    // ─── Extract property details using multiple strategies ───
    const property = {
      address: "",
      city: "",
      state: "",
      county: "",
      zipcode: "",
      price: 0,
      beds: 0,
      baths: 0,
      sqft: 0,
      lotAcres: 0,
      yearBuilt: 0,
      description: "",
      images: [],
      features: [],
      zpid: "",
      latitude: 0,
      longitude: 0,
    };

    // Extract zpid from URL
    const zpidMatch = url.match(/(\d+)_zpid/);
    if (zpidMatch) property.zpid = zpidMatch[1];

    // ─── Strategy 1: Parse from meta tags (very reliable) ───
    const ogTitle = html.match(
      /<meta\s+property="og:title"\s+content="([^"]*)"/ 
    );
    const ogDesc = html.match(
      /<meta\s+property="og:description"\s+content="([^"]*)"/ 
    );
    const ogImage = html.match(
      /<meta\s+property="og:image"\s+content="([^"]*)"/
    );

    if (ogTitle) {
      // Title format is usually "ADDRESS | Zillow" or "ADDRESS | MLS #xxx | Zillow"
      const titleParts = ogTitle[1].split("|")[0].trim();
      property.address = titleParts;
    }

    // ─── Strategy 2: Parse from HTML content ───
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

    // If price not found from patterns, try from text
    if (!property.price) {
      const priceMeta = html.match(/"\$?([\d,]+)"\s*(?:,\s*"(?:beds|bd))/i);
      if (priceMeta) {
        property.price = parseInt(priceMeta[1].replace(/,/g, ""));
      }
    }

    // Beds
    const bedsMatch =
      html.match(/"bedrooms":\s*(\d+)/) ||
      html.match(/(\d+)\s*(?:bd|bed|Bed)/) ||
      html.match(/"beds":\s*(\d+)/);
    if (bedsMatch) property.beds = parseInt(bedsMatch[1]);

    // Baths
    const bathsMatch =
      html.match(/"bathrooms":\s*(\d+)/) ||
      html.match(/(\d+)\s*(?:ba|bath|Bath)/) ||
      html.match(/"baths":\s*(\d+)/);
    if (bathsMatch) property.baths = parseInt(bathsMatch[1]);

    // Sqft
    const sqftMatch =
      html.match(/"livingArea":\s*([\d,]+)/) ||
      html.match(/([\d,]+)\s*sqft/) ||
      html.match(/"area":\s*([\d,]+)/);
    if (sqftMatch) property.sqft = parseInt(sqftMatch[1].replace(/,/g, ""));

    // Year built
    const yearMatch =
      html.match(/"yearBuilt":\s*(\d{4})/) ||
      html.match(/Built in\s*(\d{4})/) ||
      html.match(/Year Built:\s*(\d{4})/i);
    if (yearMatch) property.yearBuilt = parseInt(yearMatch[1]);

    // Lot size
    const lotMatch =
      html.match(/"lotSize":\s*([\d.]+)/) ||
      html.match(/([\d.]+)\s*Acres/i) ||
      html.match(/"lotAreaValue":\s*([\d.]+)/);
    if (lotMatch) property.lotAcres = parseFloat(lotMatch[1]);

    // If lot in sqft, convert
    if (property.lotAcres > 1000) {
      property.lotAcres = parseFloat((property.lotAcres / 43560).toFixed(2));
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
          .replace(/<[^>]*>/g, "")
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "")
          .replace(/\\"/g, '"')
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&#39;/g, "'")
          .trim()
          .substring(0, 1000);
        break;
      }
    }

    // ─── Images (most important!) ───
    // Find all Zillow photo URLs
    const imgPattern = /https:\/\/photos\.zillowstatic\.com\/fp\/[a-f0-9]+-[a-z_]+\d*\.jpg/g;
    const allImages = [...new Set(html.match(imgPattern) || [])];
    
    // Prefer larger images (cc_ft_960, cc_ft_768, p_e)
    const largeImages = allImages
      .filter((img) => img.includes("cc_ft_960") || img.includes("cc_ft_768"))
      .slice(0, 10);
    const medImages = allImages
      .filter((img) => img.includes("cc_ft_576") || img.includes("p_e"))
      .slice(0, 10);
    const otherImages = allImages
      .filter(
        (img) =>
          !img.includes("cc_ft_960") &&
          !img.includes("cc_ft_768") &&
          !img.includes("cc_ft_576") &&
          !img.includes("p_e")
      )
      .slice(0, 5);

    property.images = [...largeImages, ...medImages, ...otherImages].slice(0, 8);

    // Also check for og:image
    if (ogImage && property.images.length === 0) {
      property.images = [ogImage[1]];
    }

    // ─── Address parsing ───
    // Try to parse full address from the title/URL
    const urlAddrMatch = url.match(
      /homedetails\/([^/]+)\//
    );
    if (urlAddrMatch) {
      const addrParts = urlAddrMatch[1].replace(/-/g, " ").split(" ");
      // Last parts are usually state and zip
      if (addrParts.length >= 3) {
        const zip = addrParts[addrParts.length - 1];
        const stateCode = addrParts[addrParts.length - 2];
        const city = addrParts[addrParts.length - 3];
        property.zipcode = zip;

        // State code to full name
        const stateMap = {
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
        property.state = stateMap[stateCode.toUpperCase()] || stateCode;
      }
    }

    // Better address from meta
    if (ogTitle) {
      const fullAddr = ogTitle[1].split("|")[0].trim();
      // Parse: "123 Street, City, ST 12345"
      const addrMatch = fullAddr.match(
        /^(.+),\s*(.+),\s*([A-Z]{2})\s*(\d{5})?/
      );
      if (addrMatch) {
        property.address = addrMatch[1].trim();
        property.city = addrMatch[2].trim();
        property.zipcode = addrMatch[4] || property.zipcode;
      } else {
        property.address = fullAddr;
      }
    }

    // ─── Coordinates ───
    const latMatch = html.match(/"latitude":\s*([-\d.]+)/);
    const lngMatch = html.match(/"longitude":\s*([-\d.]+)/);
    if (latMatch) property.latitude = parseFloat(latMatch[1]);
    if (lngMatch) property.longitude = parseFloat(lngMatch[1]);

    // ─── Features ───
    // Try to extract key features
    const featureKeywords = [
      "waterfront", "dock", "boat", "seawall", "bulkhead", "pool",
      "beach", "ocean", "river", "lake", "pond", "creek", "bay",
      "intracoastal", "deep water", "frontage", "marina", "pier",
      "kayak", "renovated", "new construction", "smart home",
      "elevator", "fireplace", "garage", "gated",
    ];
    const descLower = (property.description || "").toLowerCase();
    property.features = featureKeywords
      .filter((kw) => descLower.includes(kw))
      .map((kw) => kw.charAt(0).toUpperCase() + kw.slice(1))
      .slice(0, 8);

    // Validate we got meaningful data
    const hasData =
      property.images.length > 0 ||
      property.price > 0 ||
      property.description.length > 0;

    if (!hasData) {
      return Response.json(
        {
          error:
            "Could not extract property data. Zillow may have blocked the request or the listing format changed. Try again in a minute.",
          partial: property,
        },
        { status: 422 }
      );
    }

    return Response.json({ success: true, property });
  } catch (error) {
    return Response.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
