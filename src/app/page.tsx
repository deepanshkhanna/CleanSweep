"use client";

import { useEffect, useState, useCallback } from "react";
import { useReportStore } from "@/store/reportStore";
import { MapView } from "@/components/MapView";
import { Dashboard } from "@/components/Dashboard";
import { ReportForm } from "@/components/ReportForm";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export default function Home() {
  const subscribe = useReportStore((s) => s.subscribe);
  const loading = useReportStore((s) => s.loading);
  const [formOpen, setFormOpen] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [pinLocation, setPinLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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

  const handleRequestPin = useCallback(() => {
    setPinMode(true);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-green-600" />
          <h1 className="text-lg font-bold text-gray-900">CleanSweep</h1>
        </div>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Report Spot
        </Button>
      </header>

      {/* Dashboard */}
      <div className="px-4 py-3 bg-gray-50/80 shrink-0">
        <Dashboard />
      </div>

      {/* Pin mode banner */}
      {pinMode && (
        <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium animate-pulse shrink-0">
          Tap on the map to drop a pin
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        )}
        <MapView onMapClick={handleMapClick} pinLocation={pinLocation} />
      </div>

      {/* Report Form BottomSheet */}
      <ReportForm
        open={formOpen}
        onOpenChange={setFormOpen}
        pinLocation={pinLocation}
        onRequestPin={handleRequestPin}
      />
    </div>
  );
}
