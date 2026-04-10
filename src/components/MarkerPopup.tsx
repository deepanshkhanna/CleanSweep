"use client";

import { type Report, SEVERITY_COLORS } from "@/types/report";
import { ClaimButton } from "./ClaimButton";
import { MapPin, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MarkerPopupProps {
  report: Report;
}

const statusInfo = {
  reported: { label: "Reported", icon: AlertTriangle, color: "text-red-500" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-blue-500" },
  cleaned: { label: "Cleaned", icon: CheckCircle, color: "text-gray-500" },
};

export function MarkerPopup({ report }: MarkerPopupProps) {
  const status = statusInfo[report.status];
  const StatusIcon = status.icon;

  return (
    <div className="p-1 min-w-[220px]">
      {report.photoUrl && (
        <img
          src={report.photoUrl}
          alt="Waste spot"
          className="w-full h-32 object-cover rounded-md mb-2"
        />
      )}

      <div className="flex items-center gap-2 mb-1">
        <Badge
          style={{ backgroundColor: SEVERITY_COLORS[report.severity] }}
          className="text-white text-xs uppercase"
        >
          {report.severity}
        </Badge>
        <span className={`flex items-center gap-1 text-xs ${status.color}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-1">{report.description}</p>

      {report.address && (
        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="line-clamp-2">{report.address}</span>
        </p>
      )}

      {report.claimedBy && (
        <p className="text-xs text-blue-600 mb-2">
          Claimed by: {report.claimedBy}
        </p>
      )}

      <ClaimButton report={report} />
    </div>
  );
}
