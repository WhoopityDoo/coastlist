// app/api/batch-add/route.js
// Batch process multiple Zillow URLs into CoastList property objects
// Usage: POST /api/batch-add { listings: [{ url, waterType, waterFrontage?, featured? }, ...] }

export async function POST(request) {
  try {
    const body = await request.json();
    const { listings } = body;

    if (!Array.isArray(listings) || listings.length === 0) {
      return Response.json(
        { error: "Provide a 'listings' array with at least one entry. Each entry needs: { url, waterType }" },
        { status: 400 }
      );
    }

    if (listings.length > 20) {
      return Response.json(
        { error: "Maximum 20 listings per batch to avoid timeouts. Split into multiple requests." },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Process sequentially to avoid overwhelming Zillow
    for (let i = 0; i < listings.length; i++) {
      const entry = listings[i];
      try {
        // Call our own add-listing endpoint logic
        const origin = request.headers.get("origin") || request.headers.get("host") || "localhost:3000";
        const protocol = origin.includes("localhost") ? "http" : "https";
        const baseUrl = origin.startsWith("http") ? origin : `${protocol}://${origin}`;

        const res = await fetch(`${baseUrl}/api/add-listing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });

        const data = await res.json();

        if (data.success) {
          results.push(data.property);
        } else {
          errors.push({ index: i, url: entry.url, error: data.error });
        }
      } catch (e) {
        errors.push({ index: i, url: entry.url, error: e.message });
      }

      // Small delay between requests to be respectful
      if (i < listings.length - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    return Response.json({
      success: true,
      processed: results.length,
      failed: errors.length,
      properties: results,
      errors: errors.length > 0 ? errors : undefined,
      import_instructions: "Copy the 'properties' array and use the admin panel's JSON Import feature, or serve this JSON at a URL and use ?import_url= to auto-load.",
    });
  } catch (error) {
    return Response.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    endpoint: "/api/batch-add",
    method: "POST",
    description: "Batch process multiple Zillow URLs into CoastList property objects",
    body: {
      listings: [
        {
          url: "(required) Zillow listing URL",
          waterType: "(required) Ocean | River | Lake | Pond",
          waterFrontage: "(optional) feet",
          featured: "(optional) boolean",
        },
      ],
    },
    limits: { maxPerBatch: 20 },
    example: {
      listings: [
        { url: "https://www.zillow.com/homedetails/123-Main-St/99999_zpid/", waterType: "Ocean", featured: true },
        { url: "https://www.zillow.com/homedetails/456-Lake-Rd/88888_zpid/", waterType: "Lake" },
      ],
    },
  });
}
