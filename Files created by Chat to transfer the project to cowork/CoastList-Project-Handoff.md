# CoastList.com — Complete Project for Cowork

## Project Overview

CoastList.com is a waterfront property listing website that curates homes where property lines border rivers, lakes, oceans, and waterways. The site is built with Next.js and deployed on Vercel. The domain coastlist.com is registered through GoDaddy and connected to Vercel.

### Current Stack
- **Framework:** Next.js 16 (React)
- **Hosting:** Vercel (connected to GitHub repo `WhoopityDoo/coastlist`)
- **Domain:** coastlist.com (DNS via GoDaddy → Vercel)
- **Data Storage:** localStorage (browser-based, no external database yet)
- **No external APIs or databases required**

### How It Works
- **Public site:** `coastlist.com` — visitors browse curated waterfront properties
- **Admin panel:** `coastlist.com?admin=true` — owner pastes Zillow URLs to add properties
- Properties are displayed entirely within CoastList (no outbound links to Zillow)
- Future monetization: advertising (ad placeholder spaces are built into property detail pages)

---

## Project Structure

```
coastlist/
├── app/
│   ├── api/
│   │   └── fetch-listing/
│   │       └── route.js          ← Server-side Zillow data fetcher
│   ├── globals.css               ← Keep existing (minimal styles)
│   ├── layout.tsx                ← Keep existing (root layout)
│   └── page.jsx                  ← Main application (public site + admin)
├── package.json
├── next.config.ts
└── README.md
```

---

## File 1: app/page.jsx

This is the main application file. It contains the public property listing site, full-page property detail view, and the admin panel with Zillow URL auto-fetch.

Replace the entire contents of `app/page.jsx` with the code in the file `coastlist-v4-page.jsx` that was previously created.

### Key Features in page.jsx:
- **Hero section** with animated wave background
- **Filter bar** with State, County (cascading), and Water Type (Ocean/River/Lake/Pond) filters
- **Property cards** with Zillow photos, price, beds/baths/sqft, water type badge
- **Full-page property detail** with image gallery, stats, description, features, waterfront info card, similar properties, and ad placeholder
- **Admin panel** (accessed via `?admin=true`) with:
  - Paste Zillow URL → click Fetch → auto-fills all data
  - Select Water Type → click Publish
  - Export/Import properties as JSON
  - Edit/Delete existing properties
- **No outbound links** — all property viewing happens within CoastList
- **Favorites** — visitors can save properties (stored in browser)

---

## File 2: app/api/fetch-listing/route.js

This is the server-side API route that fetches property data from Zillow URLs. It runs on the server (not in the browser) to avoid CORS issues.

Create the folder structure `app/api/fetch-listing/` and add `route.js` with the code from `coastlist-v4-api-route.js`.

### What the API route does:
1. Receives a Zillow URL via POST request
2. Fetches the Zillow page server-side
3. Parses the HTML to extract:
   - All property photos (from photos.zillowstatic.com)
   - Price, beds, baths, sqft, lot size, year built
   - Full listing description
   - Address, city, state, zip code
   - Auto-detected features (dock, pool, waterfront, etc.)
4. Returns structured JSON to the admin panel

---

## Admin Workflow: Adding Properties

### Step-by-step process:
1. Go to Zillow.com and search for waterfront homes in any area
2. Find a property where the property line touches water (check satellite view)
3. Copy the Zillow URL (e.g., `https://www.zillow.com/homedetails/123-Main-St-City-ST-12345/99999_zpid/`)
4. Visit `coastlist.com?admin=true`
5. Paste the URL into the input field
6. Click **Fetch Listing**
7. Review the auto-filled data (photos, price, description, etc.)
8. Select the **Water Type**: Ocean, River, Lake, or Pond
9. Optionally enter water frontage in feet and check Featured
10. Click **Publish to CoastList**

The property is now live on the public site with real Zillow photos and data.

---

## Deployment Instructions

### From terminal:
```bash
cd /Users/dg/coastlist
git add .
git commit -m "Update with Zillow auto-fetch"
git push
```

Vercel auto-deploys from the GitHub repo. Changes go live in ~60 seconds.

### DNS Configuration (already set up):
- GoDaddy A record: `@` → `216.198.79.1`
- GoDaddy CNAME: `www` → `cname.vercel-dns.com`

---

## Design System

### Colors:
- Navy: `#1B2B4B` (primary text, headers, footer)
- Sand Light: `#FAF7F2` (page background)
- Ocean: `#2E6B8A` (accents, links)
- Seafoam: `#7CC5B8` (CTAs, highlights)
- Coral: `#E87461` (favorites, alerts)
- Gold: `#D4A853` (featured badges)

### Typography:
- **Playfair Display** — headings, prices, property titles
- **DM Sans** — body text, UI elements, descriptions

### Water Type Badge Colors:
- Ocean: `#1B4B7A`
- River: `#2E7D6B`
- Lake: `#3A6EA5`
- Pond: `#5B8C7A`

---

## Future Enhancements (in priority order)

1. **Persistent database** — Replace localStorage with Supabase (free tier) so properties persist for all visitors, not just the admin's browser
2. **Real map integration** — Add Google Maps or Mapbox to the property detail page showing the actual property location
3. **SEO optimization** — Add proper meta tags, Open Graph images, and page titles for each property
4. **Image optimization** — Use Next.js Image component for lazy loading and responsive images
5. **Zillow API integration** — Subscribe to a RapidAPI Zillow endpoint to auto-discover new waterfront listings instead of manual URL pasting
6. **Ad integration** — Replace ad placeholder divs with actual ad network code (Google AdSense, etc.) once traffic warrants
7. **Search by location** — Allow visitors to search by city/zip code in addition to state/county dropdowns
8. **Property alerts** — Let visitors sign up for email alerts when new waterfront properties are added in their area

---

## Important Notes

- **No Zillow outbound links** — The site is designed to keep visitors on CoastList. Properties are viewed entirely within the site.
- **Zillow photos are publicly hosted** — The images reference `photos.zillowstatic.com` URLs which are publicly accessible. If a Zillow listing is removed, the photos will stop loading.
- **localStorage limitation** — Currently, properties are stored in the admin's browser. If you clear browser data or use a different browser/device, properties won't be there. The JSON export/import feature is a backup. Upgrading to Supabase solves this permanently.
- **Admin access** — Anyone who knows to add `?admin=true` to the URL can access the admin panel. For production, add password protection or authentication.
