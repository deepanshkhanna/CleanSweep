"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { useReportStore } from "@/store/reportStore";
import { reverseGeocode } from "@/lib/nominatim";
import { Button } from "@/components/ui/button";
import { SEVERITY_COLORS, type Severity } from "@/types/report";
import { MapPin, Navigation, Camera, Send, X, Loader2 } from "lucide-react";
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
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const addReport = useReportStore((s) => s.addReport);

  // Sync pin location from parent when it changes
  useEffect(() => {
    if (!pinLocation) return;
    setLocation(pinLocation);
    setAddress(null);
    reverseGeocode(pinLocation.lat, pinLocation.lng).then((addr) => {
      if (addr) setAddress(addr);
    });
  }, [pinLocation]);

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
      setAddress(null);
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
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
      });
      setPhotoFile(compressed);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(compressed);
    } catch {
      // Compression failed, use original
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
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
        description: description.trim() || `${severity.charAt(0).toUpperCase() + severity.slice(1)} severity waste spotted`,
        photoUrl: photoPreview ?? "",
        address: address ?? undefined,
        photoFile: photoFile ?? undefined,
      });
      // Reset
      setDescription("");
      setSeverity("medium");
      setPhotoFile(null);
      setPhotoPreview(null);
      setLocation(null);
      setAddress(null);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to submit report:", err);
      alert("Failed to submit. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const severityOptions: Severity[] = ["low", "medium", "high"];

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-2xl fixed bottom-0 left-0 right-0 max-h-[88vh] z-50 shadow-2xl">
          {/* Handle */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="px-4 py-2 flex items-center justify-between shrink-0 border-b">
            <Drawer.Title className="text-base font-semibold">
              Report Waste Spot
            </Drawer.Title>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Scrollable content */}
          <div className="p-4 overflow-y-auto flex flex-col gap-4 pb-8">

            {/* Location */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Location <span className="text-red-500">*</span>
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
              {location ? (
                <div className="mt-2 text-xs bg-green-50 border border-green-200 rounded-md p-2">
                  <span className="font-mono text-green-700">
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </span>
                  {address && (
                    <p className="mt-1 text-gray-600 leading-tight line-clamp-2">
                      {address}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-1.5 text-xs text-gray-400">
                  Use GPS or tap "Drop Pin on Map" to set location
                </p>
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
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium capitalize transition-all border-2 ${
                      severity === s
                        ? "text-white border-transparent shadow-md"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                    style={
                      severity === s
                        ? { backgroundColor: SEVERITY_COLORS[s], borderColor: SEVERITY_COLORS[s] }
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
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the waste spot..."
                className="w-full p-2.5 border rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Photo */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Photo <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              {photoPreview ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-7 w-7 p-0"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Camera className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Tap to add photo</span>
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
              className="w-full bg-green-600 hover:bg-green-700 text-white h-11"
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
