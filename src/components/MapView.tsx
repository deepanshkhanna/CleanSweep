"use client";

import dynamic from "next/dynamic";

const MapViewInner = dynamic(() => import("./MapViewInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <div className="animate-pulse text-muted-foreground">Loading map...</div>
    </div>
  ),
});

interface MapViewProps {
  onMapClick?: (lat: number, lng: number) => void;
  pinLocation?: { lat: number; lng: number } | null;
}

export function MapView({ onMapClick, pinLocation }: MapViewProps) {
  return <MapViewInner onMapClick={onMapClick} pinLocation={pinLocation} />;
}
