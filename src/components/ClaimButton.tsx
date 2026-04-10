"use client";

import { useState } from "react";
import { useReportStore } from "@/store/reportStore";
import { Button } from "@/components/ui/button";
import type { Report } from "@/types/report";
import { Hand, CheckCircle } from "lucide-react";

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
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <CheckCircle className="w-3 h-3" />
        Cleaned up
      </div>
    );
  }

  if (report.status === "in_progress") {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-xs text-blue-600">Claimed by: {report.claimedBy}</p>
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs border-green-500 text-green-700 hover:bg-green-50"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            await markCleaned(report.id);
            setLoading(false);
          }}
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          {loading ? "Updating..." : "Mark as Cleaned"}
        </Button>
      </div>
    );
  }

  // reported status
  if (claiming) {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoFocus
          className="w-full px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={async (e) => {
            if (e.key === "Enter" && name.trim()) {
              setLoading(true);
              await claimReport(report.id, name.trim());
              setLoading(false);
              setClaiming(false);
            }
          }}
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
            disabled={loading || !name.trim()}
            onClick={async () => {
              if (!name.trim()) return;
              setLoading(true);
              await claimReport(report.id, name.trim());
              setLoading(false);
              setClaiming(false);
            }}
          >
            {loading ? "Claiming..." : "Confirm"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
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
      className="w-full text-xs bg-blue-600 hover:bg-blue-700"
      onClick={() => setClaiming(true)}
    >
      <Hand className="w-3 h-3 mr-1" />
      Claim for Cleanup
    </Button>
  );
}
