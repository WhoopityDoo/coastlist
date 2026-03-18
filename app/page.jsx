"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/*
╔══════════════════════════════════════════════════════════════╗
║  COASTLIST.COM v4 — Auto-Fetch from Zillow URL              ║
║                                                              ║
║  PUBLIC:  coastlist.com       → Browse properties            ║
║  ADMIN:   coastlist.com?admin=true → Paste Zillow URL,      ║
║           auto-fetch all data, select water type, publish    ║
╚══════════════════════════════════════════════════════════════╝
*/

const C={navy:"#1B2B4B",navyLight:"#2A3F6B",sand:"#F5EFE6",sandDark:"#E8DFD0",sandLight:"#FAF7F2",ocean:"#2E6B8A",oceanLight:"#4A9CB8",oceanPale:"#E8F4F8",seafoam:"#7CC5B8",coral:"#E87461",gold:"#D4A853",white:"#FFFFFF",g100:"#F8F9FA",g200:"#E9ECEF",g300:"#DEE2E6",g400:"#CED4DA",g500:"#ADB5BD",g600:"#6C757D",g700:"#495057",g800:"#343A40",green:"#2D9F6F",greenBg:"#E6F7EF",redBg:"#FEF0EE"};

const WATER_TYPES=["Ocean","River","Lake","Pond"];
const WC={Ocean:{bg:"#1B4B7A",t:"#fff"},River:{bg:"#2E7D6B",t:"#fff"},Lake:{bg:"#3A6EA5",t:"#fff"},Pond:{bg:"#5B8C7A",t:"#fff"}};

const fmtP=(p)=>`$${p.toLocaleString()}`;

// Icons
const I={
  bed:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>,
  bath:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/></svg>,
  area:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>,
  water:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>,
  heart:(f)=><svg width="17" height="17" viewBox="0 0 24 24" fill={f?C.coral:"none"} stroke={f?C.coral:"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  star:<svg width="13" height="13" viewBox="0 0 24 24" fill={C.gold} stroke={C.gold} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  anchor:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>,
  search:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  x:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chev:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  pin:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  back:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  share:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  cal:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  ruler:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/></svg>,
  chevL:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevR:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  check:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  plus:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  link:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  load:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>,
  trash:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  download:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  upload:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
};

// ─── Property Card ───
function Card({p,onSelect,favs,toggleFav}){
  const isFav=favs.has(p.id);const wc=WC[p.waterType]||WC.Ocean;
  return(<div onClick={()=>onSelect(p)} style={{background:C.white,borderRadius:13,overflow:"hidden",boxShadow:"0 2px 14px rgba(27,43,75,0.07)",cursor:"pointer",transition:"all 0.3s",border:`1px solid ${C.g200}`}}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 28px rgba(27,43,75,0.13)"}}
    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 14px rgba(27,43,75,0.07)"}}>
    <div style={{position:"relative",height:190,background:C.g200,overflow:"hidden"}}>
      <img src={(p.images&&p.images[0])||p.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy" onError={e=>{e.target.src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop"}}/>
      <div style={{position:"absolute",top:9,left:9,background:wc.bg,color:wc.t,padding:"3px 9px",borderRadius:5,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:3}}>{I.water} {p.waterType}</div>
      <button onClick={e=>{e.stopPropagation();toggleFav(p.id)}} style={{position:"absolute",top:9,right:9,background:"rgba(255,255,255,0.9)",border:"none",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{I.heart(isFav)}</button>
      {p.featured&&<div style={{position:"absolute",bottom:9,left:9,background:"rgba(212,168,83,0.95)",color:C.white,padding:"2px 7px",borderRadius:4,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",gap:3}}>{I.star} FEATURED</div>}
    </div>
    <div style={{padding:"13px 15px",display:"flex",flexDirection:"column",gap:5}}>
      <div style={{fontSize:20,fontWeight:800,color:C.navy,fontFamily:"'Playfair Display',serif"}}>{fmtP(p.price)}</div>
      <div style={{display:"flex",gap:12,fontSize:12,color:C.g600}}>
        {p.beds>0&&<span style={{display:"flex",alignItems:"center",gap:3}}>{I.bed} {p.beds}</span>}
        {p.baths>0&&<span style={{display:"flex",alignItems:"center",gap:3}}>{I.bath} {p.baths}</span>}
        {p.sqft>0&&<span style={{display:"flex",alignItems:"center",gap:3}}>{I.area} {p.sqft?.toLocaleString()}</span>}
      </div>
      <div style={{fontSize:13,color:C.g700,fontWeight:500}}>{p.address}</div>
      <div style={{fontSize:11,color:C.g500}}>{p.city}{p.city&&p.state?", ":""}{p.state}</div>
      {p.waterFrontage>0&&<div style={{fontSize:11,color:C.ocean,display:"flex",alignItems:"center",gap:3,fontWeight:500}}>{I.anchor} {p.waterFrontage}ft waterfront</div>}
    </div>
  </div>);
}

// ─── Full Page Property Detail ───
function PropertyPage({p,onBack,favs,toggleFav,allProperties,onSelect}){
  const[imgIdx,setImgIdx]=useState(0);
  const isFav=favs.has(p.id);const wc=WC[p.waterType]||WC.Ocean;
  const imgs=p.images&&p.images.length>0?p.images:[p.image||"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop"];
  const similar=allProperties.filter(op=>op.id!==p.id&&op.waterType===p.waterType).slice(0,3);
  useEffect(()=>{window.scrollTo({top:0,behavior:"smooth"});setImgIdx(0)},[p.id]);

  return(<div style={{minHeight:"100vh",background:C.sandLight}}>
    <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(245,239,230,0.96)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.sandDark}`,padding:"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:C.navy,fontFamily:"'DM Sans',sans-serif"}}>{I.back} All Properties</button>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>toggleFav(p.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",background:isFav?C.redBg:C.white,border:`1.5px solid ${isFav?C.coral+"55":C.g300}`,borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",color:isFav?C.coral:C.g700}}>{I.heart(isFav)} {isFav?"Saved":"Save"}</button>
        <button onClick={()=>{if(navigator.share)navigator.share({title:p.address,url:window.location.href}).catch(()=>{});else{navigator.clipboard?.writeText(window.location.href);alert("Link copied!")}}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",background:C.white,border:`1.5px solid ${C.g300}`,borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",color:C.g700}}>{I.share} Share</button>
      </div>
    </div>
    <div style={{maxWidth:1000,margin:"0 auto",padding:"24px 24px 60px"}}>
      {/* Image gallery */}
      <div style={{position:"relative",borderRadius:16,overflow:"hidden",height:"clamp(300px,50vw,480px)",background:C.g200,marginBottom:24}}>
        <img src={imgs[imgIdx]} alt={p.address} style={{width:"100%",height:"100%",objectFit:"cover",transition:"opacity 0.3s"}} onError={e=>{e.target.src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop"}}/>
        {imgs.length>1&&<>
          <button onClick={()=>setImgIdx((imgIdx-1+imgs.length)%imgs.length)} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.9)",border:"none",borderRadius:"50%",width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 10px rgba(0,0,0,0.15)"}}>{I.chevL}</button>
          <button onClick={()=>setImgIdx((imgIdx+1)%imgs.length)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.9)",border:"none",borderRadius:"50%",width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 10px rgba(0,0,0,0.15)"}}>{I.chevR}</button>
          <div style={{position:"absolute",bottom:14,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6}}>
            {imgs.map((_,i)=><div key={i} onClick={()=>setImgIdx(i)} style={{width:i===imgIdx?24:8,height:8,borderRadius:4,background:i===imgIdx?"white":"rgba(255,255,255,0.5)",cursor:"pointer",transition:"all 0.3s"}}/>)}
          </div>
          <div style={{position:"absolute",top:14,right:14,background:"rgba(0,0,0,0.5)",color:"white",padding:"4px 10px",borderRadius:6,fontSize:12,fontWeight:600}}>{imgIdx+1} / {imgs.length}</div>
        </>}
        <div style={{position:"absolute",top:14,left:14,background:wc.bg,color:wc.t,padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:5,letterSpacing:"0.05em",textTransform:"uppercase"}}>{I.water} {p.waterType} Front</div>
      </div>
      {/* Price & Address */}
      <div style={{marginBottom:24}}>
        <div style={{fontSize:"clamp(28px,4vw,38px)",fontWeight:800,color:C.navy,fontFamily:"'Playfair Display',serif"}}>{fmtP(p.price)}</div>
        <div style={{fontSize:17,color:C.g700,fontWeight:500,marginTop:4}}>{p.address}</div>
        <div style={{fontSize:14,color:C.g500,marginTop:2}}>{p.city}{p.city&&", "}{p.state} {p.zipcode||""}</div>
      </div>
      {/* Stats */}
      <div style={{display:"flex",gap:0,marginBottom:28,borderRadius:12,overflow:"hidden",border:`1px solid ${C.g200}`,flexWrap:"wrap"}}>
        {[{icon:I.bed,val:p.beds,label:"Beds"},{icon:I.bath,val:p.baths,label:"Baths"},{icon:I.area,val:p.sqft?.toLocaleString(),label:"Sq Ft"},{icon:I.anchor,val:`${p.waterFrontage||"—"}`,label:"Frontage"},{icon:I.ruler,val:`${p.lotAcres||"—"}`,label:"Acres"},{icon:I.cal,val:p.yearBuilt||"—",label:"Built"}].filter(s=>s.val&&s.val!=="0"&&s.val!=="—").map((s,i,arr)=>(
          <div key={i} style={{flex:"1 1 120px",padding:"16px 12px",background:C.white,textAlign:"center",borderRight:i<arr.length-1?`1px solid ${C.g200}`:"none"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:6,color:C.ocean}}>{s.icon}</div>
            <div style={{fontSize:18,fontWeight:800,color:C.navy,fontFamily:"'Playfair Display',serif"}}>{s.val}</div>
            <div style={{fontSize:10,color:C.g500,fontWeight:600,marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Description */}
      <div style={{background:C.white,borderRadius:14,padding:"24px 28px",border:`1px solid ${C.g200}`,marginBottom:24}}>
        <h2 style={{fontSize:20,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif",marginBottom:14}}>About This Property</h2>
        <p style={{fontSize:15,lineHeight:1.8,color:C.g700,whiteSpace:"pre-line"}}>{p.description||"Contact us for more details about this waterfront property."}</p>
        {p.features&&p.features.length>0&&<div style={{marginTop:20}}>
          <div style={{fontSize:12,fontWeight:700,color:C.g500,letterSpacing:"0.06em",marginBottom:10}}>FEATURES</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {p.features.map((f,i)=><span key={i} style={{padding:"6px 14px",background:C.oceanPale,borderRadius:8,fontSize:13,color:C.ocean,fontWeight:500}}>{f}</span>)}
          </div>
        </div>}
      </div>
      {/* Waterfront Info */}
      <div style={{background:`linear-gradient(135deg,${C.navy} 0%,${C.ocean} 100%)`,borderRadius:14,padding:"24px 28px",marginBottom:24,color:C.white}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>{I.anchor}<span style={{fontSize:16,fontWeight:700,fontFamily:"'Playfair Display',serif"}}>Waterfront Details</span></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
          <div><div style={{fontSize:11,opacity:0.7,fontWeight:600}}>TYPE</div><div style={{fontSize:18,fontWeight:700,marginTop:2}}>{p.waterType}</div></div>
          <div><div style={{fontSize:11,opacity:0.7,fontWeight:600}}>FRONTAGE</div><div style={{fontSize:18,fontWeight:700,marginTop:2}}>{p.waterFrontage||"Contact for details"} {p.waterFrontage?"ft":""}</div></div>
          <div><div style={{fontSize:11,opacity:0.7,fontWeight:600}}>LISTING ID</div><div style={{fontSize:14,fontWeight:600,marginTop:4,opacity:0.8}}>{p.id}</div></div>
        </div>
      </div>
      {/* Ad placeholder */}
      <div style={{background:C.g100,borderRadius:12,padding:20,marginBottom:28,textAlign:"center",border:`1px dashed ${C.g300}`}}>
        <div style={{fontSize:11,color:C.g400,fontWeight:600,letterSpacing:"0.08em"}}>ADVERTISEMENT</div>
      </div>
      {/* Similar */}
      {similar.length>0&&<div>
        <h2 style={{fontSize:20,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif",marginBottom:16}}>Similar {p.waterType}front Properties</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
          {similar.map(sp=><Card key={sp.id} p={sp} onSelect={onSelect} favs={favs} toggleFav={toggleFav}/>)}
        </div>
      </div>}
    </div>
  </div>);
}

// ─── ADMIN PANEL with URL Fetch ───
function Admin({properties,setProperties,onExit}){
  const[zillowUrl,setZillowUrl]=useState("");
  const[fetching,setFetching]=useState(false);
  const[fetchError,setFetchError]=useState("");
  const[fetchedData,setFetchedData]=useState(null);
  const[waterType,setWaterType]=useState("");
  const[waterFrontage,setWaterFrontage]=useState("");
  const[featured,setFeatured]=useState(false);
  const fileRef=useRef(null);

  const fetchListing=async()=>{
    if(!zillowUrl.includes("zillow.com/homedetails")){setFetchError("Please paste a Zillow listing URL (must contain /homedetails/)");return}
    setFetching(true);setFetchError("");setFetchedData(null);
    try{
      const res=await fetch("/api/fetch-listing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:zillowUrl})});
      const data=await res.json();
      if(data.error){setFetchError(data.error);if(data.partial)setFetchedData(data.partial)}
      else if(data.property){setFetchedData(data.property);setFetchError("")}
    }catch(e){setFetchError("Failed to fetch. Make sure the URL is correct and try again.")}
    setFetching(false);
  };

  const addProperty=()=>{
    if(!fetchedData){setFetchError("Fetch a listing first");return}
    if(!waterType){setFetchError("Please select a Water Type");return}
    const prop={
      ...fetchedData,
      id:`CL-${Date.now()}`,
      waterType,
      waterFrontage:Number(waterFrontage)||0,
      featured,
      daysOnMarket:1,
      image:fetchedData.images?.[0]||"",
    };
    setProperties(prev=>[prop,...prev]);
    setZillowUrl("");setFetchedData(null);setWaterType("");setWaterFrontage("");setFeatured(false);setFetchError("");
  };

  const deleteProp=id=>{if(confirm("Delete this property?"))setProperties(p=>p.filter(x=>x.id!==id))};

  const exportD=()=>{const d=JSON.stringify(properties,null,2);const b=new Blob([d],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="coastlist-properties.json";a.click()};
  const importD=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);if(Array.isArray(d)){setProperties(prev=>[...d,...prev]);alert(`Imported ${d.length} properties!`)}}catch{alert("Invalid JSON")}};r.readAsText(f)};

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.sandLight,minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <header style={{background:C.navy,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:18,fontWeight:800,color:C.white,fontFamily:"'Playfair Display',serif"}}>CoastList</div>
          <div style={{background:C.coral+"33",color:C.coral,padding:"3px 9px",borderRadius:5,fontSize:10,fontWeight:700}}>ADMIN</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={exportD} style={{display:"flex",alignItems:"center",gap:4,padding:"7px 12px",background:"transparent",border:"1px solid rgba(255,255,255,0.3)",borderRadius:7,color:C.white,fontSize:12,fontWeight:600,cursor:"pointer"}}>{I.download} Export</button>
          <button onClick={()=>fileRef.current?.click()} style={{display:"flex",alignItems:"center",gap:4,padding:"7px 12px",background:"transparent",border:"1px solid rgba(255,255,255,0.3)",borderRadius:7,color:C.white,fontSize:12,fontWeight:600,cursor:"pointer"}}>{I.upload} Import</button>
          <input ref={fileRef} type="file" accept=".json" onChange={importD} style={{display:"none"}}/>
          <button onClick={onExit} style={{padding:"7px 12px",background:C.seafoam,border:"none",borderRadius:7,color:C.navy,fontSize:12,fontWeight:700,cursor:"pointer"}}>View Live Site</button>
        </div>
      </header>

      <div style={{maxWidth:900,margin:"0 auto",padding:24}}>
        {/* Step 1: Paste URL */}
        <div style={{background:C.white,borderRadius:14,padding:24,border:`1px solid ${C.g200}`,marginBottom:20}}>
          <div style={{fontSize:18,fontWeight:700,color:C.navy,marginBottom:4,fontFamily:"'Playfair Display',serif",display:"flex",alignItems:"center",gap:8}}>{I.link} Add Property from Zillow</div>
          <div style={{fontSize:13,color:C.g500,marginBottom:16}}>Paste a Zillow listing URL and we'll pull in all the details automatically.</div>

          <div style={{display:"flex",gap:10,marginBottom:12}}>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"11px 14px",background:C.g100,border:`1.5px solid ${C.g300}`,borderRadius:10}}>
              {I.link}
              <input value={zillowUrl} onChange={e=>setZillowUrl(e.target.value)} placeholder="https://www.zillow.com/homedetails/123-Main-St..." style={{border:"none",outline:"none",flex:1,fontSize:14,fontFamily:"'DM Sans',sans-serif",background:"transparent",color:C.g800}} onKeyDown={e=>{if(e.key==="Enter")fetchListing()}}/>
              {zillowUrl&&<button onClick={()=>{setZillowUrl("");setFetchedData(null);setFetchError("")}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",color:C.g500}}>{I.x}</button>}
            </div>
            <button onClick={fetchListing} disabled={fetching} style={{display:"flex",alignItems:"center",gap:6,padding:"11px 24px",background:fetching?C.g400:C.ocean,color:C.white,border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:fetching?"wait":"pointer",whiteSpace:"nowrap",minWidth:120,justifyContent:"center"}}>
              {fetching?<><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>{I.load}</span> Fetching...</>:<>{I.search} Fetch Listing</>}
            </button>
          </div>

          {fetchError&&<div style={{padding:"10px 14px",background:C.redBg,borderRadius:8,fontSize:13,color:C.coral,marginBottom:12}}>{fetchError}</div>}

          {/* Step 2: Preview fetched data */}
          {fetchedData&&(
            <div style={{border:`2px solid ${C.green}44`,borderRadius:12,overflow:"hidden",marginTop:8}}>
              <div style={{background:C.greenBg,padding:"10px 16px",fontSize:13,fontWeight:700,color:C.green,display:"flex",alignItems:"center",gap:6}}>{I.check} Listing data fetched successfully!</div>

              {/* Image preview */}
              {fetchedData.images&&fetchedData.images.length>0&&(
                <div style={{display:"flex",gap:4,padding:12,overflowX:"auto",background:C.g100}}>
                  {fetchedData.images.map((img,i)=>(
                    <img key={i} src={img} alt="" style={{width:140,height:95,objectFit:"cover",borderRadius:8,flexShrink:0}} onError={e=>{e.target.style.display="none"}}/>
                  ))}
                </div>
              )}

              {/* Property summary */}
              <div style={{padding:16}}>
                <div style={{fontSize:22,fontWeight:800,color:C.navy,fontFamily:"'Playfair Display',serif"}}>{fetchedData.price?fmtP(fetchedData.price):"Price not found"}</div>
                <div style={{fontSize:15,color:C.g700,fontWeight:500,marginTop:4}}>{fetchedData.address}</div>
                <div style={{fontSize:13,color:C.g500,marginTop:2}}>{fetchedData.city}{fetchedData.city&&fetchedData.state?", ":""}{fetchedData.state} {fetchedData.zipcode||""}</div>

                <div style={{display:"flex",gap:16,marginTop:12,fontSize:13,color:C.g600}}>
                  {fetchedData.beds>0&&<span>{fetchedData.beds} Beds</span>}
                  {fetchedData.baths>0&&<span>{fetchedData.baths} Baths</span>}
                  {fetchedData.sqft>0&&<span>{fetchedData.sqft.toLocaleString()} SqFt</span>}
                  {fetchedData.lotAcres>0&&<span>{fetchedData.lotAcres} Acres</span>}
                  {fetchedData.yearBuilt>0&&<span>Built {fetchedData.yearBuilt}</span>}
                </div>

                {fetchedData.description&&(
                  <div style={{marginTop:12,fontSize:13,color:C.g600,lineHeight:1.6,maxHeight:80,overflow:"hidden"}}>{fetchedData.description.substring(0,200)}...</div>
                )}

                {fetchedData.features&&fetchedData.features.length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
                    {fetchedData.features.map((f,i)=><span key={i} style={{padding:"3px 8px",background:C.oceanPale,borderRadius:5,fontSize:11,color:C.ocean,fontWeight:500}}>{f}</span>)}
                  </div>
                )}

                {fetchedData.images?.length>0&&<div style={{marginTop:8,fontSize:11,color:C.g500}}>{fetchedData.images.length} photos loaded</div>}
              </div>

              {/* Step 3: Select water type and add */}
              <div style={{padding:"16px",borderTop:`1px solid ${C.g200}`,background:C.g100}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:10}}>Before publishing — classify the waterfront:</div>
                <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{display:"flex",gap:6}}>
                    {WATER_TYPES.map(wt=>(
                      <button key={wt} onClick={()=>setWaterType(wt)} style={{
                        padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",
                        border:waterType===wt?`2px solid ${WC[wt].bg}`:`2px solid ${C.g300}`,
                        background:waterType===wt?WC[wt].bg:"white",
                        color:waterType===wt?"white":C.g700,
                        transition:"all 0.2s",
                      }}>{wt}</button>
                    ))}
                  </div>
                  <input type="number" placeholder="Frontage (ft)" value={waterFrontage} onChange={e=>setWaterFrontage(e.target.value)} style={{padding:"8px 12px",border:`1.5px solid ${C.g300}`,borderRadius:8,fontSize:13,width:120,fontFamily:"'DM Sans',sans-serif"}}/>
                  <label style={{display:"flex",alignItems:"center",gap:4,fontSize:13,color:C.g700,cursor:"pointer"}}>
                    <input type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)}/> Featured
                  </label>
                  <div style={{flex:1}}/>
                  <button onClick={addProperty} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 24px",background:C.green,color:C.white,border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"}}>{I.check} Publish to CoastList</button>
                </div>
                {!waterType&&<div style={{fontSize:11,color:C.coral,marginTop:6}}>← Select a water type to publish</div>}
              </div>
            </div>
          )}
        </div>

        {/* Properties list */}
        <div style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:12,fontFamily:"'Playfair Display',serif"}}>Published Properties ({properties.length})</div>
        {properties.length===0&&<div style={{textAlign:"center",padding:40,color:C.g500,background:C.white,borderRadius:12,border:`1px solid ${C.g200}`}}>No properties yet. Paste a Zillow URL above to add your first listing.</div>}
        {properties.map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:12,background:C.white,borderRadius:10,border:`1px solid ${C.g200}`,marginBottom:8}}>
            <img src={(p.images&&p.images[0])||p.image} alt="" style={{width:80,height:55,objectFit:"cover",borderRadius:6,flexShrink:0}} onError={e=>{e.target.src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&h=140&fit=crop"}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:700,color:C.navy}}>{fmtP(p.price)}</div>
              <div style={{fontSize:12,color:C.g600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.address}, {p.city} {p.state}</div>
              <div style={{fontSize:11,color:C.g500,marginTop:2}}>{p.beds}bd · {p.baths}ba · {p.sqft?.toLocaleString()}sqft · {p.images?.length||0} photos</div>
            </div>
            <div style={{padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:700,background:(WC[p.waterType]||WC.Ocean).bg,color:"#fff",textTransform:"uppercase"}}>{p.waterType}</div>
            {p.featured&&<span style={{color:C.gold}}>{I.star}</span>}
            <button onClick={()=>deleteProp(p.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.coral,display:"flex"}}>{I.trash}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dropdown ───
function DD({value,options,onChange,placeholder,icon,disabled}){
  const[open,setOpen]=useState(false);const ref=useRef(null);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h)},[]);
  return(<div ref={ref} style={{position:"relative",minWidth:145}}>
    <button disabled={disabled} onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 12px",background:value?C.oceanPale:C.white,border:`1.5px solid ${value?C.oceanLight:C.g300}`,borderRadius:9,cursor:disabled?"not-allowed":"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",color:value?C.navy:C.g600,width:"100%",opacity:disabled?0.5:1,fontWeight:value?600:400}}>
      {icon&&<span style={{display:"flex",opacity:0.6}}>{icon}</span>}
      <span style={{flex:1,textAlign:"left",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{value||placeholder}</span>
      <span style={{display:"flex",transform:open?"rotate(180deg)":"none",transition:"0.2s"}}>{I.chev}</span>
    </button>
    {open&&<div style={{position:"absolute",top:"calc(100% + 3px)",left:0,right:0,zIndex:1000,background:C.white,borderRadius:9,border:`1px solid ${C.g200}`,boxShadow:"0 12px 40px rgba(0,0,0,0.12)",maxHeight:240,overflowY:"auto"}}>
      {value&&<div onClick={()=>{onChange("");setOpen(false)}} style={{padding:"9px 12px",cursor:"pointer",fontSize:12,color:C.coral,borderBottom:`1px solid ${C.g100}`,fontStyle:"italic"}}>Clear</div>}
      {options.map(o=><div key={o} onClick={()=>{onChange(o);setOpen(false)}} style={{padding:"9px 12px",cursor:"pointer",fontSize:13,background:o===value?C.oceanPale:"transparent",color:o===value?C.ocean:C.g800,fontWeight:o===value?600:400}} onMouseEnter={e=>{if(o!==value)e.target.style.background=C.g100}} onMouseLeave={e=>{if(o!==value)e.target.style.background="transparent"}}>{o}</div>)}
    </div>}
  </div>);
}

// ─── MAIN APP ───
export default function CoastList(){
  const[isAdmin,setIsAdmin]=useState(false);
  const[properties,setProperties]=useState([]);
  const[selState,setSelState]=useState("");
  const[selCounty,setSelCounty]=useState("");
  const[selWater,setSelWater]=useState("");
  const[search,setSearch]=useState("");
  const[selProp,setSelProp]=useState(null);
  const[favs,setFavs]=useState(new Set());
  const[showHero,setShowHero]=useState(true);
  const listRef=useRef(null);
  const STATES=["Florida","California","North Carolina","South Carolina","Massachusetts","Maine","Oregon","Washington","Hawaii","Texas","New Jersey","Connecticut","Virginia","Maryland","Georgia","New York","Rhode Island"];
  const COUNTIES_BY_STATE_LOCAL={"Florida":["Miami-Dade","Palm Beach","Monroe","Collier","Sarasota","Pinellas","Volusia","St. Johns","Brevard","Lee","Martin","Duval","Bay","Walton"],"California":["Los Angeles","San Diego","Orange","Santa Barbara","Monterey","Marin","San Francisco"],"North Carolina":["New Hanover","Dare","Carteret","Brunswick","Currituck","Onslow"],"South Carolina":["Charleston","Beaufort","Horry","Georgetown"],"Massachusetts":["Barnstable","Nantucket","Dukes","Plymouth","Essex"],"Maine":["Cumberland","York","Hancock","Lincoln","Knox"],"Oregon":["Clatsop","Lincoln","Tillamook","Coos","Curry"],"Washington":["San Juan","Island","Whatcom","Clallam","Pacific"],"Hawaii":["Honolulu","Maui","Hawaii","Kauai"],"Texas":["Galveston","Cameron","Nueces","Aransas","Brazoria"],"New Jersey":["Cape May","Ocean","Monmouth","Atlantic"],"Connecticut":["Fairfield","New London","Middlesex","New Haven"],"Virginia":["Virginia Beach","Accomack","Northampton","Lancaster"],"Maryland":["Worcester","Talbot","Dorchester","Somerset","Anne Arundel"],"Georgia":["Chatham","Glynn","Camden","McIntosh"],"New York":["Suffolk","Nassau","Westchester","Queens"],"Rhode Island":["Washington","Newport","Bristol"]};

  useEffect(()=>{if(typeof window!=="undefined"){
    if(window.location.search.includes("admin=true"))setIsAdmin(true);
    const s=localStorage.getItem("coastlist-props-v4");if(s)try{setProperties(JSON.parse(s))}catch{}
    // Auto-import from URL: ?import_url=<encoded JSON URL>
    const params=new URLSearchParams(window.location.search);
    const importUrl=params.get("import_url");
    if(importUrl){
      fetch(importUrl).then(r=>r.json()).then(data=>{
        const newProps=Array.isArray(data)?data:(data.properties||[]);
        if(newProps.length>0){
          setProperties(prev=>{
            const existingIds=new Set(prev.map(p=>p.id));
            const unique=newProps.filter(p=>!existingIds.has(p.id));
            if(unique.length>0){
              const merged=[...unique,...prev];
              localStorage.setItem("coastlist-props-v4",JSON.stringify(merged));
              return merged;
            }
            return prev;
          });
          // Clean URL after import
          window.history.replaceState({},"",window.location.pathname);
        }
      }).catch(e=>console.error("Auto-import failed:",e));
    }
    // Auto-import from inline JSON: ?import_json=<encoded JSON>
    const importJson=params.get("import_json");
    if(importJson){
      try{
        const newProps=JSON.parse(decodeURIComponent(importJson));
        const arr=Array.isArray(newProps)?newProps:[newProps];
        setProperties(prev=>{
          const existingIds=new Set(prev.map(p=>p.id));
          const unique=arr.filter(p=>!existingIds.has(p.id));
          if(unique.length>0){
            const merged=[...unique,...prev];
            localStorage.setItem("coastlist-props-v4",JSON.stringify(merged));
            return merged;
          }
          return prev;
        });
        window.history.replaceState({},"",window.location.pathname);
      }catch(e){console.error("Inline import failed:",e)}
    }
  };},[]);
  useEffect(()=>{if(typeof window!=="undefined"&&properties.length>0)localStorage.setItem("coastlist-props-v4",JSON.stringify(properties))},[properties]);

  const counties=selState?COUNTIES_BY_STATE_LOCAL[selState]||[]:[];
  const filtered=useMemo(()=>properties.filter(p=>{
    if(selState&&p.state!==selState)return false;if(selCounty&&p.county!==selCounty)return false;if(selWater&&p.waterType!==selWater)return false;
    if(search){const q=search.toLowerCase();return p.address?.toLowerCase().includes(q)||p.city?.toLowerCase().includes(q)||p.state?.toLowerCase().includes(q)||p.county?.toLowerCase().includes(q)}return true;
  }),[properties,selState,selCounty,selWater,search]);

  const toggleFav=useCallback(id=>{setFavs(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n})},[]);
  useEffect(()=>{if(!selState||!COUNTIES_BY_STATE_LOCAL[selState]?.includes(selCounty))setSelCounty("")},[selState]);
  const scrollToList=()=>{setShowHero(false);setTimeout(()=>listRef.current?.scrollIntoView({behavior:"smooth"}),50)};

  if(isAdmin)return<Admin properties={properties} setProperties={setProperties} onExit={()=>setIsAdmin(false)}/>;
  if(selProp)return<PropertyPage p={selProp} onBack={()=>setSelProp(null)} favs={favs} toggleFav={toggleFav} allProperties={properties} onSelect={setSelProp}/>;

  const af=[selState,selCounty,selWater].filter(Boolean).length;
  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.sandLight,minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`@keyframes waveSlide{from{transform:translateX(0)}to{transform:translateX(-50%)}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.g300};border-radius:10px}*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none}`}</style>

      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 24px",background:showHero?"transparent":C.white,borderBottom:showHero?"none":`1px solid ${C.g200}`,position:showHero?"absolute":"sticky",top:0,left:0,right:0,zIndex:1000}}>
        <div style={{cursor:"pointer"}} onClick={()=>setShowHero(true)}>
          <span style={{fontSize:20,fontWeight:800,color:showHero?C.white:C.navy,fontFamily:"'Playfair Display',serif"}}>CoastList</span>
        </div>
        {favs.size>0&&<div style={{display:"flex",alignItems:"center",gap:3,fontSize:12,color:showHero?C.white:C.coral,fontWeight:600}}>{I.heart(true)} {favs.size}</div>}
      </header>

      {showHero&&<div style={{position:"relative",background:`linear-gradient(145deg,${C.navy} 0%,#1E3A5F 40%,${C.ocean} 100%)`,padding:"80px 40px 100px",overflow:"hidden",textAlign:"center"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:180,overflow:"hidden",opacity:0.06,pointerEvents:"none"}}><svg viewBox="0 0 1440 200" style={{position:"absolute",bottom:0,width:"200%",animation:"waveSlide 12s linear infinite"}}><path d="M0,100 C320,180 440,20 720,100 C1000,180 1120,20 1440,100 C1760,180 1880,20 2160,100 L2160,200 L0,200 Z" fill={C.navy}/></svg></div>
        <div style={{position:"relative",zIndex:1,maxWidth:660,margin:"0 auto"}}>
          <div style={{fontSize:13,letterSpacing:"0.25em",color:C.seafoam,fontWeight:600,textTransform:"uppercase",marginBottom:14}}>Waterfront Living, Curated</div>
          <h1 style={{fontSize:"clamp(34px,5vw,52px)",fontWeight:800,color:C.white,lineHeight:1.1,fontFamily:"'Playfair Display',serif",margin:"0 0 18px"}}>Discover Your <span style={{color:C.seafoam}}>Waterfront</span> Dream Home</h1>
          <p style={{fontSize:"clamp(14px,2vw,17px)",color:"rgba(255,255,255,0.7)",lineHeight:1.6,maxWidth:500,margin:"0 auto 32px"}}>Every property in our collection borders a river, lake, ocean, or waterway.</p>
          <button onClick={scrollToList} style={{padding:"14px 36px",background:C.seafoam,color:C.navy,border:"none",borderRadius:11,fontSize:15,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:7,boxShadow:"0 4px 20px rgba(124,197,184,0.4)"}}>{I.search} Explore Properties</button>
        </div>
      </div>}

      <div ref={listRef} style={{maxWidth:1400,margin:"0 auto",padding:"0 22px 40px"}}>
        <div style={{position:"sticky",top:showHero?0:58,zIndex:500,background:"rgba(245,239,230,0.95)",backdropFilter:"blur(12px)",padding:"14px 0",marginBottom:18,borderBottom:`1px solid ${C.sandDark}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,padding:"9px 12px",background:C.white,border:`1.5px solid ${C.g300}`,borderRadius:9,flex:"1 1 180px",maxWidth:260}}>
              {I.search}<input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{border:"none",outline:"none",flex:1,fontSize:13,fontFamily:"'DM Sans',sans-serif",background:"transparent",color:C.g800}}/>
              {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",color:C.g500}}>{I.x}</button>}
            </div>
            <DD value={selState} options={STATES} onChange={setSelState} placeholder="All States" icon={I.pin}/>
            <DD value={selCounty} options={counties} onChange={setSelCounty} placeholder={selState?"All Counties":"State first"} disabled={!selState}/>
            <div style={{width:1,height:26,background:C.g300,flexShrink:0}}/>
            <DD value={selWater} options={WATER_TYPES} onChange={setSelWater} placeholder="All Water" icon={I.water}/>
            <div style={{flex:1}}/>
            {af>0&&<button onClick={()=>{setSelState("");setSelCounty("");setSelWater("");setSearch("")}} style={{display:"flex",alignItems:"center",gap:3,padding:"7px 12px",background:"#F0908022",border:`1px solid ${C.coral}33`,borderRadius:7,fontSize:11,fontWeight:600,color:C.coral,cursor:"pointer"}}>Clear {af} {I.x}</button>}
          </div>
          <div style={{marginTop:8,fontSize:12,color:C.g600}}>
            <span style={{fontWeight:700,color:C.navy}}>{filtered.length}</span> waterfront {filtered.length===1?"property":"properties"}
            {selState&&<span> in <strong>{selState}</strong></span>}
            {selWater&&<span> · <span style={{color:(WC[selWater]||{}).bg,fontWeight:600}}>{selWater}</span></span>}
          </div>
        </div>

        {filtered.length===0?(
          <div style={{textAlign:"center",padding:"60px 20px",color:C.g500}}>
            <div style={{fontSize:44,marginBottom:10}}>🌊</div>
            <div style={{fontSize:17,fontWeight:600,color:C.g700,marginBottom:6}}>{properties.length===0?"No properties yet":"No properties found"}</div>
            <div style={{fontSize:13}}>{properties.length===0?"Visit the admin panel to start adding waterfront listings.":"Try adjusting your filters."}</div>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:18}}>
            {filtered.map(p=><Card key={p.id} p={p} onSelect={setSelProp} favs={favs} toggleFav={toggleFav}/>)}
          </div>
        )}
      </div>

      <footer style={{background:C.navy,color:"rgba(255,255,255,0.5)",padding:"32px 24px",textAlign:"center",fontSize:12,lineHeight:1.8}}>
        <div style={{fontSize:18,fontWeight:800,color:C.white,fontFamily:"'Playfair Display',serif",marginBottom:10,opacity:0.7}}>CoastList</div>
        <div style={{maxWidth:460,margin:"0 auto 16px"}}>Curating waterfront properties where property lines border rivers, lakes, oceans, and waterways.</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>© {new Date().getFullYear()} CoastList.com</div>
      </footer>
    </div>
  );
}
