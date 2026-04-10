"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Drawer } from "vaul";
import { useReportStore } from "@/store/reportStore";
import { reverseGeocode } from "@/lib/nominatim";
import { Button } from "@/components/ui/button";
import { SEVERITY_COLORS, type Severity } from "@/types/report";
import { MapPin, Navigation, Camera, Send, X, Loader2, CheckCircle2 } from "lucide-react";
import imageCompression from "browser-image-compression";

interface ReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pinLocation: { lat: number; lng: number } | null;
  onRequestPin: () => void;
  userSession?: { name: string; email: string } | null;
}

const severityConfig = {
  low: { label: "Low", description: "Minor litter" },
  medium: { label: "Medium", description: "Needs attention" },
  high: { label: "High", description: "Urgent!" },
};

export function ReportForm({ open, onOpenChange, pinLocation, onRequestPin, userSession: _userSession }: ReportFormProps) {
  const [severity, setSeverity] = useState<Severity>("medium");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const addReport = useReportStore((s) => s.addReport);

  // Sync pin from parent
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
    const loadingToast = toast.loading("Getting your location...");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
      const { latitude: lat, longitude: lng } = pos.coords;
      setLocation({ lat, lng });
      setAddress(null);
      toast.dismiss(loadingToast);
      toast.success("Location set!");
      const addr = await reverseGeocode(lat, lng);
      if (addr) setAddress(addr);
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Location unavailable", { description: "Use the map pin instead." });
    } finally {
      setGeoLoading(false);
    }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1024 });
      setPhotoFile(compressed);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(compressed);
    } catch {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      toast.error("Location required", { description: "Use GPS or drop a pin on the map." });
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
      toast.success("Report submitted!", { description: "It's now visible on the map." });
      // Reset
      setDescription("");
      setSeverity("medium");
      setPhotoFile(null);
      setPhotoPreview(null);
      setLocation(null);
      setAddress(null);
      onOpenChange(false);
    } catch {
      toast.error("Submission failed", { description: "Check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-2xl fixed bottom-0 left-0 right-0 max-h-[90vh] z-50 shadow-2xl">

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-8 h-1 rounded-full bg-slate-300" />
          </div>

          {/* Header */}
          <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 shrink-0">
            <div>
              <Drawer.Title className="text-base font-bold text-slate-900">
                Report Waste Spot
              </Drawer.Title>
              <p className="text-xs text-slate-400 mt-0.5">Help keep the community clean</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Form body */}
          <div className="p-5 overflow-y-auto flex flex-col gap-5 pb-10">

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                Location <span className="text-red-500 normal-case tracking-normal">required</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGPS}
                  disabled={geoLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-60"
                >
                  {geoLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Navigation className="w-4 h-4 text-blue-500" />}
                  My Location
                </button>
                <button
                  type="button"
                  onClick={() => { onRequestPin(); onOpenChange(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <MapPin className="w-4 h-4 text-green-500" />
                  Drop Pin
                </button>
              </div>

              {location && (
                <div className="mt-2 flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-mono text-green-700">
                      {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </p>
                    {address && (
                      <p className="text-xs text-slate-600 mt-0.5 leading-tight line-clamp-2">
                        {address}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Severity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                Severity
              </label>
              <div className="flex gap-2">
                {(Object.keys(severityConfig) as Severity[]).map((s) => {
                  const active = severity === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold capitalize transition-all active:scale-95 ${
                        active ? "text-white border-transparent shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                      style={active ? { backgroundColor: SEVERITY_COLORS[s], borderColor: SEVERITY_COLORS[s] } : undefined}
                    >
                      {severityConfig[s].label}
                      <span className={`block text-[10px] font-normal mt-0.5 ${active ? "text-white/80" : "text-slate-400"}`}>
                        {severityConfig[s].description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                Description <span className="text-slate-400 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What do you see? e.g. overflowing bin, plastic bags..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-slate-400"
              />
            </div>

            {/* Photo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                Photo <span className="text-slate-400 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              {photoPreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={photoPreview} alt="Preview" className="w-full h-44 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all">
                  <Camera className="w-6 h-6 text-slate-300" />
                  <span className="text-sm text-slate-400 mt-1.5 font-medium">Tap to add a photo</span>
                  <span className="text-xs text-slate-300 mt-0.5">Auto-compressed for fast upload</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                </label>
              )}
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !location}
              className={`w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                !location || submitting
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200"
              }`}
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                : <><Send className="w-4 h-4" /> Submit Report</>}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
