"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useReportStore } from "@/store/reportStore";
import { SEVERITY_COLORS, type Report } from "@/types/report";
import { MarkerPopup } from "./MarkerPopup";
import { createRoot } from "react-dom/client";

const SRM_CENTER: [number, number] = [12.8231, 80.0444];

interface MapViewProps {
  onMapClick?: (lat: number, lng: number) => void;
  pinLocation?: { lat: number; lng: number } | null;
}

export default function MapViewInner({ onMapClick, pinLocation }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const pinMarkerRef = useRef<L.Marker | null>(null);
  const reports = useReportStore((s) => s.reports);

  // Initialize map
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

  // Handle map click
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onMapClick) return;

    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [onMapClick]);

  // Update pin marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pinMarkerRef.current) {
      pinMarkerRef.current.remove();
      pinMarkerRef.current = null;
    }

    if (pinLocation) {
      const pinIcon = L.divIcon({
        className: "pin-marker",
        html: `<div style="width:24px;height:24px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      pinMarkerRef.current = L.marker([pinLocation.lat, pinLocation.lng], {
        icon: pinIcon,
      }).addTo(map);
    }
  }, [pinLocation]);

  // Render report markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    reports.forEach((report) => {
      const color = getMarkerColor(report);
      const marker = L.circleMarker([report.lat, report.lng], {
        radius: report.status === "cleaned" ? 6 : 10,
        fillColor: color,
        color: report.status === "in_progress" ? "#3b82f6" : color,
        weight: report.status === "in_progress" ? 3 : 2,
        opacity: 1,
        fillOpacity: report.status === "cleaned" ? 0.4 : 0.8,
        className:
          report.severity === "high" && report.status === "reported"
            ? "pulse-marker"
            : "",
      }).addTo(map);

      // Create popup with React content
      const popupContainer = document.createElement("div");
      const root = createRoot(popupContainer);
      root.render(<MarkerPopup report={report} />);

      marker.bindPopup(popupContainer, {
        maxWidth: 300,
        minWidth: 250,
        className: "custom-popup",
      });

      markersRef.current.push(marker);
    });
  }, [reports]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    />
  );
}

function getMarkerColor(report: Report): string {
  if (report.status === "cleaned") return "#6b7280";
  if (report.status === "in_progress") return "#3b82f6";
  return SEVERITY_COLORS[report.severity];
}
