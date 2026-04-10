"use client";

import { useReportStore } from "@/store/reportStore";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle, BarChart3 } from "lucide-react";

export function Dashboard() {
  const reports = useReportStore((s) => s.reports);

  const reported = reports.filter((r) => r.status === "reported").length;
  const inProgress = reports.filter((r) => r.status === "in_progress").length;
  const cleaned = reports.filter((r) => r.status === "cleaned").length;

  const stats = [
    {
      label: "Total Reported",
      value: reports.length,
      icon: BarChart3,
      color: "text-gray-700",
      bg: "bg-gray-50",
    },
    {
      label: "Reported",
      value: reported,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Cleaned",
      value: cleaned,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className={`${stat.bg} border-0 shadow-sm`}>
          <CardContent className="p-3 flex items-center gap-3">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold leading-none">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
