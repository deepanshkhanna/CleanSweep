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
      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs"
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
    );
  }

  return (
    <Button
      size="sm"
      className="w-full text-xs bg-blue-600 hover:bg-blue-700"
      disabled={loading}
      onClick={async () => {
        const name = prompt("Enter your name to claim this spot:");
        if (!name) return;
        setLoading(true);
        await claimReport(report.id, name);
        setLoading(false);
      }}
    >
      <Hand className="w-3 h-3 mr-1" />
      {loading ? "Claiming..." : "Claim for Cleanup"}
    </Button>
  );
}
