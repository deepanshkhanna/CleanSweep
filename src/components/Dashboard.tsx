"use client";

import { useReportStore } from "@/store/reportStore";
import { AlertTriangle, Clock, CheckCircle, BarChart3 } from "lucide-react";

const stats = [
  {
    key: "total" as const,
    label: "Total",
    icon: BarChart3,
    border: "border-slate-400",
    iconColor: "text-slate-500",
    numColor: "text-slate-800",
  },
  {
    key: "reported" as const,
    label: "Reported",
    icon: AlertTriangle,
    border: "border-red-400",
    iconColor: "text-red-500",
    numColor: "text-red-700",
  },
  {
    key: "in_progress" as const,
    label: "In Progress",
    icon: Clock,
    border: "border-blue-400",
    iconColor: "text-blue-500",
    numColor: "text-blue-700",
  },
  {
    key: "cleaned" as const,
    label: "Cleaned",
    icon: CheckCircle,
    border: "border-green-400",
    iconColor: "text-green-500",
    numColor: "text-green-700",
  },
];

export function Dashboard() {
  const reports = useReportStore((s) => s.reports);

  const counts = {
    total: reports.length,
    reported: reports.filter((r) => r.status === "reported").length,
    in_progress: reports.filter((r) => r.status === "in_progress").length,
    cleaned: reports.filter((r) => r.status === "cleaned" || r.status === "verified").length,
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat, i) => (
        <div
          key={stat.key}
          className={`bg-white rounded-xl border-l-4 ${stat.border} px-3 py-2.5 shadow-sm card-enter`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between mb-1">
            <stat.icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
          </div>
          <p className={`text-2xl font-bold leading-none tabular-nums ${stat.numColor}`}>
            {counts[stat.key]}
          </p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-1">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
