'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Define the listing type for map markers
interface MapListing {
  id: string;
  title: string;
  street?: string | null;
  city?: string | null;
  rent?: number | null;
  beds?: number | null;
  lat?: number;
  lng?: number;
}

interface ListingsMapProps {
  listings: MapListing[];
}

// Ann Arbor coordinates
const ANN_ARBOR_CENTER = { lat: 42.2808, lng: -83.7430 };

// Simple address to approximate coordinates for Ann Arbor
// This provides rough location based on known landmarks/streets
function approximateCoordinates(street?: string | null, city?: string | null): { lat: number; lng: number } {
  if (!street || !city?.toLowerCase().includes('ann arbor')) {
    return ANN_ARBOR_CENTER;
  }

  const streetLower = street.toLowerCase();
  
  // Known Ann Arbor street approximations
  const streetCoords: Record<string, { lat: number; lng: number }> = {
    'state st': { lat: 42.2731, lng: -83.7407 },
    'south state': { lat: 42.2700, lng: -83.7407 },
    'n state': { lat: 42.2850, lng: -83.7407 },
    'division': { lat: 42.2750, lng: -83.7450 },
    'packard': { lat: 42.2650, lng: -83.7400 },
    'washtenaw': { lat: 42.2700, lng: -83.7200 },
    'plymouth': { lat: 42.2950, lng: -83.7300 },
    'huron': { lat: 42.2810, lng: -83.7490 },
    'liberty': { lat: 42.2795, lng: -83.7500 },
    'main st': { lat: 42.2800, lng: -83.7480 },
    'ashley': { lat: 42.2815, lng: -83.7520 },
    'miller': { lat: 42.2870, lng: -83.7550 },
    'geddes': { lat: 42.2730, lng: -83.7200 },
    'hill': { lat: 42.2740, lng: -83.7350 },
    'church': { lat: 42.2750, lng: -83.7380 },
    'thompson': { lat: 42.2720, lng: -83.7390 },
    'maynard': { lat: 42.2790, lng: -83.7440 },
    'william': { lat: 42.2785, lng: -83.7430 },
    'jefferson': { lat: 42.2775, lng: -83.7420 },
    'madison': { lat: 42.2765, lng: -83.7410 },
    'forest': { lat: 42.2680, lng: -83.7350 },
    'oakland': { lat: 42.2760, lng: -83.7370 },
    'catherine': { lat: 42.2830, lng: -83.7450 },
    'ann': { lat: 42.2820, lng: -83.7480 },
    'kingsley': { lat: 42.2840, lng: -83.7470 },
  };

  // Find matching street
  for (const [streetKey, coords] of Object.entries(streetCoords)) {
    if (streetLower.includes(streetKey)) {
      // Add small random offset to prevent markers from stacking
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.003,
        lng: coords.lng + (Math.random() - 0.5) * 0.003,
      };
    }
  }

  // Default with random offset around Ann Arbor center
  return {
    lat: ANN_ARBOR_CENTER.lat + (Math.random() - 0.5) * 0.02,
    lng: ANN_ARBOR_CENTER.lng + (Math.random() - 0.5) * 0.02,
  };
}

// The actual map component - loaded dynamically to avoid SSR issues
function MapComponent({ listings }: ListingsMapProps) {
  const [L, setL] = useState<typeof import('leaflet') | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Import Leaflet only on client side
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
      setMapReady(true);
    });
  }, []);

  useEffect(() => {
    if (!mapReady || !L) return;

    // Fix default marker icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // Create map
    const map = L.map('listings-map').setView([ANN_ARBOR_CENTER.lat, ANN_ARBOR_CENTER.lng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add markers for each listing
    listings.forEach((listing) => {
      const coords = approximateCoordinates(listing.street, listing.city);
      
      const popupContent = `
        <div style="font-family: monospace; min-width: 150px;">
          <strong style="font-size: 12px;">${listing.title}</strong>
          <br/>
          <span style="font-size: 11px; color: #666;">${listing.street || 'Ann Arbor'}</span>
          <br/>
          <span style="font-size: 12px; font-weight: bold;">$${listing.rent?.toLocaleString() || 'N/A'}/mo</span>
          ${listing.beds !== null && listing.beds !== undefined ? `<span style="font-size: 11px;"> · ${listing.beds === 0 ? 'Studio' : listing.beds + ' BR'}</span>` : ''}
          <br/>
          <a href="/listings/${listing.id}" style="font-size: 11px; color: #000; text-decoration: underline;">View Details</a>
        </div>
      `;

      L.marker([coords.lat, coords.lng])
        .addTo(map)
        .bindPopup(popupContent);
    });

    // Cleanup
    return () => {
      map.remove();
    };
  }, [mapReady, L, listings]);

  if (!mapReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-50">
        <span className="text-xs text-neutral-400">Loading map...</span>
      </div>
    );
  }

  return <div id="listings-map" className="w-full h-full" />;
}

// Export as dynamic component to prevent SSR
export default function ListingsMap(props: ListingsMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-50">
        <div className="text-center text-neutral-400">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs tracking-wider">Loading map...</span>
        </div>
      </div>
    );
  }

  return <MapComponent {...props} />;
}
