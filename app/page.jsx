'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

const SAMPLE_PRODUCTS = [
  {
    id: 'CL-001', name: 'Malibu Slipcovered Sofa', brand: 'Pottery Barn', price: 1299, salePrice: null, department: 'Furniture',
    description: 'Relaxed coastal sofa with machine-washable slipcover in natural linen. Deep seats, soft cushions, and a low profile make this the perfect beach house centerpiece.',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80','https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80'],
    affiliateUrl: 'https://www.potterybarn.com/products/malibu-sofa/', retailer: 'Pottery Barn', room: 'Living Room', style: 'Hamptons Classic', type: 'Sofas & Sectionals',
    dimensions: '84"W x 40"D x 33"H', material: 'Linen Slipcover, Kiln-Dried Hardwood Frame', colors: ['Natural Linen','Coastal Blue','Stone'], featured: true, trending: true, new: true, dateAdded: '2026-03-24',
  },
  {
    id: 'CL-002', name: 'Driftwood Round Coffee Table', brand: 'Serena & Lily', price: 898, salePrice: 748, department: 'Furniture',
    description: 'Hand-carved from sustainably sourced mango wood, this round coffee table brings organic texture and coastal warmth to any living room.',
    images: ['https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&q=80','https://images.unsplash.com/photo-1611486212557-88be5ff027dc?w=800&q=80'],
    affiliateUrl: 'https://www.serenaandlily.com/', retailer: 'Serena & Lily', room: 'Living Room', style: 'Modern Coastal', type: 'Coffee & Side Tables',
    dimensions: '42" diameter x 16"H', material: 'Mango Wood, Natural Finish', colors: ['Natural','Whitewash'], featured: true, trending: false, new: true, dateAdded: '2026-03-23',
  },
  {
    id: 'CL-003', name: 'Catalina Rattan Dining Chair', brand: 'West Elm', price: 449, salePrice: null, department: 'Furniture',
    description: 'Woven natural rattan seat on a solid oak frame. The gentle curves and organic weave bring the relaxed feel of a seaside cafe to your dining room.',
    images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80','https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80'],
    affiliateUrl: 'https://www.westelm.com/', retailer: 'West Elm', room: 'Dining Room', style: 'Mediterranean Coast', type: 'Dining Tables & Chairs',
    dimensions: '20"W x 22"D x 34"H', material: 'Natural Rattan, Solid Oak Frame', colors: ['Natural','Black Frame'], featured: false, trending: true, new: false, dateAdded: '2026-03-20',
  },
  {
    id: 'CL-004', name: 'Shoreline Teak Outdoor Sofa', brand: 'Crate & Barrel', price: 1899, salePrice: 1599, department: 'Furniture',
    description: 'Grade-A teak frame with all-weather Sunbrella cushions in soft cloud white. Built to withstand the elements while looking effortlessly elegant on any patio.',
    images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80','https://images.unsplash.com/photo-1615529151169-7b1ff50dc7f2?w=800&q=80'],
    affiliateUrl: 'https://www.crateandbarrel.com/', retailer: 'Crate & Barrel', room: 'Outdoor / Patio', style: 'Modern Coastal', type: 'Outdoor Seating',
    dimensions: '78"W x 34"D x 30"H', material: 'Grade-A Teak, Sunbrella Fabric', colors: ['Cloud White','Coastal Stripe','Fog'], featured: true, trending: true, new: false, dateAdded: '2026-03-18',
  },
  {
    id: 'CL-005', name: 'Harbor Cane Four-Poster Bed', brand: 'Serena & Lily', price: 2498, salePrice: null, department: 'Furniture',
    description: 'A modern take on the four-poster with lightweight cane paneling and a warm whitewash finish. The airy silhouette is perfect for coastal bedrooms.',
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80','https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'],
    affiliateUrl: 'https://www.serenaandlily.com/', retailer: 'Serena & Lily', room: 'Bedroom', style: 'Hamptons Classic', type: 'Beds & Headboards',
    dimensions: 'Queen: 65"W x 87"D x 84"H', material: 'Mahogany, Natural Cane', colors: ['Whitewash','Natural'], featured: true, trending: false, new: true, dateAdded: '2026-03-22',
  },
  {
    id: 'CL-006', name: 'Woven Seagrass Bench', brand: 'Pottery Barn', price: 549, salePrice: 449, department: 'Furniture',
    description: 'A hand-woven seagrass bench on a solid hardwood frame. Perfect for the end of a bed or a welcoming entryway piece.',
    images: ['https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&q=80','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
    affiliateUrl: 'https://www.potterybarn.com/', retailer: 'Pottery Barn', room: 'Entryway', style: 'Rustic Beach', type: 'Benches & Ottomans',
    dimensions: '52"W x 16"D x 18"H', material: 'Seagrass, Solid Mango Wood', colors: ['Natural'], featured: false, trending: true, new: false, dateAdded: '2026-03-15',
  },
  {
    id: 'CL-007', name: 'Pacific Linen Accent Chair', brand: 'West Elm', price: 799, salePrice: null, department: 'Furniture',
    description: 'Mid-century meets coastal in this linen-upholstered accent chair with solid ash legs in a driftwood finish.',
    images: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80','https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80'],
    affiliateUrl: 'https://www.westelm.com/', retailer: 'West Elm', room: 'Living Room', style: 'Modern Coastal', type: 'Accent Chairs',
    dimensions: '30"W x 33"D x 32"H', material: 'Linen Blend, Solid Ash', colors: ['Oatmeal','Indigo','Seafoam'], featured: false, trending: false, new: true, dateAdded: '2026-03-21',
  },
  {
    id: 'CL-008', name: 'Tide Reclaimed Wood Dining Table', brand: 'Wayfair', price: 1249, salePrice: null, department: 'Furniture',
    description: 'A stunning 72-inch dining table crafted from reclaimed pine with a weathered white finish and turned legs. Seats 6-8 comfortably.',
    images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80','https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80'],
    affiliateUrl: 'https://www.wayfair.com/', retailer: 'Wayfair', room: 'Dining Room', style: 'Rustic Beach', type: 'Dining Tables & Chairs',
    dimensions: '72"W x 38"D x 30"H', material: 'Reclaimed Pine', colors: ['Weathered White','Driftwood'], featured: true, trending: false, new: false, dateAdded: '2026-03-10',
  },
  {
    id: 'CL-009', name: 'Laguna Rope Bar Cart', brand: 'Crate & Barrel', price: 599, salePrice: null, department: 'Furniture',
    description: 'Brass-finished iron frame wrapped in natural rope detail. Two tempered glass shelves provide ample entertaining space.',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80'],
    affiliateUrl: 'https://www.crateandbarrel.com/', retailer: 'Crate & Barrel', room: 'Living Room', style: 'Nautical', type: 'Bar Carts & Consoles',
    dimensions: '30"W x 18"D x 33"H', material: 'Iron, Natural Rope, Tempered Glass', colors: ['Brass/Natural'], featured: false, trending: true, new: true, dateAdded: '2026-03-19',
  },
  {
    id: 'CL-010', name: 'Sunset Bamboo Nightstand', brand: 'Target', price: 189, salePrice: 159, department: 'Furniture',
    description: 'Sustainable bamboo nightstand with a single drawer and open shelf. Clean lines and a light natural finish for a breezy bedroom look.',
    images: ['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&q=80','https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80'],
    affiliateUrl: 'https://www.target.com/', retailer: 'Target', room: 'Bedroom', style: 'Tropical Resort', type: 'Dressers & Nightstands',
    dimensions: '22"W x 16"D x 24"H', material: 'Sustainable Bamboo', colors: ['Natural','White'], featured: false, trending: false, new: false, dateAdded: '2026-03-12',
  },
  {
    id: 'CL-011', name: 'Oceanview Open Bookshelf', brand: 'Wayfair', price: 679, salePrice: null, department: 'Furniture',
    description: 'A tall, airy bookshelf in whitewashed oak with five shelves. Perfect for displaying coastal treasures and books.',
    images: ['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'],
    affiliateUrl: 'https://www.wayfair.com/', retailer: 'Wayfair', room: 'Home Office', style: 'Hamptons Classic', type: 'Shelving & Storage',
    dimensions: '36"W x 14"D x 72"H', material: 'Oak Veneer, Solid Pine Frame', colors: ['Whitewash','Natural Oak'], featured: false, trending: false, new: true, dateAdded: '2026-03-17',
  },
  {
    id: 'CL-012', name: 'Breezy Linen Slipper Chair', brand: 'Serena & Lily', price: 698, salePrice: null, department: 'Furniture',
    description: 'An armless slipper chair in washed linen. The low profile and soft cushion make it a versatile addition to bedrooms, living rooms, or reading nooks.',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
    affiliateUrl: 'https://www.serenaandlily.com/', retailer: 'Serena & Lily', room: 'Bedroom', style: 'Mediterranean Coast', type: 'Accent Chairs',
    dimensions: '26"W x 30"D x 31"H', material: 'Washed Belgian Linen, Birch Frame', colors: ['Fog','Sand','White'], featured: false, trending: false, new: false, dateAdded: '2026-03-14',
  },
];

const ROOMS = ['Living Room','Bedroom','Dining Room','Outdoor / Patio','Bathroom','Entryway','Home Office','Kitchen'];
const STYLES = ['Hamptons Classic','Mediterranean Coast','Tropical Resort','Modern Coastal','Rustic Beach','Nautical'];
const TYPES = ['Sofas & Sectionals','Accent Chairs','Coffee & Side Tables','Dining Tables & Chairs','Beds & Headboards','Dressers & Nightstands','Outdoor Seating','Benches & Ottomans','Shelving & Storage','Bar Carts & Consoles'];
const DEPARTMENTS = ['Furniture'];
const RETAILERS = ['Pottery Barn','Serena & Lily','West Elm','Crate & Barrel','Wayfair','Target','Amazon'];

const Icons = {
  search: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
  heart: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
  heartFill: (<svg width="18" height="18" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
  arrow: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>),
  chevronLeft: (<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>),
  chevronRight: (<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>),
  externalLink: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>),
  filter: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>),
  x: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  plus: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  trash: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>),
  edit: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  download: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>),
  upload: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>),
  menu: (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>),
};

function Logo({ size = 'default' }) {
  const s = size === 'large' ? { fontSize: '2rem', sub: '0.7rem' } : { fontSize: '1.4rem', sub: '0.55rem' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <svg width={size === 'large' ? 44 : 32} height={size === 'large' ? 44 : 32} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="23" fill="var(--navy)" stroke="var(--sea-glass)" strokeWidth="2"/>
        <path d="M6 28 Q 14 20, 24 28 T 42 28" stroke="var(--sea-glass)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M6 32 Q 14 24, 24 32 T 42 32" stroke="rgba(124,197,184,0.4)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M24 10 L25.5 16 L22.5 16Z M24 10 L28 15 L26 16.5Z M24 10 L20 15 L22 16.5Z M24 10 L22 17 L26 17Z M24 10 L27

cat > app/page.jsx << 'ENDOFPAGEFILE'
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

const SAMPLE_PRODUCTS = [
  {
    id: 'CL-001', name: 'Malibu Slipcovered Sofa', brand: 'Pottery Barn', price: 1299, salePrice: null, department: 'Furniture',
    description: 'Relaxed coastal sofa with machine-washable slipcover in natural linen. Deep seats, soft cushions, and a low profile make this the perfect beach house centerpiece.',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80','https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80'],
    affiliateUrl: 'https://www.potterybarn.com/products/malibu-sofa/', retailer: 'Pottery Barn', room: 'Living Room', style: 'Hamptons Classic', type: 'Sofas & Sectionals',
    dimensions: '84"W x 40"D x 33"H', material: 'Linen Slipcover, Kiln-Dried Hardwood Frame', colors: ['Natural Linen','Coastal Blue','Stone'], featured: true, trending: true, new: true, dateAdded: '2026-03-24',
  },
  {
    id: 'CL-002', name: 'Driftwood Round Coffee Table', brand: 'Serena & Lily', price: 898, salePrice: 748, department: 'Furniture',
    description: 'Hand-carved from sustainably sourced mango wood, this round coffee table brings organic texture and coastal warmth to any living room.',
    images: ['https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&q=80','https://images.unsplash.com/photo-1611486212557-88be5ff027dc?w=800&q=80'],
    affiliateUrl: 'https://www.serenaandlily.com/', retailer: 'Serena & Lily', room: 'Living Room', style: 'Modern Coastal', type: 'Coffee & Side Tables',
    dimensions: '42" diameter x 16"H', material: 'Mango Wood, Natural Finish', colors: ['Natural','Whitewash'], featured: true, trending: false, new: true, dateAdded: '2026-03-23',
  },
  {
    id: 'CL-003', name: 'Catalina Rattan Dining Chair', brand: 'West Elm', price: 449, salePrice: null, department: 'Furniture',
    description: 'Woven natural rattan seat on a solid oak frame. The gentle curves and organic weave bring the relaxed feel of a seaside cafe to your dining room.',
    images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80','https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80'],
    affiliateUrl: 'https://www.westelm.com/', retailer: 'West Elm', room: 'Dining Room', style: 'Mediterranean Coast', type: 'Dining Tables & Chairs',
    dimensions: '20"W x 22"D x 34"H', material: 'Natural Rattan, Solid Oak Frame', colors: ['Natural','Black Frame'], featured: false, trending: true, new: false, dateAdded: '2026-03-20',
  },
  {
    id: 'CL-004', name: 'Shoreline Teak Outdoor Sofa', brand: 'Crate & Barrel', price: 1899, salePrice: 1599, department: 'Furniture',
    description: 'Grade-A teak frame with all-weather Sunbrella cushions in soft cloud white. Built to withstand the elements while looking effortlessly elegant on any patio.',
    images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80','https://images.unsplash.com/photo-1615529151169-7b1ff50dc7f2?w=800&q=80'],
    affiliateUrl: 'https://www.crateandbarrel.com/', retailer: 'Crate & Barrel', room: 'Outdoor / Patio', style: 'Modern Coastal', type: 'Outdoor Seating',
    dimensions: '78"W x 34"D x 30"H', material: 'Grade-A Teak, Sunbrella Fabric', colors: ['Cloud White','Coastal Stripe','Fog'], featured: true, trending: true, new: false, dateAdded: '2026-03-18',
  },
  {
    id: 'CL-005', name: 'Harbor Cane Four-Poster Bed', brand: 'Serena & Lily', price: 2498, salePrice: null, department: 'Furniture',
    description: 'A modern take on the four-poster with lightweight cane paneling and a warm whitewash finish. The airy silhouette is perfect for coastal bedrooms.',
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80','https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'],
    affiliateUrl: 'https://www.serenaandlily.com/', retailer: 'Serena & Lily', room: 'Bedroom', style: 'Hamptons Classic', type: 'Beds & Headboards',
    dimensions: 'Queen: 65"W x 87"D x 84"H', material: 'Mahogany, Natural Cane', colors: ['Whitewash','Natural'], featured: true, trending: false, new: true, dateAdded: '2026-03-22',
  },
  {
    id: 'CL-006', name: 'Woven Seagrass Bench', brand: 'Pottery Barn', price: 549, salePrice: 449, department: 'Furniture',
    description: 'A hand-woven seagrass bench on a solid hardwood frame. Perfect for the end of a bed or a welcoming entryway piece.',
    images: ['https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&q=80','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
    affiliateUrl: 'https://www.potterybarn.com/', retailer: 'Pottery Barn', room: 'Entryway', style: 'Rustic Beach', type: 'Benches & Ottomans',
    dimensions: '52"W x 16"D x 18"H', material: 'Seagrass, Solid Mango Wood', colors: ['Natural'], featured: false, trending: true, new: false, dateAdded: '2026-03-15',
  },
  {
    id: 'CL-007', name: 'Pacific Linen Accent Chair', brand: 'West Elm', price: 799, salePrice: null, department: 'Furniture',
    description: 'Mid-century meets coastal in this linen-upholstered accent chair with solid ash legs in a driftwood finish.',
    images: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80','https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80'],
    affiliateUrl: 'https://www.westelm.com/', retailer: 'West Elm', room: 'Living Room', style: 'Modern Coastal', type: 'Accent Chairs',
    dimensions: '30"W x 33"D x 32"H', material: 'Linen Blend, Solid Ash', colors: ['Oatmeal','Indigo','Seafoam'], featured: false, trending: false, new: true, dateAdded: '2026-03-21',
  },
  {
    id: 'CL-008', name: 'Tide Reclaimed Wood Dining Table', brand: 'Wayfair', price: 1249, salePrice: null, department: 'Furniture',
    description: 'A stunning 72-inch dining table crafted from reclaimed pine with a weathered white finish and turned legs. Seats 6-8 comfortably.',
    images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80','https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80'],
    affiliateUrl: 'https://www.wayfair.com/', retailer: 'Wayfair', room: 'Dining Room', style: 'Rustic Beach', type: 'Dining Tables & Chairs',
    dimensions: '72"W x 38"D x 30"H', material: 'Reclaimed Pine', colors: ['Weathered White','Driftwood'], featured: true, trending: false, new: false, dateAdded: '2026-03-10',
  },
  {
    id: 'CL-009', name: 'Laguna Rope Bar Cart', brand: 'Crate & Barrel', price: 599, salePrice: null, department: 'Furniture',
    description: 'Brass-finished iron frame wrapped in natural rope detail. Two tempered glass shelves provide ample entertaining space.',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80'],
    affiliateUrl: 'https://www.crateandbarrel.com/', retailer: 'Crate & Barrel', room: 'Living Room', style: 'Nautical', type: 'Bar Carts & Consoles',
    dimensions: '30"W x 18"D x 33"H', material: 'Iron, Natural Rope, Tempered Glass', colors: ['Brass/Natural'], featured: false, trending: true, new: true, dateAdded: '2026-03-19',
  },
  {
    id: 'CL-010', name: 'Sunset Bamboo Nightstand', brand: 'Target', price: 189, salePrice: 159, department: 'Furniture',
    description: 'Sustainable bamboo nightstand with a single drawer and open shelf. Clean lines and a light natural finish for a breezy bedroom look.',
    images: ['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&q=80','https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80'],
    affiliateUrl: 'https://www.target.com/', retailer: 'Target', room: 'Bedroom', style: 'Tropical Resort', type: 'Dressers & Nightstands',
    dimensions: '22"W x 16"D x 24"H', material: 'Sustainable Bamboo', colors: ['Natural','White'], featured: false, trending: false, new: false, dateAdded: '2026-03-12',
  },
  {
    id: 'CL-011', name: 'Oceanview Open Bookshelf', brand: 'Wayfair', price: 679, salePrice: null, department: 'Furniture',
    description: 'A tall, airy bookshelf in whitewashed oak with five shelves. Perfect for displaying coastal treasures and books.',
    images: ['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'],
    affiliateUrl: 'https://www.wayfair.com/', retailer: 'Wayfair', room: 'Home Office', style: 'Hamptons Classic', type: 'Shelving & Storage',
    dimensions: '36"W x 14"D x 72"H', material: 'Oak Veneer, Solid Pine Frame', colors: ['Whitewash','Natural Oak'], featured: false, trending: false, new: true, dateAdded: '2026-03-17',
  },
  {
    id: 'CL-012', name: 'Breezy Linen Slipper Chair', brand: 'Serena & Lily', price: 698, salePrice: null, department: 'Furniture',
    description: 'An armless slipper chair in washed linen. The low profile and soft cushion make it a versatile addition to bedrooms, living rooms, or reading nooks.',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
    affiliateUrl: 'https://www.serenaandlily.com/', retailer: 'Serena & Lily', room: 'Bedroom', style: 'Mediterranean Coast', type: 'Accent Chairs',
    dimensions: '26"W x 30"D x 31"H', material: 'Washed Belgian Linen, Birch Frame', colors: ['Fog','Sand','White'], featured: false, trending: false, new: false, dateAdded: '2026-03-14',
  },
];

const ROOMS = ['Living Room','Bedroom','Dining Room','Outdoor / Patio','Bathroom','Entryway','Home Office','Kitchen'];
const STYLES = ['Hamptons Classic','Mediterranean Coast','Tropical Resort','Modern Coastal','Rustic Beach','Nautical'];
const TYPES = ['Sofas & Sectionals','Accent Chairs','Coffee & Side Tables','Dining Tables & Chairs','Beds & Headboards','Dressers & Nightstands','Outdoor Seating','Benches & Ottomans','Shelving & Storage','Bar Carts & Consoles'];
const DEPARTMENTS = ['Furniture'];
const RETAILERS = ['Pottery Barn','Serena & Lily','West Elm','Crate & Barrel','Wayfair','Target','Amazon'];

const Icons = {
  search: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
  heart: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
  heartFill: (<svg width="18" height="18" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
  arrow: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>),
  chevronLeft: (<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>),
  chevronRight: (<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>),
  externalLink: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>),
  filter: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>),
  x: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  plus: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  trash: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>),
  edit: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  download: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>),
  upload: (<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>),
  menu: (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>),
};

function Logo({ size = 'default' }) {
  const s = size === 'large' ? { fontSize: '2rem', sub: '0.7rem' } : { fontSize: '1.4rem', sub: '0.55rem' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <svg width={size === 'large' ? 44 : 32} height={size === 'large' ? 44 : 32} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="23" fill="var(--navy)" stroke="var(--sea-glass)" strokeWidth="2"/>
        <path d="M6 28 Q 14 20, 24 28 T 42 28" stroke="var(--sea-glass)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M6 32 Q 14 24, 24 32 T 42 32" stroke="rgba(124,197,184,0.4)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M24 10 L25.5 16 L22.5 16Z M24 10 L28 15 L26 16.5Z M24 10 L20 15 L22 16.5Z M24 10 L22 17 L26 17Z M24 10 L27 17 L21 17Z" fill="var(--coral)" opacity="0.85"/>
        <circle cx="24" cy="15" r="1.5" fill="var(--sand-light)"/>
      </svg>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: s.fontSize, fontWeight: 700, color: 'var(--navy)', letterSpacing: '0.08em', lineHeight: 1 }}>COASTLIST</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: s.sub, color: 'var(--warm-gray)', letterSpacing: '0.2em', textTransform: 'uppercase', lineHeight: 1.2 }}>Coastal Living</div>
      </div>
    </div>
  );
}

const S = {
  nav: { position: 'sticky', top: 0, zIndex: 100, background: 'var(--white)', borderBottom: '1px solid var(--driftwood)', boxShadow: '0 1px 8px rgba(27,43,75,0.06)' },
  navInner: { maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 },
  navLinks: { display: 'flex', gap: 28, alignItems: 'center' },
  navLink: { fontFamily: 'var(--font-body)', fontSize: '0.92rem', fontWeight: 500, color: 'var(--navy)', cursor: 'pointer', padding: '4px 0', borderBottom: '2px solid transparent', transition: 'all 0.2s' },
  navLinkActive: { borderBottomColor: 'var(--sea-glass)', color: 'var(--ocean)' },
  hero: { position: 'relative', background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 50%, var(--ocean) 100%)', minHeight: 520, display: 'flex', alignItems: 'center', overflow: 'hidden' },
  heroContent: { position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '80px 24px', width: '100%' },
  heroTitle: { fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, color: 'var(--white)', marginBottom: 16 },
  heroSub: { fontFamily: 'var(--font-body)', fontSize: 'clamp(1rem, 2vw, 1.3rem)', color: 'rgba(255,255,255,0.8)', marginBottom: 32, maxWidth: 520, lineHeight: 1.6 },
  heroCTA: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: 'var(--sea-glass)', color: 'var(--navy)', fontWeight: 600, fontSize: '1rem', borderRadius: 8, cursor: 'pointer', border: 'none', transition: 'all 0.2s' },
  section: { padding: '64px 0' },
  sectionAlt: { padding: '64px 0', background: 'var(--sand-light)' },
  sectionTitle: { fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--navy)', marginBottom: 8 },
  sectionSub: { fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--warm-gray)', marginBottom: 32 },
  card: { background: 'var(--white)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,43,75,0.06)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' },
  cardImg: { width: '100%', height: 260, objectFit: 'cover', transition: 'transform 0.3s' },
  cardBody: { padding: 16 },
  cardName: { fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--navy)', marginBottom: 4 },
  cardBrand: { fontSize: '0.82rem', color: 'var(--warm-gray)', marginBottom: 8 },
  cardPrice: { fontSize: '1rem', fontWeight: 600, color: 'var(--navy)' },
  cardSale: { fontSize: '0.85rem', color: 'var(--warm-gray)', textDecoration: 'line-through', marginRight: 8 },
  cardSalePrice: { fontSize: '1rem', fontWeight: 600, color: 'var(--coral)' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 28px', background: 'var(--sea-glass)', color: 'var(--navy)', fontWeight: 600, fontSize: '0.95rem', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s' },
  btnOutline: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 20px', background: 'transparent', color: 'var(--ocean)', fontWeight: 500, fontSize: '0.9rem', borderRadius: 8, border: '1.5px solid var(--ocean)', cursor: 'pointer', transition: 'all 0.2s' },
  btnDanger: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--coral)', color: 'white', fontWeight: 500, fontSize: '0.85rem', borderRadius: 6, border: 'none', cursor: 'pointer' },
  btnShop: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 40px', background: 'var(--sea-glass)', color: 'var(--navy)', fontWeight: 700, fontSize: '1.1rem', borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'all 0.2s', width: '100%' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  badgeNew: { background: 'var(--sea-glass)', color: 'var(--navy)' },
  badgeSale: { background: 'var(--coral)', color: 'white' },
  badgeFeatured: { background: 'var(--ocean)', color: 'white' },
  sidebar: { width: 260, flexShrink: 0, padding: '0 24px 0 0' },
  filterGroup: { marginBottom: 24 },
  filterTitle: { fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy)', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--driftwood)' },
  filterOption: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: '0.88rem', color: 'var(--warm-gray)', cursor: 'pointer', transition: 'color 0.15s' },
  filterOptionActive: { color: 'var(--ocean)', fontWeight: 600 },
  footer: { background: 'var(--navy)', color: 'rgba(255,255,255,0.7)', padding: '48px 0 24px' },
};

function ProductCard({ product, onClick, onFav, isFav }) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ ...S.card, transform: hover ? 'translateY(-4px)' : 'none', boxShadow: hover ? '0 8px 30px rgba(27,43,75,0.12)' : S.card.boxShadow }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onClick}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img src={product.images?.[hover && product.images.length > 1 ? 1 : 0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'} alt={product.name} style={{ ...S.cardImg, transform: hover ? 'scale(1.04)' : 'scale(1)' }} />
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          {product.new && <span style={{ ...S.badge, ...S.badgeNew }}>New</span>}
          {product.salePrice && <span style={{ ...S.badge, ...S.badgeSale }}>Sale</span>}
          {product.featured && !product.new && <span style={{ ...S.badge, ...S.badgeFeatured }}>Featured</span>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onFav?.(product.id); }} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isFav ? 'var(--coral)' : 'var(--warm-gray)' }}>
          {isFav ? Icons.heartFill : Icons.heart}
        </button>
      </div>
      <div style={S.cardBody}>
        <div style={S.cardName}>{product.name}</div>
        <div style={S.cardBrand}>{product.brand}</div>
        <div>
          {product.salePrice ? (<><span style={S.cardSale}>${product.price.toLocaleString()}</span><span style={S.cardSalePrice}>${product.salePrice.toLocaleString()}</span></>) : (<span style={S.cardPrice}>${product.price.toLocaleString()}</span>)}
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 12, background: 'var(--sand)', color: 'var(--warm-gray)' }}>{product.room}</span>
          <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 12, background: 'var(--sand)', color: 'var(--warm-gray)' }}>{product.style}</span>
        </div>
      </div>
    </div>
  );
}

function ScrollRow({ children }) {
  const ref = useRef(null);
  const scroll = (dir) => { ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' }); };
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => scroll(-1)} style={{ position: 'absolute', left: -16, top: '50%', transform: 'translateY(-50%)', zIndex: 5, background: 'var(--white)', border: '1px solid var(--driftwood)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>{Icons.chevronLeft}</button>
      <div ref={ref} style={{ display: 'flex', gap: 20, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>{children}</div>
      <button onClick={() => scroll(1)} style={{ position: 'absolute', right: -16, top: '50%', transform: 'translateY(-50%)', zIndex: 5, background: 'var(--white)', border: '1px solid var(--driftwood)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>{Icons.chevronRight}</button>
    </div>
  );
}

export default function CoastListApp() {
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [heroTagline, setHeroTagline] = useState(0);
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStyle, setFilterStyle] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [adminTab, setAdminTab] = useState('list');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') { setIsAdmin(true); setView('admin'); }
    }
    try {
      const saved = localStorage.getItem('coastlist_products');
      if (saved) { const parsed = JSON.parse(saved); if (parsed.length > 0) { setProducts(parsed); return; } }
    } catch (e) {}
    setProducts(SAMPLE_PRODUCTS);
  }, []);

  useEffect(() => {
    if (products.length > 0) { try { localStorage.setItem('coastlist_products', JSON.stringify(products)); } catch (e) {} }
  }, [products]);

  const taglines = ['Coastal Living, Curated', 'Your Beach House, Styled', 'Where Sea Meets Home'];
  useEffect(() => { const t = setInterval(() => setHeroTagline(p => (p + 1) % taglines.length), 5000); return () => clearInterval(t); }, []);

  const toggleFav = useCallback((id) => {
    setFavorites(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);

  const openProduct = (p) => { setSelectedProduct(p); setView('detail'); window.scrollTo(0, 0); };
  const goHome = () => { setView('home'); setSelectedProduct(null); window.scrollTo(0, 0); };
  const goBrowse = (room, style) => { setFilterRoom(room || ''); setFilterStyle(style || ''); setFilterType(''); setFilterBrand(''); setFilterPriceRange(''); setView('browse'); window.scrollTo(0, 0); };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) { const q = searchQuery.toLowerCase(); result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)); }
    if (filterRoom) result = result.filter(p => p.room === filterRoom);
    if (filterStyle) result = result.filter(p => p.style === filterStyle);
    if (filterType) result = result.filter(p => p.type === filterType);
    if (filterBrand) result = result.filter(p => p.brand === filterBrand);
    if (filterPriceRange) { const [min, max] = filterPriceRange.split('-').map(Number); result = result.filter(p => { const price = p.salePrice || p.price; return price >= min && (max ? price <= max : true); }); }
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)); break;
      case 'price-high': result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)); break;
      case 'newest': result.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)); break;
      default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }
    return result;
  }, [products, searchQuery, filterRoom, filterStyle, filterType, filterBrand, filterPriceRange, sortBy]);

  const featuredProducts = useMemo(() => products.filter(p => p.featured), [products]);
  const trendingProducts = useMemo(() => products.filter(p => p.trending), [products]);
  const roomCounts = useMemo(() => { const c = {}; products.forEach(p => { c[p.room] = (c[p.room] || 0) + 1; }); return c; }, [products]);

  const Nav = () => (
    <nav style={S.nav}>
      <div style={S.navInner}>
        <div onClick={goHome}><Logo /></div>
        <div style={S.navLinks}>
          <span onClick={goHome} style={{ ...S.navLink, ...(view === 'home' ? S.navLinkActive : {}) }}>Home</span>
          <span onClick={() => goBrowse('', '')} style={{ ...S.navLink, ...(view === 'browse' ? S.navLinkActive : {}) }}>Shop Furniture</span>
          {ROOMS.slice(0, 4).map(r => (<span key={r} onClick={() => goBrowse(r, '')} style={{ ...S.navLink, fontSize: '0.85rem' }}>{r}</span>))}
          {isAdmin && <span onClick={() => { setView('admin'); window.scrollTo(0, 0); }} style={{ ...S.navLink, color: 'var(--coral)', ...(view === 'admin' ? S.navLinkActive : {}) }}>Admin</span>}
        </div>
      </div>
    </nav>
  );

  const HomePage = () => (
    <>
      <div style={S.hero}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
          <svg width="100%" height="100%" viewBox="0 0 1440 520" preserveAspectRatio="none"><path d="M0 400 Q 360 320, 720 400 T 1440 400 V520 H0Z" fill="white"/><path d="M0 440 Q 360 380, 720 440 T 1440 440 V520 H0Z" fill="white" opacity="0.5"/></svg>
        </div>
        <div style={S.heroContent}>
          <div style={{ ...S.badge, ...S.badgeNew, marginBottom: 16 }}>Now Curating: Coastal Furniture</div>
          <h1 style={S.heroTitle} key={heroTagline}>{taglines[heroTagline]}</h1>
          <p style={S.heroSub}>Handpicked furniture for your life by the water. Discover pieces from Pottery Barn, Serena & Lily, West Elm, and more.</p>
          <button style={S.heroCTA} onClick={() => goBrowse('', '')}>Explore Collections {Icons.arrow}</button>
        </div>
      </div>
      <div style={S.section}>
        <div className="container">
          <h2 style={S.sectionTitle}>Curated Collections</h2>
          <p style={S.sectionSub}>Handpicked groupings to inspire your next room makeover</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { label: 'Hamptons Living Room', style: 'Hamptons Classic', room: 'Living Room', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80' },
              { label: 'Modern Coastal Bedroom', style: 'Modern Coastal', room: 'Bedroom', img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80' },
              { label: 'Outdoor Coastal Dining', style: '', room: 'Outdoor / Patio', img: 'https://images.unsplash.com/photo-1600566753086-00f18f6b1a04?w=600&q=80' },
              { label: 'Mediterranean Dining', style: 'Mediterranean Coast', room: 'Dining Room', img: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80' },
            ].map(c => (
              <div key={c.label} onClick={() => goBrowse(c.room, c.style)} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', height: 220, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <img src={c.img} alt={c.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(27,43,75,0.7) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {trendingProducts.length > 0 && (
        <div style={S.sectionAlt}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div><h2 style={S.sectionTitle}>Trending Now</h2><p style={{ ...S.sectionSub, marginBottom: 0 }}>The coastal pieces everyone is loving</p></div>
              <button style={S.btnOutline} onClick={() => goBrowse('', '')}>View All</button>
            </div>
            <ScrollRow>
              {trendingProducts.map(p => (<div key={p.id} style={{ minWidth: 280, scrollSnapAlign: 'start' }}><ProductCard product={p} onClick={() => openProduct(p)} onFav={toggleFav} isFav={favorites.has(p.id)} /></div>))}
            </ScrollRow>
          </div>
        </div>
      )}
      <div style={S.section}>
        <div className="container">
          <h2 style={S.sectionTitle}>Shop by Room</h2>
          <p style={S.sectionSub}>Find the perfect pieces for every space</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { room: 'Living Room', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80' },
              { room: 'Bedroom', img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80' },
              { room: 'Dining Room', img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&q=80' },
              { room: 'Outdoor / Patio', img: 'https://images.unsplash.com/photo-1600566753086-00f18f6b1a04?w=400&q=80' },
              { room: 'Entryway', img: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&q=80' },
              { room: 'Home Office', img: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&q=80' },
            ].map(r => (
              <div key={r.room} onClick={() => goBrowse(r.room, '')} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', height: 160 }}>
                <img src={r.img} alt={r.room} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(27,43,75,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>{r.room}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{roomCounts[r.room] || 0} pieces</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={S.sectionAlt}>
        <div className="container">
          <h2 style={S.sectionTitle}>Find Your Coastal Style</h2>
          <p style={S.sectionSub}>Which vibe speaks to you?</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {STYLES.map(s => (<button key={s} onClick={() => goBrowse('', s)} style={{ padding: '12px 24px', borderRadius: 30, background: 'var(--white)', border: '1.5px solid var(--driftwood)', color: 'var(--navy)', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer' }}>{s}</button>))}
          </div>
        </div>
      </div>
      <div style={{ padding: '64px 0', background: 'var(--navy)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'white', marginBottom: 8 }}>Get Coastal Inspiration Delivered</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>Join our list for weekly picks, new arrivals, and exclusive deals.</p>
          <div style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto', justifyContent: 'center' }}>
            <input type="email" placeholder="Your email address" style={{ flex: 1, padding: '14px 18px', borderRadius: 8, border: 'none' }} />
            <button style={{ ...S.btnPrimary, whiteSpace: 'nowrap' }}>Subscribe</button>
          </div>
        </div>
      </div>
    </>
  );

  const BrowsePage = () => {
    const clearFilters = () => { setFilterRoom(''); setFilterStyle(''); setFilterType(''); setFilterBrand(''); setFilterPriceRange(''); setSearchQuery(''); };
    const hasFilters = filterRoom || filterStyle || filterType || filterBrand || filterPriceRange || searchQuery;
    const priceRanges = [{ label: 'Under $500', value: '0-500' },{ label: '$500 - $1,000', value: '500-1000' },{ label: '$1,000 - $2,000', value: '1000-2000' },{ label: 'Over $2,000', value: '2000-' }];

    const FilterSidebar = ({ mobile }) => (
      <div style={mobile ? { padding: 20, background: 'var(--white)', borderRadius: 12, marginBottom: 20 } : S.sidebar}>
        {hasFilters && <button onClick={clearFilters} style={{ ...S.btnOutline, width: '100%', marginBottom: 20, fontSize: '0.82rem' }}>Clear All Filters</button>}
        <div style={S.filterGroup}>
          <div style={S.filterTitle}>Room</div>
          {ROOMS.map(r => (<div key={r} onClick={() => setFilterRoom(filterRoom === r ? '' : r)} style={{ ...S.filterOption, ...(filterRoom === r ? S.filterOptionActive : {}) }}><span style={{ width: 14, height: 14, borderRadius: 3, border: filterRoom === r ? '2px solid var(--ocean)' : '1.5px solid var(--driftwood)', background: filterRoom === r ? 'var(--ocean)' : 'transparent', display: 'inline-block', flexShrink: 0 }} />{r}</div>))}
        </div>
        <div style={S.filterGroup}>
          <div style={S.filterTitle}>Style</div>
          {STYLES.map(s => (<div key={s} onClick={() => setFilterStyle(filterStyle === s ? '' : s)} style={{ ...S.filterOption, ...(filterStyle === s ? S.filterOptionActive : {}) }}><span style={{ width: 14, height: 14, borderRadius: 3, border: filterStyle === s ? '2px solid var(--ocean)' : '1.5px solid var(--driftwood)', background: filterStyle === s ? 'var(--ocean)' : 'transparent', display: 'inline-block', flexShrink: 0 }} />{s}</div>))}
        </div>
        <div style={S.filterGroup}>
          <div style={S.filterTitle}>Type</div>
          {TYPES.map(t => (<div key={t} onClick={() => setFilterType(filterType === t ? '' : t)} style={{ ...S.filterOption, ...(filterType === t ? S.filterOptionActive : {}) }}><span style={{ width: 14, height: 14, borderRadius: 3, border: filterType === t ? '2px solid var(--ocean)' : '1.5px solid var(--driftwood)', background: filterType === t ? 'var(--ocean)' : 'transparent', display: 'inline-block', flexShrink: 0 }} />{t}</div>))}
        </div>
        <div style={S.filterGroup}>
          <div style={S.filterTitle}>Price</div>
          {priceRanges.map(pr => (<div key={pr.value} onClick={() => setFilterPriceRange(filterPriceRange === pr.value ? '' : pr.value)} style={{ ...S.filterOption, ...(filterPriceRange === pr.value ? S.filterOptionActive : {}) }}><span style={{ width: 14, height: 14, borderRadius: 3, border: filterPriceRange === pr.value ? '2px solid var(--ocean)' : '1.5px solid var(--driftwood)', background: filterPriceRange === pr.value ? 'var(--ocean)' : 'transparent', display: 'inline-block', flexShrink: 0 }} />{pr.label}</div>))}
        </div>
        <div style={S.filterGroup}>
          <div style={S.filterTitle}>Brand</div>
          {RETAILERS.map(b => (<div key={b} onClick={() => setFilterBrand(filterBrand === b ? '' : b)} style={{ ...S.filterOption, ...(filterBrand === b ? S.filterOptionActive : {}) }}><span style={{ width: 14, height: 14, borderRadius: 3, border: filterBrand === b ? '2px solid var(--ocean)' : '1.5px solid var(--driftwood)', background: filterBrand === b ? 'var(--ocean)' : 'transparent', display: 'inline-block', flexShrink: 0 }} />{b}</div>))}
        </div>
      </div>
    );

    return (
      <div style={{ padding: '32px 0 64px' }}>
        <div className="container">
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--warm-gray)', marginBottom: 6 }}><span style={{ cursor: 'pointer' }} onClick={goHome}>Home</span> / <span>Furniture</span>{filterRoom && <> / <span>{filterRoom}</span></>}{filterStyle && <> / <span>{filterStyle}</span></>}</div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--navy)' }}>{filterRoom || filterStyle || filterType || 'All Coastal Furniture'}</h1>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--warm-gray)' }}>{Icons.search}</span>
              <input type="text" placeholder="Search furniture..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', paddingLeft: 40, padding: '10px 14px 10px 40px', borderRadius: 8, border: '1.5px solid var(--driftwood)', fontSize: '0.92rem' }} />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--driftwood)', fontSize: '0.9rem', background: 'var(--white)' }}>
              <option value="featured">Sort: Featured</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="newest">Newest First</option>
            </select>
            <button onClick={() => setShowMobileFilters(!showMobileFilters)} style={{ ...S.btnOutline, padding: '10px 16px' }}>{Icons.filter} Filters</button>
          </div>
          {hasFilters && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {filterRoom && <span onClick={() => setFilterRoom('')} style={{ ...S.badge, background: 'var(--ocean)', color: 'white', cursor: 'pointer', padding: '4px 12px' }}>{filterRoom} x</span>}
              {filterStyle && <span onClick={() => setFilterStyle('')} style={{ ...S.badge, background: 'var(--ocean)', color: 'white', cursor: 'pointer', padding: '4px 12px' }}>{filterStyle} x</span>}
              {filterType && <span onClick={() => setFilterType('')} style={{ ...S.badge, background: 'var(--ocean)', color: 'white', cursor: 'pointer', padding: '4px 12px' }}>{filterType} x</span>}
              {filterBrand && <span onClick={() => setFilterBrand('')} style={{ ...S.badge, background: 'var(--ocean)', color: 'white', cursor: 'pointer', padding: '4px 12px' }}>{filterBrand} x</span>}
            </div>
          )}
          {showMobileFilters && <FilterSidebar mobile />}
          <div style={{ display: 'flex', gap: 32 }}>
            <div><FilterSidebar /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--warm-gray)', marginBottom: 16 }}>{filteredProducts.length} piece{filteredProducts.length !== 1 ? 's' : ''}</div>
              {filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ fontSize: '1.3rem', color: 'var(--navy)', marginBottom: 8 }}>No pieces found</div><p style={{ color: 'var(--warm-gray)', marginBottom: 20 }}>Try adjusting your filters.</p><button style={S.btnPrimary} onClick={clearFilters}>Clear Filters</button></div>
              ) : (
                <div style={S.grid3}>{filteredProducts.map(p => (<ProductCard key={p.id} product={p} onClick={() => openProduct(p)} onFav={toggleFav} isFav={favorites.has(p.id)} />))}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DetailPage = () => {
    const p = selectedProduct;
    const [mainImg, setMainImg] = useState(0);
    if (!p) return null;
    const related = products.filter(x => x.id !== p.id && (x.room === p.room || x.style === p.style)).slice(0, 4);
    return (
      <div style={{ padding: '32px 0 64px' }}>
        <div className="container">
          <div style={{ fontSize: '0.82rem', color: 'var(--warm-gray)', marginBottom: 24 }}>
            <span style={{ cursor: 'pointer' }} onClick={goHome}>Home</span> / <span style={{ cursor: 'pointer' }} onClick={() => goBrowse('', '')}>Furniture</span> / <span style={{ cursor: 'pointer' }} onClick={() => goBrowse(p.room, '')}>{p.room}</span> / <span style={{ color: 'var(--navy)' }}>{p.name}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
            <div>
              <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 12, background: 'var(--sand-light)' }}><img src={p.images?.[mainImg] || p.images?.[0]} alt={p.name} style={{ width: '100%', height: 480, objectFit: 'cover' }} /></div>
              {p.images?.length > 1 && (<div style={{ display: 'flex', gap: 8 }}>{p.images.map((img, i) => (<div key={i} onClick={() => setMainImg(i)} style={{ borderRadius: 8, overflow: 'hidden', border: mainImg === i ? '2px solid var(--ocean)' : '2px solid transparent', cursor: 'pointer', opacity: mainImg === i ? 1 : 0.6 }}><img src={img} alt="" style={{ width: 80, height: 60, objectFit: 'cover' }} /></div>))}</div>)}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>{p.new && <span style={{ ...S.badge, ...S.badgeNew }}>New Arrival</span>}{p.salePrice && <span style={{ ...S.badge, ...S.badgeSale }}>Sale</span>}</div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>{p.name}</h1>
              <div style={{ fontSize: '0.95rem', color: 'var(--warm-gray)', marginBottom: 16 }}>by <strong style={{ color: 'var(--ocean)' }}>{p.brand}</strong></div>
              <div style={{ marginBottom: 24 }}>
                {p.salePrice ? (<div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}><span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--coral)' }}>${p.salePrice.toLocaleString()}</span><span style={{ fontSize: '1.1rem', color: 'var(--warm-gray)', textDecoration: 'line-through' }}>${p.price.toLocaleString()}</span><span style={{ ...S.badge, ...S.badgeSale }}>Save ${(p.price - p.salePrice).toLocaleString()}</span></div>) : (<span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--navy)' }}>${p.price.toLocaleString()}</span>)}
              </div>
              <p style={{ color: 'var(--warm-gray)', lineHeight: 1.7, marginBottom: 24, fontSize: '0.95rem' }}>{p.description}</p>
              <div style={{ borderTop: '1px solid var(--driftwood)', borderBottom: '1px solid var(--driftwood)', padding: '16px 0', marginBottom: 24 }}>
                {p.dimensions && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' }}><span style={{ color: 'var(--warm-gray)' }}>Dimensions</span><span style={{ fontWeight: 500 }}>{p.dimensions}</span></div>}
                {p.material && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' }}><span style={{ color: 'var(--warm-gray)' }}>Material</span><span style={{ fontWeight: 500 }}>{p.material}</span></div>}
                {p.retailer && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' }}><span style={{ color: 'var(--warm-gray)' }}>Retailer</span><span style={{ fontWeight: 500 }}>{p.retailer}</span></div>}
              </div>
              {p.colors?.length > 0 && (<div style={{ marginBottom: 24 }}><div style={{ fontSize: '0.85rem', color: 'var(--warm-gray)', marginBottom: 8 }}>Available Colors</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{p.colors.map(c => (<span key={c} style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid var(--driftwood)', fontSize: '0.82rem', color: 'var(--navy)' }}>{c}</span>))}</div></div>)}
              <a href={p.affiliateUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}><button style={S.btnShop}>Shop This Piece at {p.retailer} {Icons.externalLink}</button></a>
              <button onClick={() => toggleFav(p.id)} style={{ ...S.btnOutline, width: '100%', color: favorites.has(p.id) ? 'var(--coral)' : 'var(--ocean)', borderColor: favorites.has(p.id) ? 'var(--coral)' : 'var(--ocean)' }}>{favorites.has(p.id) ? Icons.heartFill : Icons.heart} {favorites.has(p.id) ? 'Saved to Favorites' : 'Save to Favorites'}</button>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
                <span style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: 16, background: 'var(--sand)', color: 'var(--warm-gray)' }}>{p.department}</span>
                <span style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: 16, background: 'var(--sand)', color: 'var(--warm-gray)' }}>{p.room}</span>
                <span style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: 16, background: 'var(--sand)', color: 'var(--warm-gray)' }}>{p.style}</span>
                <span style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: 16, background: 'var(--sand)', color: 'var(--warm-gray)' }}>{p.type}</span>
              </div>
            </div>
          </div>
          {related.length > 0 && (<div style={{ marginTop: 64 }}><h2 style={S.sectionTitle}>You Might Also Like</h2><div style={{ ...S.grid4, marginTop: 20 }}>{related.map(r => (<ProductCard key={r.id} product={r} onClick={() => openProduct(r)} onFav={toggleFav} isFav={favorites.has(r.id)} />))}</div></div>)}
        </div>
      </div>
    );
  };

  const AdminPanel = () => {
    const emptyProduct = { id: '', name: '', brand: '', price: '', salePrice: '', department: 'Furniture', description: '', images: [''], affiliateUrl: '', retailer: '', room: 'Living Room', style: 'Hamptons Classic', type: 'Sofas & Sectionals', dimensions: '', material: '', colors: [''], featured: false, trending: false, new: true, dateAdded: new Date().toISOString().split('T')[0] };
    const [form, setForm] = useState(editingProduct || emptyProduct);
    const [fetchUrl, setFetchUrl] = useState('');
    const [fetching, setFetching] = useState(false);
    const [importJson, setImportJson] = useState('');
    const fileRef = useRef(null);

    useEffect(() => { if (editingProduct) { setForm(editingProduct); setAdminTab('add'); } }, [editingProduct]);

    const handleSave = () => {
      if (!form.name || !form.price) { alert('Name and price are required'); return; }
      const product = { ...form, id: form.id || 'CL-' + Date.now().toString(36).toUpperCase(), price: parseFloat(form.price) || 0, salePrice: form.salePrice ? parseFloat(form.salePrice) : null, images: (Array.isArray(form.images) ? form.images : form.images.split('\n')).filter(i => i.trim()), colors: typeof form.colors === 'string' ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : form.colors.filter(c => c.trim()) };
      if (editingProduct) { setProducts(prev => prev.map(p => p.id === product.id ? product : p)); } else { setProducts(prev => [...prev, product]); }
      setForm(emptyProduct); setEditingProduct(null); setAdminTab('list');
    };

    const handleDelete = (id) => { if (confirm('Delete this product?')) { setProducts(prev => prev.filter(p => p.id !== id)); } };

    const handleExport = () => { const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'coastlist-products.json'; a.click(); URL.revokeObjectURL(url); };

    const handleImport = (text) => { try { const data = JSON.parse(text || importJson); if (Array.isArray(data) && data.length > 0) { setProducts(data); setImportJson(''); alert('Imported ' + data.length + ' products'); } else { alert('Invalid JSON'); } } catch (e) { alert('Invalid JSON: ' + e.message); } };

    const handleFileImport = (e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => handleImport(ev.target.result); reader.readAsText(file); } };

    const handleFetch = async () => {
      if (!fetchUrl) return;
      setFetching(true);
      try { const res = await fetch('/api/fetch-product?url=' + encodeURIComponent(fetchUrl)); const data = await res.json(); if (data.error) { alert('Fetch failed: ' + data.error); } else { setForm(prev => ({ ...prev, ...data, images: data.images?.length ? data.images : prev.images })); } } catch (e) { alert('Could not fetch product data. Fill in details manually.'); }
      setFetching(false);
    };

    return (
      <div style={{ padding: '32px 0 64px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div><h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--navy)' }}>Admin Panel</h1><p style={{ color: 'var(--warm-gray)', fontSize: '0.9rem' }}>{products.length} products</p></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={S.btnOutline} onClick={handleExport}>{Icons.download} Export</button>
              <input type="file" ref={fileRef} accept=".json" style={{ display: 'none' }} onChange={handleFileImport} />
              <button style={S.btnOutline} onClick={() => fileRef.current?.click()}>{Icons.upload} Import</button>
              <button style={S.btnPrimary} onClick={() => { setForm(emptyProduct); setEditingProduct(null); setAdminTab('add'); }}>{Icons.plus} Add Product</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid var(--driftwood)' }}>
            {['list', 'add', 'import'].map(tab => (<button key={tab} onClick={() => setAdminTab(tab)} style={{ padding: '10px 20px', background: 'none', border: 'none', fontWeight: adminTab === tab ? 600 : 400, color: adminTab === tab ? 'var(--ocean)' : 'var(--warm-gray)', borderBottom: adminTab === tab ? '2px solid var(--ocean)' : '2px solid transparent', marginBottom: -2, cursor: 'pointer', fontSize: '0.92rem', textTransform: 'capitalize' }}>{tab === 'add' && editingProduct ? 'Edit Product' : tab === 'add' ? 'Add Product' : tab}</button>))}
          </div>
          {adminTab === 'list' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {products.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--white)', borderRadius: 10, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <img src={p.images?.[0] || ''} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.name}</div><div style={{ fontSize: '0.82rem', color: 'var(--warm-gray)' }}>{p.brand} - ${(p.salePrice || p.price)?.toLocaleString()} - {p.room}</div></div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{p.featured && <span style={{ ...S.badge, ...S.badgeFeatured }}>Featured</span>}{p.trending && <span style={{ ...S.badge, background: 'var(--sea-glass)', color: 'var(--navy)' }}>Trending</span>}{p.new && <span style={{ ...S.badge, ...S.badgeNew }}>New</span>}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditingProduct(p); setForm(p); setAdminTab('add'); }} style={{ background: 'var(--sand-light)', border: '1px solid var(--driftwood)', borderRadius: 6, padding: 8, cursor: 'pointer', color: 'var(--ocean)' }}>{Icons.edit}</button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'var(--sand-light)', border: '1px solid var(--driftwood)', borderRadius: 6, padding: 8, cursor: 'pointer', color: 'var(--coral)' }}>{Icons.trash}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {adminTab === 'add' && (
            <div style={{ maxWidth: 720, background: 'var(--white)', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ marginBottom: 24, padding: 16, background: 'var(--sand-light)', borderRadius: 8 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', marginBottom: 8, display: 'block' }}>Auto-fill from Retailer URL</label>
                <div style={{ display: 'flex', gap: 8 }}><input value={fetchUrl} onChange={e => setFetchUrl(e.target.value)} placeholder="Paste product URL" style={{ flex: 1 }} /><button onClick={handleFetch} disabled={fetching} style={{ ...S.btnPrimary, opacity: fetching ? 0.6 : 1 }}>{fetching ? 'Fetching...' : 'Fetch'}</button></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Product Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} placeholder="e.g., Malibu Slipcovered Sofa" /></div>
                <div><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Brand / Retailer</label><select value={form.retailer} onChange={e => setForm({ ...form, retailer: e.target.value, brand: e.target.value })} style={{ width: '100%' }}><option value="">Select...</option>{RETAILERS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Department</label><select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={{ width: '100%' }}>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Price *</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={{ width: '100%' }} placeholder="1299" /></div>
                <div><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Sale Price</label><input type="number" value={form.salePrice || ''} onChange={e => setForm({ ...form, salePrice: e.target.value })} style={{ width: '100%' }} placeholder="999" /></div>
                <div><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Room</label><select value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} style={{ width: '100%' }}>{ROOMS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Style</label><select value={form.style} onChange={e => setForm({ ...form, style: e.target.value })} style={{ width: '100%' }}>{STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%' }}>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: '100%', minHeight: 100, resize: 'vertical' }} /></div>
                <div><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Dimensions</label><input value={form.dimensions} onChange={e => setForm({ ...form, dimensions: e.target.value })} style={{ width: '100%' }} /></div>
                <div><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Material</label><input value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} style={{ width: '100%' }} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Colors (comma-separated)</label><input value={Array.isArray(form.colors) ? form.colors.join(', ') : form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} style={{ width: '100%' }} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Image URLs (one per line)</label><textarea value={Array.isArray(form.images) ? form.images.join('\n') : form.images} onChange={e => setForm({ ...form, images: e.target.value.split('\n') })} style={{ width: '100%', minHeight: 80, resize: 'vertical' }} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Affiliate URL</label><input value={form.affiliateUrl} onChange={e => setForm({ ...form, affiliateUrl: e.target.value })} style={{ width: '100%' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
                {[{ key: 'featured', label: 'Featured' },{ key: 'trending', label: 'Trending' },{ key: 'new', label: 'New Arrival' }].map(t => (<label key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}><input type="checkbox" checked={form[t.key]} onChange={e => setForm({ ...form, [t.key]: e.target.checked })} />{t.label}</label>))}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <button style={S.btnPrimary} onClick={handleSave}>{editingProduct ? 'Update Product' : 'Publish Product'}</button>
                <button style={S.btnOutline} onClick={() => { setForm(emptyProduct); setEditingProduct(null); setAdminTab('list'); }}>Cancel</button>
              </div>
            </div>
          )}
          {adminTab === 'import' && (
            <div style={{ maxWidth: 720, background: 'var(--white)', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 16 }}>Import / Export Products</h3>
              <div style={{ marginBottom: 24 }}><button style={S.btnPrimary} onClick={handleExport}>{Icons.download} Export All as JSON</button></div>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>Paste JSON to Import</label><textarea value={importJson} onChange={e => setImportJson(e.target.value)} style={{ width: '100%', minHeight: 200, fontFamily: 'monospace', fontSize: '0.82rem' }} /><button style={{ ...S.btnPrimary, marginTop: 12 }} onClick={() => handleImport()}>{Icons.upload} Import Products</button></div>
              <div style={{ marginTop: 16, padding: 12, background: 'var(--sand)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--warm-gray)' }}>Importing replaces all existing products. Export first to back up.</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const Footer = () => (
    <footer style={S.footer}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div><Logo /><p style={{ marginTop: 16, fontSize: '0.85rem', lineHeight: 1.7 }}>Curated coastal furniture and decor for your life by the water.</p></div>
          <div><h4 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: 14 }}>Shop</h4><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{['Living Room','Bedroom','Dining Room','Outdoor / Patio'].map(r => (<span key={r} onClick={() => goBrowse(r, '')} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>{r}</span>))}</div></div>
          <div><h4 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: 14 }}>Styles</h4><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{STYLES.map(s => (<span key={s} onClick={() => goBrowse('', s)} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>{s}</span>))}</div></div>
          <div><h4 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: 14 }}>About</h4><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>About CoastList</span><span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Contact</span><span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Privacy Policy</span><span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Affiliate Disclosure</span></div></div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>&copy; {new Date().getFullYear()} CoastList. All rights reserved. Products are sold by their respective retailers.</div>
      </div>
    </footer>
  );

  return (<><Nav />{view === 'home' && <HomePage />}{view === 'browse' && <BrowsePage />}{view === 'detail' && <DetailPage />}{view === 'admin' && <AdminPanel />}<Footer /></>);
}
