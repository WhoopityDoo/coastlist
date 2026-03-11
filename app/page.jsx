"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const LOGO_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfqAwIAKwd+tkjVAACAAElEQVR42nT9d7wt2VEfin9rde8czj7xnpvvRI00kkYBhCwsLIEIT5LB5Ghw4CGC/cN+2M82GPuBfzb2w8ZgzLPAxsYGgxAiWggBQkJCSAJFRmFGE+7cuenksHPo7lXvj1XVq/YZvcvnojsn9O5evVbVt6q+9S0a93efBDAHcA7ACMAFAAMAMwBNABUA+wCqCH9S+foxgJ58fw6gkO8dAKgBWJGvtQAsADCAMYBV+ZyKXHMmP+MAHAKoy9fGci8Nub6X62Ty/QzAttyHk3uryu+lcq2qXK8DgMHogXAAYALgKoBdgCoAL+R+KwBOAJwCuMjMIyLyYBwDeCEIj8uzXwZwJPdWl98bMWNMBCfP3zDPeSrPuA/gkjxHC8CCGUwEyNcazJwR0QxAH8AagLY8x0ie80TWsifPnsp3NQAfMWNMBCfP3zDPeSrPuA/gkjxHC8CCGUwE";

// ─── Color palette ───
const COLORS = {
  navy: "#1B2B4B",
  navyLight: "#2A3F6B",
  sand: "#F5EFE6",
  sandDark: "#E8DFD0",
  sandLight: "#FAF7F2",
  ocean: "#2E6B8A",
  oceanLight: "#4A9CB8",
  oceanPale: "#E8F4F8",
  seafoam: "#7CC5B8",
  coral: "#E87461",
  coralLight: "#F09080",
  gold: "#D4A853",
  white: "#FFFFFF",
  gray100: "#F8F9FA",
  gray200: "#E9ECEF",
  gray300: "#DEE2E6",
  gray400: "#CED4DA",
  gray500: "#ADB5BD",
  gray600: "#6C757D",
  gray700: "#495057",
  gray800: "#343A40",
  gray900: "#212529",
};

// ─── Mock property data ───
const STATES = ["Florida", "California", "North Carolina", "South Carolina", "Massachusetts", "Maine", "Oregon", "Washington", "Hawaii", "Texas", "New Jersey", "Connecticut", "Virginia", "Maryland"];

const COUNTIES_BY_STATE = {
  "Florida": ["Miami-Dade", "Palm Beach", "Monroe", "Collier", "Sarasota", "Pinellas", "Volusia", "St. Johns"],
  "California": ["Los Angeles", "San Diego", "Orange", "Santa Barbara", "Monterey", "Marin", "San Francisco", "Mendocino"],
  "North Carolina": ["New Hanover", "Dare", "Carteret", "Brunswick", "Currituck", "Onslow"],
  "South Carolina": ["Charleston", "Beaufort", "Horry", "Georgetown", "Colleton"],
  "Massachusetts": ["Barnstable", "Nantucket", "Dukes", "Plymouth", "Essex"],
  "Maine": ["Cumberland", "York", "Hancock", "Lincoln", "Knox"],
  "Oregon": ["Clatsop", "Lincoln", "Tillamook", "Coos", "Curry"],
  "Washington": ["San Juan", "Island", "Whatcom", "Clallam", "Pacific"],
  "Hawaii": ["Honolulu", "Maui", "Hawaii", "Kauai"],
  "Texas": ["Galveston", "Cameron", "Nueces", "Aransas", "Brazoria"],
  "New Jersey": ["Cape May", "Ocean", "Monmouth", "Atlantic", "Burlington"],
  "Connecticut": ["Fairfield", "New London", "Middlesex", "New Haven"],
  "Virginia": ["Virginia Beach", "Accomack", "Northampton", "Lancaster", "Mathews"],
  "Maryland": ["Worcester", "Talbot", "Dorchester", "Somerset", "Anne Arundel"],
};

const WATER_TYPES = ["Ocean", "River", "Lake", "Pond"];

const PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&h=400&fit=crop",
];

const STREET_NAMES = ["Oceanview Dr", "Harbor Ln", "Seabreeze Way", "Coastal Blvd", "Shoreline Rd", "Bayfront Ave", "Tidewater Ct", "Marina Dr", "Driftwood Ln", "Pelican Way", "Sandpiper Rd", "Lighthouse Ln", "Seaside Terrace", "Coral Reef Dr", "Anchor Point Rd", "Sunset Cove Ln", "Dolphin Bay Dr", "Starfish Way", "Neptune Ct", "Wave Crest Blvd"];

const PROPERTY_DESCRIPTIONS = [
  "Stunning waterfront estate with panoramic views and private dock access.",
  "Luxurious coastal retreat featuring floor-to-ceiling windows overlooking the water.",
  "Elegant waterfront home with resort-style pool and direct water access.",
  "Contemporary coastal masterpiece with open floor plan and breathtaking vistas.",
  "Charming waterfront cottage with updated interiors and peaceful surroundings.",
  "Magnificent estate on pristine waterfront with expansive outdoor living areas.",
  "Beautifully renovated home with wrap-around deck and unobstructed water views.",
  "Exclusive waterfront property with private beach, boathouse, and deep water dock.",
];

function generateProperties(count = 60) {
  const properties = [];
  const stateCoords = {
    "Florida": { lat: [25.5, 30.5], lng: [-80.5, -87.5] },
    "California": { lat: [32.5, 38.5], lng: [-117.5, -122.5] },
    "North Carolina": { lat: [33.8, 36.5], lng: [-75.5, -78.5] },
    "South Carolina": { lat: [32.0, 34.5], lng: [-78.5, -81.0] },
    "Massachusetts": { lat: [41.2, 42.8], lng: [-69.9, -71.5] },
    "Maine": { lat: [43.0, 47.0], lng: [-66.9, -70.5] },
    "Oregon": { lat: [42.0, 46.0], lng: [-123.5, -124.5] },
    "Washington": { lat: [46.0, 49.0], lng: [-122.5, -124.5] },
    "Hawaii": { lat: [19.0, 22.0], lng: [-154.5, -160.0] },
    "Texas": { lat: [26.0, 30.0], lng: [-94.0, -97.5] },
    "New Jersey": { lat: [39.0, 41.0], lng: [-74.0, -75.5] },
    "Connecticut": { lat: [41.0, 42.0], lng: [-72.0, -73.5] },
    "Virginia": { lat: [36.5, 39.0], lng: [-75.5, -77.5] },
    "Maryland": { lat: [38.0, 39.5], lng: [-75.0, -77.0] },
  };

  for (let i = 0; i < count; i++) {
    const state = STATES[Math.floor(Math.random() * STATES.length)];
    const counties = COUNTIES_BY_STATE[state];
    const county = counties[Math.floor(Math.random() * counties.length)];
    const waterType = WATER_TYPES[Math.floor(Math.random() * WATER_TYPES.length)];
    const coords = stateCoords[state];
    const lat = coords.lat[0] + Math.random() * (coords.lat[1] - coords.lat[0]);
    const lng = coords.lng[0] + Math.random() * (coords.lng[1] - coords.lng[0]);
    const price = Math.floor((500000 + Math.random() * 9500000) / 1000) * 1000;
    const beds = Math.floor(2 + Math.random() * 5);
    const baths = Math.floor(2 + Math.random() * 4);
    const sqft = Math.floor(1800 + Math.random() * 6200);
    const lotAcres = (0.25 + Math.random() * 4.75).toFixed(2);
    const streetNum = Math.floor(100 + Math.random() * 9900);
    const streetName = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)];

    properties.push({
      id: `CL-${String(i + 1001).padStart(5, "0")}`,
      address: `${streetNum} ${streetName}`,
      city: county,
      state,
      county,
      price,
      beds,
      baths,
      sqft,
      lotAcres: parseFloat(lotAcres),
      waterType,
      lat,
      lng,
      image: PROPERTY_IMAGES[i % PROPERTY_IMAGES.length],
      description: PROPERTY_DESCRIPTIONS[i % PROPERTY_DESCRIPTIONS.length],
      daysOnMarket: Math.floor(1 + Math.random() * 90),
      yearBuilt: Math.floor(1960 + Math.random() * 63),
      featured: Math.random() > 0.75,
      waterFrontage: Math.floor(50 + Math.random() * 450),
    });
  }
  return properties;
}

const ALL_PROPERTIES = generateProperties(60);

// ─── Format helpers ───
const formatPrice = (p) => {
  if (p >= 1000000) return `$${(p / 1000000).toFixed(p % 1000000 === 0 ? 0 : 1)}M`;
  return `$${(p / 1000).toFixed(0)}K`;
};
const formatPriceFull = (p) => `$${p.toLocaleString()}`;

// ─── Icons as SVG components ───
const IconBed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
);
const IconBath = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/></svg>
);
const IconArea = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>
);
const IconWater = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>
);
const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
);
const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
);
const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IconHeart = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? COLORS.coral : "none"} stroke={filled ? COLORS.coral : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
);
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={COLORS.gold} stroke={COLORS.gold} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const IconPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const IconAnchor = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const IconExternalLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const IconHome = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const IconRuler = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>
);

// ─── Water type badge colors ───
const WATER_COLORS = {
  Ocean: { bg: "#1B4B7A", text: "#fff" },
  River: { bg: "#2E7D6B", text: "#fff" },
  Lake: { bg: "#3A6EA5", text: "#fff" },
  Pond: { bg: "#5B8C7A", text: "#fff" },
};

// ─── Animated wave background ───
const WaveBackground = () => (
  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, overflow: "hidden", opacity: 0.06, pointerEvents: "none" }}>
    <svg viewBox="0 0 1440 200" style={{ position: "absolute", bottom: 0, width: "200%", animation: "waveSlide 12s linear infinite" }}>
      <path d="M0,100 C320,180 440,20 720,100 C1000,180 1120,20 1440,100 C1760,180 1880,20 2160,100 L2160,200 L0,200 Z" fill={COLORS.navy}/>
    </svg>
    <svg viewBox="0 0 1440 200" style={{ position: "absolute", bottom: -20, width: "200%", animation: "waveSlide 16s linear infinite reverse" }}>
      <path d="M0,120 C360,40 540,180 720,120 C900,60 1080,180 1440,120 C1620,60 1800,180 2160,120 L2160,200 L0,200 Z" fill={COLORS.ocean}/>
    </svg>
  </div>
);

// ─── Dropdown component ───
const Dropdown = ({ label, value, options, onChange, placeholder, icon }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 160 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
          background: value ? COLORS.oceanPale : COLORS.white,
          border: `1.5px solid ${value ? COLORS.oceanLight : COLORS.gray300}`,
          borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
          color: value ? COLORS.navy : COLORS.gray600, width: "100%",
          transition: "all 0.2s ease", fontWeight: value ? 600 : 400,
        }}
      >
        {icon && <span style={{ display: "flex", opacity: 0.6 }}>{icon}</span>}
        <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {value || placeholder || label}
        </span>
        <span style={{ display: "flex", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <IconChevronDown />
        </span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 1000,
          background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.gray200}`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)", maxHeight: 260, overflowY: "auto",
          animation: "fadeSlideDown 0.2s ease",
        }}>
          {value && (
            <div
              onClick={() => { onChange(""); setOpen(false); }}
              style={{
                padding: "10px 14px", cursor: "pointer", fontSize: 13, color: COLORS.coral,
                borderBottom: `1px solid ${COLORS.gray100}`, fontStyle: "italic",
              }}
            >
              Clear selection
            </div>
          )}
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: "10px 14px", cursor: "pointer", fontSize: 14,
                background: opt === value ? COLORS.oceanPale : "transparent",
                color: opt === value ? COLORS.ocean : COLORS.gray800,
                fontWeight: opt === value ? 600 : 400,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (opt !== value) e.target.style.background = COLORS.gray100; }}
              onMouseLeave={(e) => { if (opt !== value) e.target.style.background = "transparent"; }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Property Card ───
const PropertyCard = ({ property, onSelect, favorites, toggleFavorite, compact }) => {
  const isFav = favorites.has(property.id);
  const wc = WATER_COLORS[property.waterType];

  return (
    <div
      onClick={() => onSelect(property)}
      style={{
        background: COLORS.white, borderRadius: 14, overflow: "hidden",
        boxShadow: "0 2px 16px rgba(27,43,75,0.08)",
        cursor: "pointer", transition: "all 0.3s ease",
        border: `1px solid ${COLORS.gray200}`,
        display: "flex", flexDirection: compact ? "row" : "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(27,43,75,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(27,43,75,0.08)";
      }}
    >
      {/* Image */}
      <div style={{
        position: "relative",
        width: compact ? 200 : "100%",
        minWidth: compact ? 200 : undefined,
        height: compact ? "100%" : 200,
        minHeight: compact ? 140 : undefined,
        background: COLORS.gray200,
        overflow: "hidden",
        flexShrink: 0,
      }}>
        <img
          src={property.image}
          alt={property.address}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
        {/* Water type badge */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          background: wc.bg, color: wc.text, padding: "4px 10px",
          borderRadius: 6, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.05em", textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 4,
          backdropFilter: "blur(4px)",
        }}>
          <IconWater /> {property.waterType}
        </div>
        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }}
          style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%",
            width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", backdropFilter: "blur(4px)", transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
          onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
        >
          <IconHeart filled={isFav} />
        </button>
        {/* Featured */}
        {property.featured && (
          <div style={{
            position: "absolute", bottom: 10, left: 10,
            background: "rgba(212,168,83,0.95)", color: COLORS.white,
            padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 3, letterSpacing: "0.05em",
          }}>
            <IconStar /> FEATURED
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: compact ? "12px 14px" : "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: compact ? 4 : 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: compact ? 18 : 22, fontWeight: 800, color: COLORS.navy, fontFamily: "'Playfair Display', serif" }}>
            {formatPriceFull(property.price)}
          </div>
          <div style={{ fontSize: 10, color: COLORS.gray500, whiteSpace: "nowrap", marginTop: 4 }}>
            {property.daysOnMarket}d ago
          </div>
        </div>
        <div style={{ display: "flex", gap: compact ? 10 : 14, fontSize: 13, color: COLORS.gray600 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><IconBed /> {property.beds}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><IconBath /> {property.baths}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><IconArea /> {property.sqft.toLocaleString()}</span>
        </div>
        <div style={{ fontSize: 13, color: COLORS.gray700, fontWeight: 500 }}>
          {property.address}
        </div>
        <div style={{ fontSize: 12, color: COLORS.gray500 }}>
          {property.county}, {property.state}
        </div>
        {!compact && (
          <div style={{
            marginTop: 4, fontSize: 12, color: COLORS.ocean,
            display: "flex", alignItems: "center", gap: 4, fontWeight: 500,
          }}>
            <IconAnchor /> {property.waterFrontage}ft waterfront
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Property Detail Modal ───
const PropertyDetail = ({ property, onClose, favorites, toggleFavorite }) => {
  if (!property) return null;
  const isFav = favorites.has(property.id);
  const wc = WATER_COLORS[property.waterType];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(27,43,75,0.6)",
        zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, backdropFilter: "blur(4px)", animation: "fadeIn 0.25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.white, borderRadius: 18, maxWidth: 720, width: "100%",
          maxHeight: "90vh", overflow: "auto", position: "relative",
          boxShadow: "0 24px 80px rgba(27,43,75,0.25)",
          animation: "modalSlideUp 0.35s ease",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 10,
            background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%",
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <IconX />
        </button>

        {/* Image */}
        <div style={{ height: 340, background: COLORS.gray200, position: "relative", overflow: "hidden" }}>
          <img src={property.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(transparent, rgba(27,43,75,0.7))",
            padding: "40px 28px 20px",
          }}>
            <div style={{ color: COLORS.white, fontSize: 32, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
              {formatPriceFull(property.price)}
            </div>
            <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, marginTop: 4 }}>
              {property.address}, {property.county}, {property.state}
            </div>
          </div>
          <div style={{
            position: "absolute", top: 14, left: 14,
            background: wc.bg, color: wc.text, padding: "6px 14px",
            borderRadius: 8, fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 5,
            letterSpacing: "0.05em", textTransform: "uppercase",
          }}>
            <IconWater /> {property.waterType} Front
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
            {[
              { icon: <IconBed />, label: "Bedrooms", value: property.beds },
              { icon: <IconBath />, label: "Bathrooms", value: property.baths },
              { icon: <IconArea />, label: "Sq Ft", value: property.sqft.toLocaleString() },
              { icon: <IconRuler />, label: "Lot", value: `${property.lotAcres} acres` },
              { icon: <IconAnchor />, label: "Waterfront", value: `${property.waterFrontage} ft` },
              { icon: <IconCalendar />, label: "Year Built", value: property.yearBuilt },
              { icon: <IconHome />, label: "Days Listed", value: property.daysOnMarket },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 14px", background: COLORS.gray100, borderRadius: 8,
                fontSize: 13, color: COLORS.gray700,
              }}>
                <span style={{ color: COLORS.ocean }}>{item.icon}</span>
                <span style={{ fontWeight: 600 }}>{item.value}</span>
                <span style={{ color: COLORS.gray500, fontSize: 11 }}>{item.label}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 15, lineHeight: 1.7, color: COLORS.gray700, marginBottom: 24 }}>
            {property.description}
          </p>

          <div style={{ display: "flex", gap: 12 }}>
            <a
              href={`https://www.zillow.com/homes/${encodeURIComponent(property.address + " " + property.county + " " + property.state)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "14px 20px", background: COLORS.navy, color: COLORS.white,
                borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: "none",
                transition: "background 0.2s", cursor: "pointer",
              }}
              onMouseEnter={(e) => e.target.style.background = COLORS.navyLight}
              onMouseLeave={(e) => e.target.style.background = COLORS.navy}
            >
              View on Zillow <IconExternalLink />
            </a>
            <button
              onClick={() => toggleFavorite(property.id)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "14px 20px",
                background: isFav ? "#FEF0EE" : COLORS.gray100,
                border: `1.5px solid ${isFav ? COLORS.coral : COLORS.gray300}`,
                borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                color: isFav ? COLORS.coral : COLORS.gray700,
                transition: "all 0.2s",
              }}
            >
              <IconHeart filled={isFav} />
              {isFav ? "Saved" : "Save"}
            </button>
          </div>

          <div style={{
            marginTop: 20, padding: "12px 16px", background: COLORS.oceanPale, borderRadius: 10,
            fontSize: 12, color: COLORS.ocean, display: "flex", alignItems: "center", gap: 6,
          }}>
            <IconPin /> Property ID: {property.id} • {property.county} County, {property.state}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Simple Map Component ───
const MapView = ({ properties, onSelect, selectedId }) => {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  // Simple calculation to fit all properties
  const bounds = useMemo(() => {
    if (properties.length === 0) return { minLat: 25, maxLat: 48, minLng: -125, maxLng: -67 };
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    properties.forEach(p => {
      minLat = Math.min(minLat, p.lat);
      maxLat = Math.max(maxLat, p.lat);
      minLng = Math.min(minLng, p.lng);
      maxLng = Math.max(maxLng, p.lng);
    });
    const padLat = (maxLat - minLat) * 0.15 || 2;
    const padLng = (maxLng - minLng) * 0.15 || 2;
    return { minLat: minLat - padLat, maxLat: maxLat + padLat, minLng: minLng - padLng, maxLng: maxLng + padLng };
  }, [properties]);

  const projectPoint = useCallback((lat, lng) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * rect.width;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * rect.height;
    return { x, y };
  }, [bounds]);

  useEffect(() => { setMapReady(true); }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%", height: "100%", position: "relative",
        background: `linear-gradient(170deg, #C8E6F0 0%, #A3C9D9 30%, #8AB4C8 60%, #D4CFC0 100%)`,
        borderRadius: 14, overflow: "hidden",
      }}
    >
      {/* Map grid lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }}>
        {Array.from({length: 10}).map((_, i) => (
          <g key={i}>
            <line x1={`${(i+1)*10}%`} y1="0" x2={`${(i+1)*10}%`} y2="100%" stroke={COLORS.navy} strokeWidth="0.5"/>
            <line x1="0" y1={`${(i+1)*10}%`} x2="100%" y2={`${(i+1)*10}%`} stroke={COLORS.navy} strokeWidth="0.5"/>
          </g>
        ))}
      </svg>

      {/* Decorative "land" shapes */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
        <ellipse cx="30%" cy="40%" rx="25%" ry="30%" fill="#9AB89C"/>
        <ellipse cx="70%" cy="55%" rx="20%" ry="25%" fill="#9AB89C"/>
        <ellipse cx="50%" cy="75%" rx="30%" ry="20%" fill="#9AB89C"/>
      </svg>

      {/* Property markers */}
      {mapReady && properties.map((p) => {
        const { x, y } = projectPoint(p.lat, p.lng);
        const isSelected = p.id === selectedId;
        const isHovered = p.id === hoveredId;
        const wc = WATER_COLORS[p.waterType];
        return (
          <div
            key={p.id}
            onClick={(e) => { e.stopPropagation(); onSelect(p); }}
            onMouseEnter={(e) => {
              setHoveredId(p.id);
              setTooltip({ x, y, property: p });
            }}
            onMouseLeave={() => {
              setHoveredId(null);
              setTooltip(null);
            }}
            style={{
              position: "absolute",
              left: x - (isSelected || isHovered ? 32 : 24),
              top: y - (isSelected || isHovered ? 14 : 10),
              transform: isSelected || isHovered ? "scale(1.15)" : "scale(1)",
              transition: "all 0.2s ease",
              zIndex: isSelected || isHovered ? 100 : 10,
              cursor: "pointer",
            }}
          >
            <div style={{
              background: isSelected ? COLORS.coral : wc.bg,
              color: "#fff",
              padding: "4px 10px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: "nowrap",
              boxShadow: isSelected || isHovered
                ? "0 4px 16px rgba(27,43,75,0.35)"
                : "0 2px 8px rgba(27,43,75,0.2)",
              border: `2px solid ${isSelected ? COLORS.coral : "rgba(255,255,255,0.5)"}`,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {formatPrice(p.price)}
            </div>
            {/* Pin arrow */}
            <div style={{
              width: 0, height: 0, margin: "0 auto",
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: `6px solid ${isSelected ? COLORS.coral : wc.bg}`,
            }}/>
          </div>
        );
      })}

      {/* Hover tooltip */}
      {tooltip && (
        <div style={{
          position: "absolute",
          left: Math.min(tooltip.x, (mapRef.current?.clientWidth || 400) - 240),
          top: tooltip.y - 120,
          background: COLORS.white,
          borderRadius: 10,
          padding: 10,
          boxShadow: "0 8px 32px rgba(27,43,75,0.2)",
          width: 220,
          zIndex: 200,
          pointerEvents: "none",
          animation: "fadeIn 0.15s ease",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>{formatPriceFull(tooltip.property.price)}</div>
          <div style={{ fontSize: 12, color: COLORS.gray600, marginTop: 2 }}>{tooltip.property.address}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 11, color: COLORS.gray500 }}>
            <span>{tooltip.property.beds} bd</span>
            <span>{tooltip.property.baths} ba</span>
            <span>{tooltip.property.sqft.toLocaleString()} sqft</span>
          </div>
          <div style={{
            marginTop: 6, fontSize: 10, color: WATER_COLORS[tooltip.property.waterType].bg,
            fontWeight: 600, textTransform: "uppercase",
          }}>
            {tooltip.property.waterType} • {tooltip.property.waterFrontage}ft frontage
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 14, left: 14,
        background: "rgba(255,255,255,0.92)", borderRadius: 10, padding: "10px 14px",
        backdropFilter: "blur(8px)", boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.gray600, marginBottom: 6, letterSpacing: "0.05em" }}>
          WATER TYPE
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {WATER_TYPES.map((wt) => (
            <div key={wt} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: WATER_COLORS[wt].bg }}/>
              <span style={{ color: COLORS.gray600 }}>{wt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Property count */}
      <div style={{
        position: "absolute", top: 14, right: 14,
        background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "8px 12px",
        backdropFilter: "blur(8px)", fontSize: 12, fontWeight: 600, color: COLORS.navy,
      }}>
        {properties.length} properties
      </div>
    </div>
  );
};

// ─── Hero Section ───
const Hero = ({ onExplore }) => (
  <div style={{
    position: "relative",
    background: `linear-gradient(145deg, ${COLORS.navy} 0%, #1E3A5F 40%, ${COLORS.ocean} 100%)`,
    padding: "80px 40px 100px",
    overflow: "hidden",
    textAlign: "center",
  }}>
    <WaveBackground />
    {/* Floating decorative elements */}
    <div style={{ position: "absolute", top: 40, left: "10%", width: 6, height: 6, borderRadius: "50%", background: COLORS.seafoam, opacity: 0.4, animation: "float 6s ease-in-out infinite" }}/>
    <div style={{ position: "absolute", top: 80, right: "15%", width: 4, height: 4, borderRadius: "50%", background: COLORS.gold, opacity: 0.4, animation: "float 8s ease-in-out infinite 1s" }}/>
    <div style={{ position: "absolute", top: 120, left: "25%", width: 8, height: 8, borderRadius: "50%", background: COLORS.oceanLight, opacity: 0.3, animation: "float 7s ease-in-out infinite 2s" }}/>

    <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
      <div style={{
        fontSize: 14, letterSpacing: "0.25em", color: COLORS.seafoam, fontWeight: 600,
        textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Sans', sans-serif",
      }}>
        Waterfront Living, Curated
      </div>
      <h1 style={{
        fontSize: "clamp(36px, 5vw, 56px)",
        fontWeight: 800, color: COLORS.white, lineHeight: 1.1,
        fontFamily: "'Playfair Display', serif", margin: "0 0 20px",
      }}>
        Discover Your <span style={{ color: COLORS.seafoam }}>Waterfront</span> Dream Home
      </h1>
      <p style={{
        fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.7)",
        lineHeight: 1.6, maxWidth: 520, margin: "0 auto 36px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Every property in our collection borders a river, lake, ocean, or waterway.
        Where the water meets your front door.
      </p>
      <button
        onClick={onExplore}
        style={{
          padding: "16px 40px", background: COLORS.seafoam, color: COLORS.navy,
          border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          display: "inline-flex", alignItems: "center", gap: 8,
          transition: "all 0.3s ease", boxShadow: "0 4px 20px rgba(124,197,184,0.4)",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 8px 30px rgba(124,197,184,0.5)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 20px rgba(124,197,184,0.4)";
        }}
      >
        <IconSearch /> Explore Properties
      </button>
    </div>
  </div>
);

// ─── Main App ───
export default function CoastList() {
  const [view, setView] = useState("grid");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedWater, setSelectedWater] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [showHero, setShowHero] = useState(true);
  const listRef = useRef(null);

  const counties = selectedState ? COUNTIES_BY_STATE[selectedState] || [] : [];

  const filteredProperties = useMemo(() => {
    return ALL_PROPERTIES.filter((p) => {
      if (selectedState && p.state !== selectedState) return false;
      if (selectedCounty && p.county !== selectedCounty) return false;
      if (selectedWater && p.waterType !== selectedWater) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.address.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          p.county.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedState, selectedCounty, selectedWater, searchQuery]);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const scrollToList = () => {
    setShowHero(false);
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => {
    if (selectedState === "" || !COUNTIES_BY_STATE[selectedState]?.includes(selectedCounty)) {
      setSelectedCounty("");
    }
  }, [selectedState]);

  const activeFilters = [selectedState, selectedCounty, selectedWater].filter(Boolean).length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: COLORS.sandLight, minHeight: "100vh" }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Global keyframes */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes waveSlide { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-15px) } }
        @keyframes pulse { 0%,100% { opacity: 0.6 } 50% { opacity: 1 } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.gray300}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${COLORS.gray400}; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
      `}</style>

      {/* ─── Header ─── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 28px",
        background: showHero ? "transparent" : COLORS.white,
        borderBottom: showHero ? "none" : `1px solid ${COLORS.gray200}`,
        position: showHero ? "absolute" : "sticky",
        top: 0, left: 0, right: 0, zIndex: 1000,
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setShowHero(true)}>
          <img src={LOGO_SRC} alt="CoastList" style={{ height: 44, objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {favorites.size > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 4, fontSize: 13,
              color: showHero ? COLORS.white : COLORS.coral, fontWeight: 600,
            }}>
              <IconHeart filled /> {favorites.size}
            </div>
          )}
        </div>
      </header>

      {/* ─── Hero ─── */}
      {showHero && <Hero onExplore={scrollToList} />}

      {/* ─── Main Content ─── */}
      <div ref={listRef} style={{ maxWidth: 1440, margin: "0 auto", padding: showHero ? "0 24px 40px" : "0 24px 40px" }}>
        {/* Filter Bar */}
        <div style={{
          position: "sticky", top: showHero ? 0 : 69, zIndex: 500,
          background: "rgba(245,239,230,0.95)", backdropFilter: "blur(12px)",
          padding: "16px 0", marginBottom: 20,
          borderBottom: `1px solid ${COLORS.sandDark}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
              background: COLORS.white, border: `1.5px solid ${COLORS.gray300}`,
              borderRadius: 10, flex: "1 1 200px", maxWidth: 280,
            }}>
              <IconSearch />
              <input
                type="text"
                placeholder="Search address, city, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none", outline: "none", flex: 1, fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif", background: "transparent",
                  color: COLORS.gray800,
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: COLORS.gray500 }}>
                  <IconX />
                </button>
              )}
            </div>

            {/* Tier 1 Filters */}
            <Dropdown
              label="State" value={selectedState} options={STATES}
              onChange={setSelectedState} placeholder="All States"
              icon={<IconPin />}
            />
            <Dropdown
              label="County" value={selectedCounty}
              options={counties}
              onChange={setSelectedCounty}
              placeholder={selectedState ? "All Counties" : "Select state first"}
              icon={<IconMap />}
            />

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: COLORS.gray300, flexShrink: 0 }}/>

            {/* Tier 2 Filter */}
            <Dropdown
              label="Water Type" value={selectedWater} options={WATER_TYPES}
              onChange={setSelectedWater} placeholder="All Water Types"
              icon={<IconWater />}
            />

            <div style={{ flex: 1 }}/>

            {/* Active filter count */}
            {activeFilters > 0 && (
              <button
                onClick={() => { setSelectedState(""); setSelectedCounty(""); setSelectedWater(""); setSearchQuery(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "8px 14px",
                  background: COLORS.coralLight + "22", border: `1px solid ${COLORS.coral}33`,
                  borderRadius: 8, fontSize: 12, fontWeight: 600, color: COLORS.coral,
                  cursor: "pointer",
                }}
              >
                Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""} <IconX />
              </button>
            )}

            {/* View toggle */}
            <div style={{
              display: "flex", background: COLORS.white, borderRadius: 10,
              border: `1.5px solid ${COLORS.gray300}`, overflow: "hidden",
            }}>
              {[
                { key: "grid", icon: <IconGrid />, label: "Grid" },
                { key: "map", icon: <IconMap />, label: "Map" },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
                    border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: view === v.key ? COLORS.navy : "transparent",
                    color: view === v.key ? COLORS.white : COLORS.gray600,
                    transition: "all 0.2s",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div style={{ marginTop: 10, fontSize: 13, color: COLORS.gray600 }}>
            <span style={{ fontWeight: 700, color: COLORS.navy }}>{filteredProperties.length}</span> waterfront {filteredProperties.length === 1 ? "property" : "properties"}
            {selectedState && <span> in <strong>{selectedState}</strong></span>}
            {selectedCounty && <span> · {selectedCounty} County</span>}
            {selectedWater && <span> · <span style={{ color: WATER_COLORS[selectedWater].bg, fontWeight: 600 }}>{selectedWater}</span> front</span>}
          </div>
        </div>

        {/* Content Area */}
        {view === "grid" ? (
          <div>
            {/* Featured row */}
            {filteredProperties.some(p => p.featured) && !searchQuery && !selectedState && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{
                  fontSize: 22, fontWeight: 700, color: COLORS.navy, marginBottom: 16,
                  fontFamily: "'Playfair Display', serif",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <IconStar /> Featured Waterfront Homes
                </h2>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 20,
                }}>
                  {filteredProperties.filter(p => p.featured).slice(0, 4).map((p) => (
                    <PropertyCard
                      key={p.id} property={p} onSelect={setSelectedProperty}
                      favorites={favorites} toggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All properties grid */}
            <h2 style={{
              fontSize: 22, fontWeight: 700, color: COLORS.navy, marginBottom: 16,
              fontFamily: "'Playfair Display', serif",
            }}>
              All Properties
            </h2>
            {filteredProperties.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 20px", color: COLORS.gray500,
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🌊</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.gray700, marginBottom: 8 }}>
                  No properties found
                </div>
                <div style={{ fontSize: 14 }}>
                  Try adjusting your filters to discover more waterfront homes.
                </div>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 20,
              }}>
                {filteredProperties.map((p) => (
                  <PropertyCard
                    key={p.id} property={p} onSelect={setSelectedProperty}
                    favorites={favorites} toggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Map + sidebar view */
          <div style={{ display: "flex", gap: 20, height: "calc(100vh - 200px)", minHeight: 500 }}>
            {/* Map */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <MapView
                properties={filteredProperties}
                onSelect={setSelectedProperty}
                selectedId={selectedProperty?.id}
              />
            </div>
            {/* Sidebar list */}
            <div style={{
              width: 340, flexShrink: 0, overflowY: "auto",
              display: "flex", flexDirection: "column", gap: 12,
              paddingRight: 4,
            }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: COLORS.gray600,
                padding: "8px 0", borderBottom: `1px solid ${COLORS.gray200}`, marginBottom: 4,
              }}>
                {filteredProperties.length} properties on map
              </div>
              {filteredProperties.map((p) => (
                <PropertyCard
                  key={p.id} property={p} onSelect={setSelectedProperty}
                  favorites={favorites} toggleFavorite={toggleFavorite}
                  compact
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer ─── */}
      <footer style={{
        background: COLORS.navy, color: "rgba(255,255,255,0.6)", padding: "40px 28px",
        textAlign: "center", fontSize: 13, lineHeight: 1.8,
      }}>
        <img src={LOGO_SRC} alt="CoastList" style={{ height: 40, objectFit: "contain", opacity: 0.7, marginBottom: 16 }} />
        <div style={{ maxWidth: 500, margin: "0 auto", marginBottom: 20 }}>
          CoastList curates waterfront properties where property lines border rivers, lakes,
          oceans, and waterways. Every listing connects you to the water.
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          © {new Date().getFullYear()} CoastList.com — All rights reserved · Property data sourced from Zillow
        </div>
      </footer>

      {/* ─── Property Detail Modal ─── */}
      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}

