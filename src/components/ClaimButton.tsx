"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useReportStore } from "@/store/reportStore";
import { Button } from "@/components/ui/button";
import type { Report } from "@/types/report";
import { Hand, CheckCircle, Loader2 } from "lucide-react";

interface ClaimButtonProps {
  report: Report;
}

export function ClaimButton({ report }: ClaimButtonProps) {
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [name, setName] = useState("");
  const claimReport = useReportStore((s) => s.claimReport);
  const markCleaned = useReportStore((s) => s.markCleaned);

  if (report.status === "cleaned") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
        <CheckCircle className="w-3.5 h-3.5" />
        Cleaned up — thank you!
      </div>
    );
  }

  if (report.status === "in_progress") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-blue-600 font-medium">
          Volunteer: {report.claimedBy}
        </p>
        <Button
          size="sm"
          className="w-full text-xs h-8 bg-green-600 hover:bg-green-700 text-white"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            try {
              await markCleaned(report.id);
              toast.success("Marked as cleaned!", {
                description: "Great work — the community thanks you.",
              });
            } catch {
              toast.error("Update failed. Please try again.");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
          {loading ? "Updating..." : "Mark as Cleaned"}
        </Button>
      </div>
    );
  }

  if (claiming) {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoFocus
          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyDown={async (e) => {
            if (e.key === "Enter" && name.trim()) {
              setLoading(true);
              try {
                await claimReport(report.id, name.trim());
                toast.success(`Claimed by ${name.trim()}!`, {
                  description: "Head over to clean it up.",
                });
              } catch {
                toast.error("Claim failed. Please try again.");
              } finally {
                setLoading(false);
                setClaiming(false);
              }
            }
            if (e.key === "Escape") { setClaiming(false); setName(""); }
          }}
        />
        <div className="flex gap-1.5">
          <Button
            size="sm"
            className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
            disabled={loading || !name.trim()}
            onClick={async () => {
              if (!name.trim()) return;
              setLoading(true);
              try {
                await claimReport(report.id, name.trim());
                toast.success(`Claimed by ${name.trim()}!`, {
                  description: "Head over to clean it up.",
                });
              } catch {
                toast.error("Claim failed. Please try again.");
              } finally {
                setLoading(false);
                setClaiming(false);
              }
            }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-8 text-slate-500"
            onClick={() => { setClaiming(false); setName(""); }}
          >
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
