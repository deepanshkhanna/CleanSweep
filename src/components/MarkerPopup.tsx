"use client";

import { type Report, SEVERITY_COLORS } from "@/types/report";
import { ClaimButton } from "./ClaimButton";
import { MapPin } from "lucide-react";

interface MarkerPopupProps {
  report: Report;
}

const statusLabels: Record<Report["status"], string> = {
  reported: "Reported",
  in_progress: "In Progress",
  pending_verification: "Pending Verification",
  verified: "Verified ✓",
  cleaned: "Cleaned",
};

const statusStyles: Record<Report["status"], string> = {
  reported: "bg-red-100 text-red-700",
  in_progress: "bg-blue-100 text-blue-700",
  pending_verification: "bg-amber-100 text-amber-700",
  verified: "bg-green-100 text-green-700",
  cleaned: "bg-gray-100 text-gray-600",
};

export function MarkerPopup({ report }: MarkerPopupProps) {
  const severityColor = SEVERITY_COLORS[report.severity];

  return (
    <div className="min-w-[240px] max-w-[280px] overflow-hidden rounded-xl">
      <div className="h-1.5 w-full" style={{ backgroundColor: severityColor }} />

      {report.photoUrl && (
        <img src={report.photoUrl} alt="Waste spot" className="w-full h-36 object-cover" />
      )}

      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: severityColor }}
          >
            {report.severity}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[report.status]}`}>
            {statusLabels[report.status]}
          </span>
        </div>

        <p className="text-sm text-slate-700 leading-snug mb-2">{report.description}</p>

        {report.address && (
          <div className="flex items-start gap-1 mb-3">
            <MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">{report.address}</p>
          </div>
        )}

        <div className="border-t border-slate-100 pt-2">
          <ClaimButton report={report} />
        </div>
      </div>
    </div>
  );
}
