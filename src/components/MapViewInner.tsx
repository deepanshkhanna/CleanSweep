"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useReportStore } from "@/store/reportStore";
import { SEVERITY_COLORS, type Report } from "@/types/report";
import { MarkerPopup } from "./MarkerPopup";
import { createRoot, type Root } from "react-dom/client";

const SRM_CENTER: [number, number] = [12.8231, 80.0444];

interface MapViewProps {
  onMapClick?: (lat: number, lng: number) => void;
  pinLocation?: { lat: number; lng: number } | null;
}

function getMarkerColor(report: Report): string {
  if (report.status === "cleaned") return "#6b7280";
  if (report.status === "in_progress") return "#3b82f6";
  return SEVERITY_COLORS[report.severity];
}

function createReportIcon(report: Report): L.DivIcon {
  const color = getMarkerColor(report);
  const isCleaned = report.status === "cleaned";
  const isInProgress = report.status === "in_progress";
  const isPulsing = report.severity === "high" && report.status === "reported";
  const size = isCleaned ? 12 : 20;

  const border = isInProgress
    ? `3px solid #3b82f6`
    : `2px solid white`;

  const pulseHtml = isPulsing
    ? `<div class="pulse-ring" style="position:absolute;top:50%;left:50%;width:100%;height:100%;border-radius:50%;background:${color};transform:translate(-50%,-50%);"></div>`
    : "";

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulseHtml}
        <div style="
          position:absolute;top:0;left:0;
          width:${size}px;height:${size}px;
          background:${color};
          border-radius:50%;
          border:${border};
          box-shadow:0 2px 6px rgba(0,0,0,0.35);
          opacity:${isCleaned ? 0.5 : 1};
        "></div>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 6)],
  });
}

export default function MapViewInner({ onMapClick, pinLocation }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const rootsRef = useRef<Root[]>([]);
  const pinMarkerRef = useRef<L.Marker | null>(null);
  const reports = useReportStore((s) => s.reports);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: SRM_CENTER,
      zoom: 16,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Map click handler
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onMapClick) return;
    const handler = (e: L.LeafletMouseEvent) =>
      onMapClick(e.latlng.lat, e.latlng.lng);
    map.on("click", handler);
    return () => { map.off("click", handler); };
  }, [onMapClick]);

  // Pin drop marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (pinMarkerRef.current) {
      pinMarkerRef.current.remove();
      pinMarkerRef.current = null;
    }
    if (pinLocation) {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:22px;height:22px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      pinMarkerRef.current = L.marker([pinLocation.lat, pinLocation.lng], { icon }).addTo(map);
    }
  }, [pinLocation]);

  // Render report markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean up old markers and React roots
    markersRef.current.forEach((m) => m.remove());
    rootsRef.current.forEach((r) => r.unmount());
    markersRef.current = [];
    rootsRef.current = [];

    reports.forEach((report) => {
      const marker = L.marker([report.lat, report.lng], {
        icon: createReportIcon(report),
      }).addTo(map);

      const container = document.createElement("div");
      const root = createRoot(container);
      root.render(<MarkerPopup report={report} />);

      marker.bindPopup(container, {
        maxWidth: 300,
        minWidth: 250,
        className: "custom-popup",
      });

      markersRef.current.push(marker);
      rootsRef.current.push(root);
    });
  }, [reports]);

  return (
    <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: "400px" }} />
  );
}
