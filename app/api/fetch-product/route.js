import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  try {
    // Fetch the retailer page HTML
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch URL (${res.status})` }, { status: 502 });
    }

    const html = await res.text();

    // Extract product data from common meta tags and structured data
    const product = {};

    // Try JSON-LD structured data first (most retailers use this)
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const match of jsonLdMatch) {
        try {
          const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
          const data = JSON.parse(jsonContent);
          const productData = data['@type'] === 'Product' ? data :
            Array.isArray(data['@graph']) ? data['@graph'].find(i => i['@type'] === 'Product') : null;

          if (productData) {
            product.name = productData.name || '';
            product.description = productData.description || '';
            product.brand = typeof productData.brand === 'object' ? productData.brand.name : productData.brand || '';

            if (productData.offers) {
              const offer = Array.isArray(productData.offers) ? productData.offers[0] : productData.offers;
              product.price = parseFloat(offer.price) || '';
            }

            if (productData.image) {
              product.images = Array.isArray(productData.image)
                ? productData.image.slice(0, 6)
                : [productData.image];
            }
            break;
          }
        } catch (e) { /* skip malformed JSON-LD */ }
      }
    }

    // Fallback to Open Graph / meta tags
    if (!product.name) {
      const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/) ||
                      html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:title"/);
      if (ogTitle) product.name = ogTitle[1];
    }

    if (!product.description) {
      const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/) ||
                     html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/) ||
                     html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:description"/);
      if (ogDesc) product.description = ogDesc[1];
    }

    if (!product.images || product.images.length === 0) {
      const ogImages = [];
      const imgMatches = html.matchAll(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/gi);
      for (const m of imgMatches) ogImages.push(m[1]);
      if (ogImages.length > 0) product.images = ogImages;
    }

    if (!product.price) {
      const priceMatch = html.match(/["']price["']\s*:\s*["']?([\d.]+)["']?/) ||
                         html.match(/<span[^>]*class="[^"]*price[^"]*"[^>]*>\s*\$?([\d,.]+)/i);
      if (priceMatch) product.price = parseFloat(priceMatch[1].replace(',', ''));
    }

    // Determine retailer from URL
    const hostname = new URL(url).hostname.replace('www.', '');
    const retailerMap = {
      'potterybarn.com': 'Pottery Barn',
      'serenaandlily.com': 'Serena & Lily',
      'westelm.com': 'West Elm',
      'crateandbarrel.com': 'Crate & Barrel',
      'wayfair.com': 'Wayfair',
      'target.com': 'Target',
      'amazon.com': 'Amazon',
    };
    product.retailer = retailerMap[hostname] || hostname;
    product.brand = product.brand || product.retailer;
    product.affiliateUrl = url;

    return NextResponse.json(product);

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product data: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
