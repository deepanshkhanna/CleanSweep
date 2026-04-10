import { Timestamp } from "firebase/firestore";

export interface Report {
  id: string;
  lat: number;
  lng: number;
  severity: "low" | "medium" | "high";
  status: "reported" | "in_progress" | "cleaned";
  description: string;
  photoUrl: string;
  address?: string;
  createdAt: Timestamp;
  claimedBy?: string;
}

export type Severity = Report["severity"];
export type Status = Report["status"];

export const SEVERITY_COLORS: Record<Severity, string> = {
  low: "#22c55e",
  medium: "#f97316",
  high: "#ef4444",
};

export const STATUS_COLORS: Record<Status, string> = {
  reported: "#ef4444",
  in_progress: "#3b82f6",
  cleaned: "#6b7280",
};
