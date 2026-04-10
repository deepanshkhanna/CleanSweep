"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useReportStore } from "@/store/reportStore";
import { Button } from "@/components/ui/button";
import type { Report } from "@/types/report";
import { Hand, CheckCircle, Loader2, Camera, Send, X, Clock } from "lucide-react";
import imageCompression from "browser-image-compression";

interface ClaimButtonProps {
  report: Report;
}

export function ClaimButton({ report }: ClaimButtonProps) {
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const claimReport = useReportStore((s) => s.claimReport);
  const submitCleanupProof = useReportStore((s) => s.submitCleanupProof);

  useEffect(() => {
    const stored = localStorage.getItem("cleansweep_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserName(parsed.name ?? "");
      } catch { /* ignore */ }
    }
  }, []);

  const handleProofPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1024 });
      setProofFile(compressed);
      const reader = new FileReader();
      reader.onload = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(compressed);
    } catch {
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async () => {
    if (!proofFile) return;
    setLoading(true);
    try {
      await submitCleanupProof(report.id, proofFile);
      toast.success("Proof submitted!", {
        description: "Admin will verify your cleanup shortly.",
      });
      setSubmittingProof(false);
      setProofFile(null);
      setProofPreview(null);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (report.status === "verified") {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
          <CheckCircle className="w-3.5 h-3.5" />
          Cleanup Verified by Admin
        </div>
        {report.verifiedNote && (
          <p className="text-[11px] text-slate-500 italic">&ldquo;{report.verifiedNote}&rdquo;</p>
        )}
      </div>
    );
  }

  if (report.status === "pending_verification") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
        <Clock className="w-3.5 h-3.5" />
        Awaiting admin verification…
      </div>
    );
  }

  if (report.status === "cleaned") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
        <CheckCircle className="w-3.5 h-3.5" />
        Cleaned up — thank you!
      </div>
    );
  }

  if (report.status === "in_progress") {
    if (submittingProof) {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-700">Upload cleanup proof photo</p>
          {proofPreview ? (
            <div className="relative rounded-lg overflow-hidden">
              <img src={proofPreview} alt="Proof" className="w-full h-28 object-cover" />
              <button
                type="button"
                onClick={() => { setProofFile(null); setProofPreview(null); }}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <Camera className="w-5 h-5 text-slate-300" />
              <span className="text-[11px] text-slate-400 mt-1">Tap to add proof photo</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleProofPhoto} />
            </label>
          )}
          <div className="flex gap-1.5">
            <Button
              size="sm"
              className="flex-1 text-xs h-8 bg-green-600 hover:bg-green-700"
              disabled={loading || !proofFile}
              onClick={handleSubmitProof}
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
              {loading ? "Uploading..." : "Submit for Verification"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-8 text-slate-500"
              onClick={() => { setSubmittingProof(false); setProofFile(null); setProofPreview(null); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-blue-600 font-medium">
          Volunteer: {report.claimedBy}
        </p>
        <Button
          size="sm"
          className="w-full text-xs h-8 bg-green-600 hover:bg-green-700 text-white"
          onClick={() => setSubmittingProof(true)}
        >
          <Camera className="w-3 h-3 mr-1" />
          Submit Cleanup Proof
        </Button>
      </div>
    );
  }

  // reported — show claim
  if (claiming) {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Your name"
          autoFocus
          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyDown={async (e) => {
            if (e.key === "Enter" && userName.trim()) {
              setLoading(true);
              try {
                await claimReport(report.id, userName.trim());
                toast.success(`Claimed by ${userName.trim()}!`, { description: "Head over to clean it up." });
              } catch { toast.error("Claim failed."); }
              finally { setLoading(false); setClaiming(false); }
            }
            if (e.key === "Escape") setClaiming(false);
          }}
        />
        <div className="flex gap-1.5">
          <Button
            size="sm"
            className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
            disabled={loading || !userName.trim()}
            onClick={async () => {
              if (!userName.trim()) return;
              setLoading(true);
              try {
                await claimReport(report.id, userName.trim());
                toast.success(`Claimed by ${userName.trim()}!`, { description: "Head over to clean it up." });
              } catch { toast.error("Claim failed."); }
              finally { setLoading(false); setClaiming(false); }
            }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
          </Button>
          <Button size="sm" variant="ghost" className="text-xs h-8 text-slate-500" onClick={() => setClaiming(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform"
      onClick={() => setClaiming(true)}
    >
      <Hand className="w-3 h-3 mr-1" />
      Claim for Cleanup
    </Button>
  );
}
