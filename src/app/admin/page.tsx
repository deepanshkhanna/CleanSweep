"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useReportStore } from "@/store/reportStore";
import { ShieldCheck, CheckCircle2, Clock, MapPin, Leaf, LogOut, Eye, X, Loader2 } from "lucide-react";
import type { Report } from "@/types/report";

const ADMIN_PASSWORD = "112233";

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      onAuth();
    } else {
      setError(true);
      setPw("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-none">Admin Portal</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Enter admin password to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Admin Password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(false); }}
              placeholder="••••••"
              autoFocus
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? "border-red-400 bg-red-50" : "border-slate-200"}`}
            />
            {error && <p className="text-xs text-red-500 mt-1">Incorrect password. Try again.</p>}
          </div>
          <button
            type="submit"
            disabled={!pw}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Enter Admin Portal
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full h-9 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}

function statusBadge(status: Report["status"]) {
  const configs: Record<Report["status"], { label: string; classes: string }> = {
    reported: { label: "Reported", classes: "bg-red-100 text-red-700" },
    in_progress: { label: "In Progress", classes: "bg-blue-100 text-blue-700" },
    pending_verification: { label: "Pending Verification", classes: "bg-amber-100 text-amber-700" },
    verified: { label: "Verified ✓", classes: "bg-green-100 text-green-700" },
    cleaned: { label: "Cleaned", classes: "bg-gray-100 text-gray-600" },
  };
  const c = configs[status];
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.classes}`}>
      {c.label}
    </span>
  );
}

function ReportCard({ report }: { report: Report }) {
  const verifyCleanup = useReportStore((s) => s.verifyCleanup);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyCleanup(report.id, note.trim() || "Cleanup verified by admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${report.status === "pending_verification" ? "border-amber-300" : "border-slate-100"}`}>
      {/* Photos row */}
      <div className="flex gap-0">
        {report.photoUrl && (
          <div className="relative flex-1">
            <img src={report.photoUrl} alt="Before" className="w-full h-32 object-cover" />
            <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded">BEFORE</span>
          </div>
        )}
        {report.cleanupPhotoUrl && (
          <div className="relative flex-1">
            <img src={report.cleanupPhotoUrl} alt="After" className="w-full h-32 object-cover" />
            <span className="absolute top-2 left-2 text-[10px] font-bold bg-green-600/90 text-white px-1.5 py-0.5 rounded">AFTER</span>
            <button
              onClick={() => setPhotoOpen(true)}
              className="absolute bottom-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
            >
              <Eye className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">{report.description}</p>
          {statusBadge(report.status)}
        </div>

        {report.address && (
          <div className="flex items-start gap-1 mb-2">
            <MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-500 leading-tight">{report.address}</p>
          </div>
        )}

        {report.claimedBy && (
          <p className="text-xs text-blue-600 mb-2">
            Volunteer: <span className="font-semibold">{report.claimedBy}</span>
            {report.claimedByEmail && <span className="text-slate-400"> · {report.claimedByEmail}</span>}
          </p>
        )}

        {report.verifiedNote && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-2">
            <p className="text-xs text-green-700 font-medium">{report.verifiedNote}</p>
          </div>
        )}

        {/* Verify action */}
        {report.status === "pending_verification" && (
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-amber-700">Verify this cleanup</p>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='Add a note, e.g. "Great work — area is spotless!"'
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full h-9 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {loading ? "Verifying..." : "Mark Cleanup Verified"}
            </button>
          </div>
        )}
      </div>

      {/* Full-screen photo preview */}
      {photoOpen && report.cleanupPhotoUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPhotoOpen(false)}
        >
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
            <X className="w-5 h-5 text-white" />
          </button>
          <img src={report.cleanupPhotoUrl} alt="Cleanup proof" className="max-w-full max-h-full rounded-xl" />
        </div>
      )}
    </div>
  );
}

export default function AdminPortal() {
  const [authed, setAuthed] = useState(false);
  const [checkedSession, setCheckedSession] = useState(false);
  const subscribe = useReportStore((s) => s.subscribe);
  const reports = useReportStore((s) => s.reports);
  const loading = useReportStore((s) => s.loading);
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending_verification" | "verified">("pending_verification");

  useEffect(() => {
    const ok = sessionStorage.getItem("cleansweep_admin");
    if (ok === "1") setAuthed(true);
    setCheckedSession(true);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe();
    return () => unsubscribe();
  }, [subscribe]);

  const handleAuth = () => {
    sessionStorage.setItem("cleansweep_admin", "1");
    setAuthed(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("cleansweep_admin");
    setAuthed(false);
    router.push("/");
  };

  if (!checkedSession) return null;
  if (!authed) return <PasswordGate onAuth={handleAuth} />;

  const filtered = reports.filter((r) => filter === "all" ? true : r.status === filter);
  const pendingCount = reports.filter((r) => r.status === "pending_verification").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4" style={{ height: "56px" }}>
        <div className="h-full flex items-center justify-between max-w-screen-xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <button onClick={() => router.push("/")} className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors">
              <ShieldCheck className="w-4 h-4 text-white" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-none">Admin Portal</h1>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-none">CleanSweep Verification Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4 flex-wrap">
          {[
            { label: "Total Reports", value: reports.length, color: "text-slate-700" },
            { label: "Pending Verification", value: pendingCount, color: "text-amber-600" },
            { label: "Verified", value: reports.filter((r) => r.status === "verified").length, color: "text-green-600" },
            { label: "In Progress", value: reports.filter((r) => r.status === "in_progress").length, color: "text-blue-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <span className={`text-xl font-bold ${color}`}>{value}</span>
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-slate-100 px-4">
        <div className="max-w-screen-xl mx-auto flex gap-0">
          {([
            { key: "pending_verification", label: `Needs Verification${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
            { key: "verified", label: "Verified" },
            { key: "all", label: "All Reports" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                filter === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="max-w-screen-xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500">
                {filter === "pending_verification" ? "No cleanups awaiting verification." : "No reports found."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
