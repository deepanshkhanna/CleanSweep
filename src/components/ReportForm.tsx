"use client";

import { useState, useCallback } from "react";
import { Drawer } from "vaul";
import { useReportStore } from "@/store/reportStore";
import { reverseGeocode } from "@/lib/nominatim";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEVERITY_COLORS, type Severity } from "@/types/report";
import {
  MapPin,
  Navigation,
  Camera,
  Send,
  X,
  Loader2,
} from "lucide-react";
import imageCompression from "browser-image-compression";

interface ReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pinLocation: { lat: number; lng: number } | null;
  onRequestPin: () => void;
}

export function ReportForm({
  open,
  onOpenChange,
  pinLocation,
  onRequestPin,
}: ReportFormProps) {
  const [severity, setSeverity] = useState<Severity>("medium");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    pinLocation
  );

  const addReport = useReportStore((s) => s.addReport);

  // Sync pinLocation from parent
  const updateFromPin = useCallback(
    async (lat: number, lng: number) => {
      setLocation({ lat, lng });
      setAddress(null);
      const addr = await reverseGeocode(lat, lng);
      if (addr) setAddress(addr);
    },
    []
  );

  // When pinLocation changes from parent
  if (
    pinLocation &&
    (!location ||
      location.lat !== pinLocation.lat ||
      location.lng !== pinLocation.lng)
  ) {
    updateFromPin(pinLocation.lat, pinLocation.lng);
  }

  const handleGPS = async () => {
    setGeoLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLocation({ lat, lng });
      const addr = await reverseGeocode(lat, lng);
      if (addr) setAddress(addr);
    } catch {
      alert("Could not get your location. Please use the map to drop a pin.");
    } finally {
      setGeoLoading(false);
    }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
    });

    setPhotoFile(compressed);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(compressed);
  };

  const handleSubmit = async () => {
    if (!location) {
      alert("Please set a location first.");
      return;
    }
    setSubmitting(true);
    try {
      await addReport({
        lat: location.lat,
        lng: location.lng,
        severity,
        description: description || `${severity} severity waste spotted`,
        photoUrl: photoPreview ?? "",
        address: address ?? undefined,
        photoFile: photoFile ?? undefined,
      });
      // Reset form
      setDescription("");
      setSeverity("medium");
      setPhotoFile(null);
      setPhotoPreview(null);
      setLocation(null);
      setAddress(null);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to submit report:", err);
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const severityOptions: Severity[] = ["low", "medium", "high"];

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-2xl fixed bottom-0 left-0 right-0 max-h-[85vh] z-50">
          <div className="p-4 pb-0">
            <div className="mx-auto w-12 h-1.5 rounded-full bg-gray-300 mb-4" />
            <Drawer.Title className="text-lg font-semibold flex items-center justify-between">
              Report Waste Spot
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </Drawer.Title>
          </div>

          <div className="p-4 overflow-y-auto flex flex-col gap-4">
            {/* Location */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Location
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleGPS}
                  disabled={geoLoading}
                >
                  {geoLoading ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4 mr-1" />
                  )}
                  Use My Location
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    onRequestPin();
                    onOpenChange(false);
                  }}
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Drop Pin on Map
                </Button>
              </div>
              {location && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-md p-2">
                  <span className="font-mono">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </span>
                  {address && (
                    <p className="mt-1 text-gray-600 leading-tight">
                      {address}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Severity */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Severity
              </label>
              <div className="flex gap-2">
                {severityOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${
                      severity === s
                        ? "text-white shadow-md scale-105"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    style={
                      severity === s
                        ? { backgroundColor: SEVERITY_COLORS[s] }
                        : undefined
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the waste spot..."
                className="w-full p-2 border rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Photo */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Photo
              </label>
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Camera className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">
                    Tap to add photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhoto}
                  />
                </label>
              )}
            </div>

            {/* Submit */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSubmit}
              disabled={submitting || !location}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
