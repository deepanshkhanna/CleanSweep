"use client";

import { useEffect, useState, useCallback } from "react";
import { useReportStore } from "@/store/reportStore";
import { MapView } from "@/components/MapView";
import { Dashboard } from "@/components/Dashboard";
import { ReportForm } from "@/components/ReportForm";
import { MapLegend } from "@/components/MapLegend";
import { Plus, Leaf } from "lucide-react";

export default function Home() {
  const subscribe = useReportStore((s) => s.subscribe);
  const loading = useReportStore((s) => s.loading);
  const [formOpen, setFormOpen] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe();
    return () => unsubscribe();
  }, [subscribe]);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (pinMode) {
        setPinLocation({ lat, lng });
        setPinMode(false);
        setFormOpen(true);
      }
    },
    [pinMode]
  );

  const handleRequestPin = useCallback(() => setPinMode(true), []);

  return (
    <div className="h-full flex flex-col">

      {/* ── Header ── */}
      <header className="header-enter bg-white border-b border-slate-200 px-4 shrink-0 z-10" style={{ height: "56px" }}>
        <div className="h-full flex items-center justify-between max-w-screen-xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm shadow-green-200">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-none">CleanSweep</h1>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Community cleanup tracker</p>
            </div>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-md shadow-green-200 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Report Spot
          </button>
        </div>
      </header>

      {/* ── Dashboard strip ── */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 shrink-0">
        <Dashboard />
      </div>

      {/* ── Pin mode banner ── */}
      {pinMode && (
        <div className="pin-banner bg-blue-600 text-white text-xs font-semibold text-center py-2.5 px-4 shrink-0 flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Tap anywhere on the map to drop a pin
          <button
            className="ml-2 text-white/70 hover:text-white underline"
            onClick={() => setPinMode(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Map ── */}
      <div className="flex-1 relative map-enter">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center z-10 gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-slate-400 font-medium">Loading map data…</p>
          </div>
        )}

        <MapView onMapClick={handleMapClick} pinLocation={pinLocation} />
        <MapLegend />
      </div>

      {/* ── Report form bottom sheet ── */}
      <ReportForm
        open={formOpen}
        onOpenChange={setFormOpen}
        pinLocation={pinLocation}
        onRequestPin={handleRequestPin}
      />
    </div>
  );
}
