"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/*
╔══════════════════════════════════════════════════════════════╗
║  COASTLIST.COM — Complete Application with Admin Panel       ║
║                                                              ║
║  HOW IT WORKS:                                               ║
║  1. Visit your site normally = public property listings      ║
║  2. Add ?admin=true to URL = admin panel to add properties   ║
║  3. Properties are stored in localStorage (persists in       ║
║     browser) + can be exported/imported as JSON              ║
║  4. For production: replace localStorage with Supabase       ║
║     (free) when ready to scale                               ║
╚══════════════════════════════════════════════════════════════╝
*/

// ─── Design Tokens ───
const C = {
  navy: "#1B2B4B", navyLight: "#2A3F6B", navyDark: "#111D33",
  sand: "#F5EFE6", sandDark: "#E8DFD0", sandLight: "#FAF7F2",
  ocean: "#2E6B8A", oceanLight: "#4A9CB8", oceanPale: "#E8F4F8",
  seafoam: "#7CC5B8", coral: "#E87461", coralLight: "#F09080",
  gold: "#D4A853", white: "#FFFFFF",
  g100: "#F8F9FA", g200: "#E9ECEF", g300: "#DEE2E6",
  g400: "#CED4DA", g500: "#ADB5BD", g600: "#6C757D",
  g700: "#495057", g800: "#343A40", g900: "#212529",
  green: "#2D9F6F", greenBg: "#E6F7EF",
  redBg: "#FEF0EE", yellowBg: "#FFF8E7",
};

const STATES = ["Florida","California","North Carolina","South Carolina","Massachusetts","Maine","Oregon","Washington","Hawaii","Texas","New Jersey","Connecticut","Virginia","Maryland","Georgia","New York","Rhode Island","New Hampshire","Delaware","Louisiana","Mississippi","Alabama"];

const COUNTIES_BY_STATE = {
  "Florida":["Miami-Dade","Palm Beach","Monroe","Collier","Sarasota","Pinellas","Volusia","St. Johns","Brevard","Lee","Martin","Indian River","Nassau","Duval","Bay","Okaloosa","Walton","Santa Rosa","Escambia"],
  "California":["Los Angeles","San Diego","Orange","Santa Barbara","Monterey","Marin","San Francisco","Mendocino","Sonoma","San Mateo","Santa Cruz","Ventura","Humboldt"],
  "North Carolina":["New Hanover","Dare","Carteret","Brunswick","Currituck","Onslow","Pender","Beaufort","Hyde"],
  "South Carolina":["Charleston","Beaufort","Horry","Georgetown","Colleton","Jasper","Berkeley"],
  "Massachusetts":["Barnstable","Nantucket","Dukes","Plymouth","Essex","Suffolk","Bristol","Norfolk"],
  "Maine":["Cumberland","York","Hancock","Lincoln","Knox","Waldo","Sagadahoc","Washington"],
  "Oregon":["Clatsop","Lincoln","Tillamook","Coos","Curry","Lane","Douglas"],
  "Washington":["San Juan","Island","Whatcom","Clallam","Pacific","Grays Harbor","Jefferson","Kitsap"],
  "Hawaii":["Honolulu","Maui","Hawaii","Kauai"],
  "Texas":["Galveston","Cameron","Nueces","Aransas","Brazoria","Matagorda","San Patricio","Kleberg","Willacy"],
  "New Jersey":["Cape May","Ocean","Monmouth","Atlantic","Burlington","Bergen","Hudson"],
  "Connecticut":["Fairfield","New London","Middlesex","New Haven"],
  "Virginia":["Virginia Beach","Accomack","Northampton","Lancaster","Mathews","Gloucester"],
  "Maryland":["Worcester","Talbot","Dorchester","Somerset","Anne Arundel","Calvert","St. Marys","Queen Annes"],
  "Georgia":["Chatham","Glynn","Camden","McIntosh","Liberty","Bryan"],
  "New York":["Suffolk","Nassau","Westchester","Queens","Kings","Richmond","Rockland"],
  "Rhode Island":["Washington","Newport","Bristol","Kent"],
  "New Hampshire":["Rockingham","Strafford"],
  "Delaware":["Sussex","Kent"],
  "Louisiana":["Orleans","Jefferson","St. Tammany","Terrebonne","Lafourche","Plaquemines","Cameron"],
  "Mississippi":["Harrison","Jackson","Hancock"],
  "Alabama":["Baldwin","Mobile"],
};

const WATER_TYPES = ["Ocean","River","Lake","Pond"];

const WATER_COLORS = {
  Ocean: { bg: "#1B4B7A", text: "#fff" },
  River: { bg: "#2E7D6B", text: "#fff" },
  Lake: { bg: "#3A6EA5", text: "#fff" },
  Pond: { bg: "#5B8C7A", text: "#fff" },
};

// ─── Starter demo properties (shown until you add real ones) ───
const DEMO_PROPERTIES = [
  {
    id: "DEMO-001", address: "1247 Oceanview Dr", city: "Palm Beach", state: "Florida",
    county: "Palm Beach", price: 4250000, beds: 5, baths: 4, sqft: 4800, lotAcres: 0.82,
    waterType: "Ocean", waterFrontage: 180, yearBuilt: 2018, daysOnMarket: 12,
    description: "Stunning direct oceanfront estate with 180 feet of private beach frontage. Seawall and private dock with deep water access.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
    zillowUrl: "https://www.zillow.com/homes/Palm-Beach-FL/", featured: true, isDemo: true,
  },
  {
    id: "DEMO-002", address: "892 Harbor Ln", city: "Beaufort", state: "South Carolina",
    county: "Beaufort", price: 1850000, beds: 4, baths: 3, sqft: 3200, lotAcres: 1.1,
    waterType: "River", waterFrontage: 220, yearBuilt: 2005, daysOnMarket: 28,
    description: "Elegant riverfront home on the Beaufort River with 220 feet of water frontage and private deep water dock.",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop",
    zillowUrl: "https://www.zillow.com/homes/Beaufort-SC/", featured: false, isDemo: true,
  },
  {
    id: "DEMO-003", address: "3301 Coastal Blvd", city: "Monterey", state: "California",
    county: "Monterey", price: 5750000, beds: 5, baths: 5, sqft: 5400, lotAcres: 1.3,
    waterType: "Ocean", waterFrontage: 95, yearBuilt: 2020, daysOnMarket: 5,
    description: "Modern masterpiece perched on the bluffs with direct ocean frontage. Private staircase to beach.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    zillowUrl: "https://www.zillow.com/homes/Monterey-CA/", featured: true, isDemo: true,
  },
  {
    id: "DEMO-004", address: "78 Pondview Circle", city: "Nantucket", state: "Massachusetts",
    county: "Nantucket", price: 3200000, beds: 3, baths: 2, sqft: 2100, lotAcres: 0.45,
    waterType: "Pond", waterFrontage: 120, yearBuilt: 1985, daysOnMarket: 45,
    description: "Classic Nantucket cottage on Hummock Pond with 120 feet of pond frontage and private dock.",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
    zillowUrl: "https://www.zillow.com/homes/Nantucket-MA/", featured: false, isDemo: true,
  },
  {
    id: "DEMO-005", address: "2200 River Bend Rd", city: "Charleston", state: "South Carolina",
    county: "Charleston", price: 2800000, beds: 5, baths: 4, sqft: 4100, lotAcres: 2.1,
    waterType: "River", waterFrontage: 340, yearBuilt: 2015, daysOnMarket: 18,
    description: "Spectacular estate on the Ashley River with 340 feet of river frontage and deep water dock with two boat slips.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    zillowUrl: "https://www.zillow.com/homes/Charleston-SC/", featured: true, isDemo: true,
  },
  {
    id: "DEMO-006", address: "510 Lakeshore Dr", city: "Traverse City", state: "Michigan",
    county: "Grand Traverse", price: 1250000, beds: 4, baths: 3, sqft: 2600, lotAcres: 0.55,
    waterType: "Lake", waterFrontage: 100, yearBuilt: 2010, daysOnMarket: 33,
    description: "Beautifully updated lakefront home with 100 feet of sandy beach frontage on Lake Michigan.",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop",
    zillowUrl: "https://www.zillow.com/homes/Traverse-City-MI/", featured: false, isDemo: true,
  },
];

// ─── Format helpers ───
const fmtPrice = (p) => `$${p.toLocaleString()}`;
const fmtPriceShort = (p) => p >= 1e6 ? `$${(p/1e6).toFixed(p%1e6===0?0:1)}M` : `$${(p/1e3).toFixed(0)}K`;

// ─── Simple Icons ───
const Ic = {
  bed: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>,
  bath: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/></svg>,
  area: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>,
  water: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>,
  heart: (f) => <svg width="17" height="17" viewBox="0 0 24 24" fill={f?C.coral:"none"} stroke={f?C.coral:"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  star: <svg width="13" height="13" viewBox="0 0 24 24" fill={C.gold} stroke={C.gold} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  anchor: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>,
  search: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  x: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ext: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  chev: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  pin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  grid: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  map: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

// ─── Dropdown ───
function Dropdown({value, options, onChange, placeholder, icon, disabled}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{position:"relative",minWidth:150}}>
      <button disabled={disabled} onClick={()=>setOpen(!open)} style={{
        display:"flex",alignItems:"center",gap:7,padding:"9px 13px",
        background:value?C.oceanPale:C.white,border:`1.5px solid ${value?C.oceanLight:C.g300}`,
        borderRadius:9,cursor:disabled?"not-allowed":"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",
        color:value?C.navy:C.g600,width:"100%",opacity:disabled?0.5:1,fontWeight:value?600:400,
      }}>
        {icon&&<span style={{display:"flex",opacity:0.6}}>{icon}</span>}
        <span style={{flex:1,textAlign:"left",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{value||placeholder}</span>
        <span style={{display:"flex",transform:open?"rotate(180deg)":"none",transition:"0.2s"}}>{Ic.chev}</span>
      </button>
      {open&&<div style={{
        position:"absolute",top:"calc(100% + 3px)",left:0,right:0,zIndex:1000,
        background:C.white,borderRadius:9,border:`1px solid ${C.g200}`,
        boxShadow:"0 12px 40px rgba(0,0,0,0.12)",maxHeight:240,overflowY:"auto",
      }}>
        {value&&<div onClick={()=>{onChange("");setOpen(false);}} style={{
          padding:"9px 13px",cursor:"pointer",fontSize:12,color:C.coral,borderBottom:`1px solid ${C.g100}`,fontStyle:"italic"
        }}>Clear</div>}
        {options.map(o=><div key={o} onClick={()=>{onChange(o);setOpen(false);}} style={{
          padding:"9px 13px",cursor:"pointer",fontSize:13,
          background:o===value?C.oceanPale:"transparent",color:o===value?C.ocean:C.g800,
          fontWeight:o===value?600:400,
        }} onMouseEnter={e=>{if(o!==value)e.target.style.background=C.g100}}
           onMouseLeave={e=>{if(o!==value)e.target.style.background="transparent"}}>{o}</div>)}
      </div>}
    </div>
  );
}

// ─── Property Card ───
function Card({p, onSelect, favs, toggleFav}) {
  const isFav = favs.has(p.id);
  const wc = WATER_COLORS[p.waterType] || WATER_COLORS.Ocean;
  return (
    <div onClick={()=>onSelect(p)} style={{
      background:C.white,borderRadius:13,overflow:"hidden",
      boxShadow:"0 2px 14px rgba(27,43,75,0.07)",cursor:"pointer",
      transition:"all 0.3s",border:`1px solid ${C.g200}`,
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 28px rgba(27,43,75,0.13)"}}
    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 14px rgba(27,43,75,0.07)"}}
    >
      <div style={{position:"relative",height:190,background:C.g200,overflow:"hidden"}}>
        <img src={p.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
        <div style={{position:"absolute",top:9,left:9,background:wc.bg,color:wc.text,padding:"3px 9px",borderRadius:5,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:3}}>
          {Ic.water} {p.waterType}
        </div>
        <button onClick={e=>{e.stopPropagation();toggleFav(p.id)}} style={{
          position:"absolute",top:9,right:9,background:"rgba(255,255,255,0.9)",border:"none",borderRadius:"50%",
          width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"
        }}>{Ic.heart(isFav)}</button>
        {p.featured&&<div style={{position:"absolute",bottom:9,left:9,background:"rgba(212,168,83,0.95)",color:C.white,padding:"2px 7px",borderRadius:4,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",gap:3,letterSpacing:"0.05em"}}>{Ic.star} FEATURED</div>}
        {p.isDemo&&<div style={{position:"absolute",bottom:9,right:9,background:"rgba(27,43,75,0.75)",color:C.white,padding:"2px 7px",borderRadius:4,fontSize:9,fontWeight:600,letterSpacing:"0.04em"}}>DEMO</div>}
      </div>
      <div style={{padding:"13px 15px",display:"flex",flexDirection:"column",gap:5}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{fontSize:20,fontWeight:800,color:C.navy,fontFamily:"'Playfair Display',serif"}}>{fmtPrice(p.price)}</div>
          <div style={{fontSize:10,color:C.g500,marginTop:4}}>{p.daysOnMarket}d</div>
        </div>
        <div style={{display:"flex",gap:12,fontSize:12,color:C.g600}}>
          <span style={{display:"flex",alignItems:"center",gap:3}}>{Ic.bed} {p.beds}</span>
          <span style={{display:"flex",alignItems:"center",gap:3}}>{Ic.bath} {p.baths}</span>
          <span style={{display:"flex",alignItems:"center",gap:3}}>{Ic.area} {p.sqft?.toLocaleString()}</span>
        </div>
        <div style={{fontSize:13,color:C.g700,fontWeight:500}}>{p.address}</div>
        <div style={{fontSize:11,color:C.g500}}>{p.county}, {p.state}</div>
        {p.waterFrontage>0&&<div style={{fontSize:11,color:C.ocean,display:"flex",alignItems:"center",gap:3,fontWeight:500}}>{Ic.anchor} {p.waterFrontage}ft waterfront</div>}
      </div>
    </div>
  );
}

// ─── Detail Modal ───
function DetailModal({p, onClose, favs, toggleFav}) {
  if(!p) return null;
  const isFav = favs.has(p.id);
  const wc = WATER_COLORS[p.waterType]||WATER_COLORS.Ocean;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(27,43,75,0.6)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:16,maxWidth:700,width:"100%",maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(27,43,75,0.25)"}}>
        <div style={{height:320,background:C.g200,position:"relative",overflow:"hidden"}}>
          <img src={p.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.9)",border:"none",borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{Ic.x}</button>
          <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(27,43,75,0.7))",padding:"36px 24px 18px"}}>
            <div style={{color:C.white,fontSize:28,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>{fmtPrice(p.price)}</div>
            <div style={{color:"rgba(255,255,255,0.9)",fontSize:15,marginTop:3}}>{p.address}, {p.county}, {p.state}</div>
          </div>
          <div style={{position:"absolute",top:12,left:12,background:wc.bg,color:wc.text,padding:"5px 12px",borderRadius:7,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4,letterSpacing:"0.05em",textTransform:"uppercase"}}>{Ic.water} {p.waterType} Front</div>
        </div>
        <div style={{padding:"20px 24px"}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
            {[{i:Ic.bed,v:p.beds,l:"Beds"},{i:Ic.bath,v:p.baths,l:"Baths"},{i:Ic.area,v:p.sqft?.toLocaleString(),l:"SqFt"},{i:Ic.anchor,v:`${p.waterFrontage||0}ft`,l:"Waterfront"},{v:p.yearBuilt,l:"Built"},{v:`${p.lotAcres||0} ac`,l:"Lot"}].map((it,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:C.g100,borderRadius:7,fontSize:12,color:C.g700}}>
                {it.i&&<span style={{color:C.ocean}}>{it.i}</span>}
                <span style={{fontWeight:600}}>{it.v}</span>
                <span style={{color:C.g500,fontSize:10}}>{it.l}</span>
              </div>
            ))}
          </div>
          <p style={{fontSize:14,lineHeight:1.7,color:C.g700,marginBottom:20}}>{p.description}</p>
          <div style={{display:"flex",gap:10}}>
            <a href={p.zillowUrl} target="_blank" rel="noopener noreferrer" style={{
              flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,
              padding:"12px 18px",background:C.navy,color:C.white,borderRadius:9,fontSize:14,fontWeight:600,textDecoration:"none",cursor:"pointer"
            }}>View on Zillow {Ic.ext}</a>
            <button onClick={()=>toggleFav(p.id)} style={{
              display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"12px 18px",
              background:isFav?"#FEF0EE":C.g100,border:`1.5px solid ${isFav?C.coral:C.g300}`,
              borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",color:isFav?C.coral:C.g700,
            }}>{Ic.heart(isFav)} {isFav?"Saved":"Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ───
function AdminPanel({properties, setProperties, onExit}) {
  const [form, setForm] = useState({
    address:"",city:"",state:"",county:"",price:"",beds:"",baths:"",sqft:"",
    lotAcres:"",waterType:"",waterFrontage:"",yearBuilt:"",description:"",
    image:"",zillowUrl:"",featured:false,
  });
  const [editing, setEditing] = useState(null);
  const fileRef = useRef(null);

  const counties = form.state ? COUNTIES_BY_STATE[form.state]||[] : [];

  const updateField = (k,v) => setForm(prev=>({...prev,[k]:v}));

  const saveProperty = () => {
    if(!form.address||!form.state||!form.waterType||!form.price) {
      alert("Please fill in at least: Address, State, Water Type, and Price");
      return;
    }
    const prop = {
      ...form,
      id: editing || `CL-${Date.now()}`,
      price: Number(form.price),
      beds: Number(form.beds)||0,
      baths: Number(form.baths)||0,
      sqft: Number(form.sqft)||0,
      lotAcres: Number(form.lotAcres)||0,
      waterFrontage: Number(form.waterFrontage)||0,
      yearBuilt: Number(form.yearBuilt)||0,
      daysOnMarket: Math.floor((Date.now() - new Date().setDate(new Date().getDate()-7))/86400000),
      image: form.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
      zillowUrl: form.zillowUrl || `https://www.zillow.com/homes/${encodeURIComponent(form.address+" "+form.state)}/`,
      featured: form.featured,
      isDemo: false,
    };

    if(editing) {
      setProperties(prev=>prev.map(p=>p.id===editing?prop:p));
    } else {
      setProperties(prev=>[prop,...prev]);
    }
    setForm({address:"",city:"",state:"",county:"",price:"",beds:"",baths:"",sqft:"",lotAcres:"",waterType:"",waterFrontage:"",yearBuilt:"",description:"",image:"",zillowUrl:"",featured:false});
    setEditing(null);
  };

  const editProp = (p) => {
    setEditing(p.id);
    setForm({...p, price:String(p.price), beds:String(p.beds), baths:String(p.baths), sqft:String(p.sqft), lotAcres:String(p.lotAcres), waterFrontage:String(p.waterFrontage), yearBuilt:String(p.yearBuilt)});
  };

  const deleteProp = (id) => {
    if(confirm("Delete this property?")) setProperties(prev=>prev.filter(p=>p.id!==id));
  };

  const exportData = () => {
    const data = JSON.stringify(properties.filter(p=>!p.isDemo), null, 2);
    const blob = new Blob([data], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="coastlist-properties.json"; a.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if(Array.isArray(data)) {
          setProperties(prev=>[...data,...prev.filter(p=>p.isDemo)]);
          alert(`Imported ${data.length} properties!`);
        }
      } catch { alert("Invalid JSON file"); }
    };
    reader.readAsText(file);
  };

  const clearDemos = () => {
    if(confirm("Remove all demo properties?")) setProperties(prev=>prev.filter(p=>!p.isDemo));
  };

  const realProps = properties.filter(p=>!p.isDemo);
  const demoProps = properties.filter(p=>p.isDemo);

  const inputStyle = {
    padding:"9px 12px",border:`1.5px solid ${C.g300}`,borderRadius:8,fontSize:13,
    fontFamily:"'DM Sans',sans-serif",color:C.g800,width:"100%",outline:"none",
    transition:"border 0.2s",
  };

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.sandLight,minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`* { box-sizing:border-box; margin:0; padding:0; }`}</style>

      {/* Admin Header */}
      <header style={{background:C.navy,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:18,fontWeight:800,color:C.white,fontFamily:"'Playfair Display',serif"}}>CoastList</div>
          <div style={{background:C.coral+"33",color:C.coral,padding:"3px 9px",borderRadius:5,fontSize:10,fontWeight:700,letterSpacing:"0.06em"}}>ADMIN</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={exportData} style={{display:"flex",alignItems:"center",gap:4,padding:"7px 12px",background:"transparent",border:`1px solid rgba(255,255,255,0.3)`,borderRadius:7,color:C.white,fontSize:12,fontWeight:600,cursor:"pointer"}}>{Ic.download} Export</button>
          <button onClick={()=>fileRef.current?.click()} style={{display:"flex",alignItems:"center",gap:4,padding:"7px 12px",background:"transparent",border:`1px solid rgba(255,255,255,0.3)`,borderRadius:7,color:C.white,fontSize:12,fontWeight:600,cursor:"pointer"}}>{Ic.upload} Import</button>
          <input ref={fileRef} type="file" accept=".json" onChange={importData} style={{display:"none"}}/>
          <button onClick={onExit} style={{display:"flex",alignItems:"center",gap:4,padding:"7px 12px",background:C.seafoam,border:"none",borderRadius:7,color:C.navy,fontSize:12,fontWeight:700,cursor:"pointer"}}>View Live Site</button>
        </div>
      </header>

      <div style={{maxWidth:900,margin:"0 auto",padding:24}}>
        {/* Stats */}
        <div style={{display:"flex",gap:12,marginBottom:20}}>
          {[{l:"Total Live",v:realProps.length,c:C.navy},{l:"Demo",v:demoProps.length,c:C.g500},{l:"Featured",v:properties.filter(p=>p.featured).length,c:C.gold}].map((s,i)=>(
            <div key={i} style={{flex:1,background:C.white,borderRadius:10,padding:"14px 18px",border:`1px solid ${C.g200}`}}>
              <div style={{fontSize:10,fontWeight:600,color:C.g500,letterSpacing:"0.06em"}}>{s.l}</div>
              <div style={{fontSize:24,fontWeight:800,color:s.c,fontFamily:"'Playfair Display',serif"}}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        <div style={{background:C.white,borderRadius:13,padding:20,border:`1px solid ${C.g200}`,marginBottom:24}}>
          <div style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:14,display:"flex",alignItems:"center",gap:7}}>
            {Ic.plus} {editing?"Edit Property":"Add New Property"}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>Zillow URL</label>
              <input placeholder="https://www.zillow.com/homedetails/..." value={form.zillowUrl} onChange={e=>updateField("zillowUrl",e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>Address *</label>
              <input placeholder="123 Oceanview Dr" value={form.address} onChange={e=>updateField("address",e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>City</label>
              <input placeholder="Miami Beach" value={form.city} onChange={e=>updateField("city",e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>State *</label>
              <Dropdown value={form.state} options={STATES} onChange={v=>{updateField("state",v);updateField("county","")}} placeholder="Select state" icon={Ic.pin}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>County</label>
              <Dropdown value={form.county} options={counties} onChange={v=>updateField("county",v)} placeholder={form.state?"Select county":"Pick state first"} disabled={!form.state}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>Price *</label>
              <input type="number" placeholder="2500000" value={form.price} onChange={e=>updateField("price",e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>Water Type *</label>
              <Dropdown value={form.waterType} options={WATER_TYPES} onChange={v=>updateField("waterType",v)} placeholder="Select type" icon={Ic.water}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>Beds</label>
              <input type="number" placeholder="4" value={form.beds} onChange={e=>updateField("beds",e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>Baths</label>
              <input type="number" placeholder="3" value={form.baths} onChange={e=>updateField("baths",e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>Sq Ft</label>
              <input type="number" placeholder="3200" value={form.sqft} onChange={e=>updateField("sqft",e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>Water Frontage (ft)</label>
              <input type="number" placeholder="180" value={form.waterFrontage} onChange={e=>updateField("waterFrontage",e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>Lot Acres</label>
              <input type="number" step="0.01" placeholder="0.82" value={form.lotAcres} onChange={e=>updateField("lotAcres",e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>Year Built</label>
              <input type="number" placeholder="2018" value={form.yearBuilt} onChange={e=>updateField("yearBuilt",e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>Image URL</label>
              <input placeholder="https://images.unsplash.com/..." value={form.image} onChange={e=>updateField("image",e.target.value)} style={inputStyle}/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{fontSize:11,fontWeight:600,color:C.g600,marginBottom:3,display:"block"}}>Description</label>
              <textarea placeholder="Stunning waterfront estate with..." value={form.description} onChange={e=>updateField("description",e.target.value)} rows={3} style={{...inputStyle,resize:"vertical"}}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <input type="checkbox" checked={form.featured} onChange={e=>updateField("featured",e.target.checked)} id="feat"/>
              <label htmlFor="feat" style={{fontSize:13,color:C.g700,fontWeight:500,cursor:"pointer"}}>Featured listing</label>
            </div>
          </div>

          <div style={{display:"flex",gap:10,marginTop:16}}>
            <button onClick={saveProperty} style={{
              display:"flex",alignItems:"center",gap:5,padding:"10px 20px",
              background:C.green,color:C.white,border:"none",borderRadius:9,fontSize:14,fontWeight:700,cursor:"pointer"
            }}>{Ic.check} {editing?"Update":"Add Property"}</button>
            {editing&&<button onClick={()=>{setEditing(null);setForm({address:"",city:"",state:"",county:"",price:"",beds:"",baths:"",sqft:"",lotAcres:"",waterType:"",waterFrontage:"",yearBuilt:"",description:"",image:"",zillowUrl:"",featured:false})}} style={{
              padding:"10px 20px",background:C.g100,color:C.g700,border:`1px solid ${C.g300}`,borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer"
            }}>Cancel</button>}
          </div>
        </div>

        {/* Property List */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:15,fontWeight:700,color:C.navy}}>Properties ({properties.length})</div>
          {demoProps.length>0&&<button onClick={clearDemos} style={{fontSize:12,color:C.coral,background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Remove all demos</button>}
        </div>

        {properties.map(p=>(
          <div key={p.id} style={{
            display:"flex",alignItems:"center",gap:12,padding:12,background:C.white,
            borderRadius:10,border:`1px solid ${C.g200}`,marginBottom:8,
          }}>
            <img src={p.image} alt="" style={{width:70,height:50,objectFit:"cover",borderRadius:6,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:700,color:C.navy}}>{fmtPrice(p.price)}</div>
              <div style={{fontSize:12,color:C.g600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.address}, {p.county}, {p.state}</div>
            </div>
            <div style={{
              padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:700,
              background:(WATER_COLORS[p.waterType]||WATER_COLORS.Ocean).bg,color:"#fff",
              letterSpacing:"0.04em",textTransform:"uppercase",flexShrink:0,
            }}>{p.waterType}</div>
            {p.isDemo&&<span style={{fontSize:10,color:C.g500,fontWeight:600}}>DEMO</span>}
            {p.featured&&<span style={{color:C.gold}}>{Ic.star}</span>}
            <button onClick={()=>editProp(p)} style={{background:C.g100,border:`1px solid ${C.g300}`,borderRadius:6,padding:"5px 10px",fontSize:11,fontWeight:600,cursor:"pointer",color:C.g700}}>Edit</button>
            <button onClick={()=>deleteProp(p.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.coral,display:"flex"}}>{Ic.trash}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function CoastList() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [properties, setProperties] = useState(DEMO_PROPERTIES);
  const [selState, setSelState] = useState("");
  const [selCounty, setSelCounty] = useState("");
  const [selWater, setSelWater] = useState("");
  const [search, setSearch] = useState("");
  const [selProp, setSelProp] = useState(null);
  const [favs, setFavs] = useState(new Set());
  const [showHero, setShowHero] = useState(true);
  const [view, setView] = useState("grid");
  const listRef = useRef(null);

  // Check URL for admin mode & load saved properties
  useEffect(() => {
    if(typeof window !== "undefined") {
      if(window.location.search.includes("admin=true")) setIsAdmin(true);
      const saved = localStorage.getItem("coastlist-properties");
      if(saved) {
        try { setProperties(JSON.parse(saved)); } catch {}
      }
    }
  }, []);

  // Save properties to localStorage whenever they change
  useEffect(() => {
    if(typeof window !== "undefined") {
      localStorage.setItem("coastlist-properties", JSON.stringify(properties));
    }
  }, [properties]);

  const counties = selState ? COUNTIES_BY_STATE[selState]||[] : [];

  const filtered = useMemo(() => {
    return properties.filter(p => {
      if(selState && p.state !== selState) return false;
      if(selCounty && p.county !== selCounty) return false;
      if(selWater && p.waterType !== selWater) return false;
      if(search) {
        const q = search.toLowerCase();
        return p.address?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q) || p.state?.toLowerCase().includes(q) || p.county?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [properties, selState, selCounty, selWater, search]);

  const toggleFav = useCallback((id) => {
    setFavs(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  }, []);

  useEffect(() => {
    if(!selState || !COUNTIES_BY_STATE[selState]?.includes(selCounty)) setSelCounty("");
  }, [selState]);

  const scrollToList = () => {
    setShowHero(false);
    setTimeout(()=>listRef.current?.scrollIntoView({behavior:"smooth"}),50);
  };

  if(isAdmin) return <AdminPanel properties={properties} setProperties={setProperties} onExit={()=>setIsAdmin(false)}/>;

  const activeFilters = [selState,selCounty,selWater].filter(Boolean).length;

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.sandLight,minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes waveSlide{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${C.g300};border-radius:10px}
        *{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none}
      `}</style>

      {/* Header */}
      <header style={{
        display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 24px",
        background:showHero?"transparent":C.white,borderBottom:showHero?"none":`1px solid ${C.g200}`,
        position:showHero?"absolute":"sticky",top:0,left:0,right:0,zIndex:1000,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setShowHero(true)}>
          <div style={{fontSize:20,fontWeight:800,color:showHero?C.white:C.navy,fontFamily:"'Playfair Display',serif"}}>CoastList</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {favs.size>0&&<div style={{display:"flex",alignItems:"center",gap:3,fontSize:12,color:showHero?C.white:C.coral,fontWeight:600}}>{Ic.heart(true)} {favs.size}</div>}
        </div>
      </header>

      {/* Hero */}
      {showHero&&(
        <div style={{position:"relative",background:`linear-gradient(145deg,${C.navy} 0%,#1E3A5F 40%,${C.ocean} 100%)`,padding:"80px 40px 100px",overflow:"hidden",textAlign:"center"}}>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:180,overflow:"hidden",opacity:0.06,pointerEvents:"none"}}>
            <svg viewBox="0 0 1440 200" style={{position:"absolute",bottom:0,width:"200%",animation:"waveSlide 12s linear infinite"}}>
              <path d="M0,100 C320,180 440,20 720,100 C1000,180 1120,20 1440,100 C1760,180 1880,20 2160,100 L2160,200 L0,200 Z" fill={C.navy}/>
            </svg>
          </div>
          <div style={{position:"relative",zIndex:1,maxWidth:660,margin:"0 auto"}}>
            <div style={{fontSize:13,letterSpacing:"0.25em",color:C.seafoam,fontWeight:600,textTransform:"uppercase",marginBottom:14}}>Waterfront Living, Curated</div>
            <h1 style={{fontSize:"clamp(34px,5vw,52px)",fontWeight:800,color:C.white,lineHeight:1.1,fontFamily:"'Playfair Display',serif",margin:"0 0 18px"}}>
              Discover Your <span style={{color:C.seafoam}}>Waterfront</span> Dream Home
            </h1>
            <p style={{fontSize:"clamp(14px,2vw,17px)",color:"rgba(255,255,255,0.7)",lineHeight:1.6,maxWidth:500,margin:"0 auto 32px"}}>
              Every property in our collection borders a river, lake, ocean, or waterway.
            </p>
            <button onClick={scrollToList} style={{
              padding:"14px 36px",background:C.seafoam,color:C.navy,border:"none",borderRadius:11,
              fontSize:15,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:7,
              boxShadow:"0 4px 20px rgba(124,197,184,0.4)",
            }}>{Ic.search} Explore Properties</button>
          </div>
        </div>
      )}

      {/* Main */}
      <div ref={listRef} style={{maxWidth:1400,margin:"0 auto",padding:"0 22px 40px"}}>
        {/* Filters */}
        <div style={{position:"sticky",top:showHero?0:58,zIndex:500,background:"rgba(245,239,230,0.95)",backdropFilter:"blur(12px)",padding:"14px 0",marginBottom:18,borderBottom:`1px solid ${C.sandDark}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,padding:"9px 12px",background:C.white,border:`1.5px solid ${C.g300}`,borderRadius:9,flex:"1 1 180px",maxWidth:260}}>
              {Ic.search}
              <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{border:"none",outline:"none",flex:1,fontSize:13,fontFamily:"'DM Sans',sans-serif",background:"transparent",color:C.g800}}/>
              {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",color:C.g500}}>{Ic.x}</button>}
            </div>
            <Dropdown value={selState} options={STATES} onChange={setSelState} placeholder="All States" icon={Ic.pin}/>
            <Dropdown value={selCounty} options={counties} onChange={setSelCounty} placeholder={selState?"All Counties":"State first"} disabled={!selState}/>
            <div style={{width:1,height:26,background:C.g300,flexShrink:0}}/>
            <Dropdown value={selWater} options={WATER_TYPES} onChange={setSelWater} placeholder="All Water" icon={Ic.water}/>
            <div style={{flex:1}}/>
            {activeFilters>0&&<button onClick={()=>{setSelState("");setSelCounty("");setSelWater("");setSearch("")}} style={{display:"flex",alignItems:"center",gap:3,padding:"7px 12px",background:C.coralLight+"22",border:`1px solid ${C.coral}33`,borderRadius:7,fontSize:11,fontWeight:600,color:C.coral,cursor:"pointer"}}>Clear {activeFilters} {Ic.x}</button>}
            <div style={{display:"flex",background:C.white,borderRadius:9,border:`1.5px solid ${C.g300}`,overflow:"hidden"}}>
              {[{k:"grid",i:Ic.grid,l:"Grid"},{k:"map",i:Ic.map,l:"Map"}].map(v=>(
                <button key={v.k} onClick={()=>setView(v.k)} style={{display:"flex",alignItems:"center",gap:4,padding:"7px 12px",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",background:view===v.k?C.navy:"transparent",color:view===v.k?C.white:C.g600,fontFamily:"'DM Sans',sans-serif"}}>{v.i} {v.l}</button>
              ))}
            </div>
          </div>
          <div style={{marginTop:8,fontSize:12,color:C.g600}}>
            <span style={{fontWeight:700,color:C.navy}}>{filtered.length}</span> waterfront {filtered.length===1?"property":"properties"}
            {selState&&<span> in <strong>{selState}</strong></span>}
            {selWater&&<span> · <span style={{color:(WATER_COLORS[selWater]||{}).bg,fontWeight:600}}>{selWater}</span></span>}
          </div>
        </div>

        {/* Grid */}
        {filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"50px 20px",color:C.g500}}>
            <div style={{fontSize:44,marginBottom:10}}>🌊</div>
            <div style={{fontSize:17,fontWeight:600,color:C.g700,marginBottom:6}}>No properties found</div>
            <div style={{fontSize:13}}>Try adjusting your filters.</div>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:18}}>
            {filtered.map(p=><Card key={p.id} p={p} onSelect={setSelProp} favs={favs} toggleFav={toggleFav}/>)}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{background:C.navy,color:"rgba(255,255,255,0.5)",padding:"32px 24px",textAlign:"center",fontSize:12,lineHeight:1.8}}>
        <div style={{fontSize:18,fontWeight:800,color:C.white,fontFamily:"'Playfair Display',serif",marginBottom:10,opacity:0.7}}>CoastList</div>
        <div style={{maxWidth:460,margin:"0 auto 16px"}}>Curating waterfront properties where property lines border rivers, lakes, oceans, and waterways.</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>© {new Date().getFullYear()} CoastList.com — All rights reserved</div>
      </footer>

      {/* Detail Modal */}
      {selProp&&<DetailModal p={selProp} onClose={()=>setSelProp(null)} favs={favs} toggleFav={toggleFav}/>}
    </div>
  );
}
