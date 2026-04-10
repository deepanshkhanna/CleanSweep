"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useReportStore } from "@/store/reportStore";
import { MapView } from "@/components/MapView";
import { Dashboard } from "@/components/Dashboard";
import { ReportForm } from "@/components/ReportForm";
import { MapLegend } from "@/components/MapLegend";
import { Plus, Leaf, LogOut, X } from "lucide-react";

interface UserSession {
  name: string;
  email: string;
}

function LoginModal({ onLogin }: { onLogin: (session: UserSession) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onLogin({ name: name.trim(), email: email.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-none">Volunteer Login</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Join the cleanup effort</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Riya Sharma"
              required
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email ID</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. riya@example.com"
              required
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || !email.trim()}
            className="mt-1 w-full h-11 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Enter Volunteer Portal
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

export default function UserPortal() {
  const subscribe = useReportStore((s) => s.subscribe);
  const loading = useReportStore((s) => s.loading);
  const [formOpen, setFormOpen] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("cleansweep_user");
    if (stored) {
      try { setSession(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setSessionChecked(true);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe();
    return () => unsubscribe();
  }, [subscribe]);

  const handleLogin = (s: UserSession) => {
    localStorage.setItem("cleansweep_user", JSON.stringify(s));
    setSession(s);
  };

  const handleLogout = () => {
    localStorage.removeItem("cleansweep_user");
    setSession(null);
  };

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (pinMode) {
        setPinLocation({ lat, lng });
        setPinMode(false);
        setFormOpen(true);
      }
    },
    [pinMode]
  );

  const handleRequestPin = useCallback(() => setPinMode(true), []);

  if (!sessionChecked) return null;
  if (!session) return <LoginModal onLogin={handleLogin} />;

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 shrink-0 z-10" style={{ height: "56px" }}>
        <div className="h-full flex items-center justify-between max-w-screen-xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <button onClick={() => router.push("/")} className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm shadow-green-200 hover:bg-green-700 transition-colors">
              <Leaf className="w-4 h-4 text-white" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-none">CleanSweep</h1>
              {session && <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Hi, {session.name}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session && (
              <>
                <button
                  onClick={() => setFormOpen(true)}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-md shadow-green-200 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Report Spot
                </button>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Dashboard strip */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 shrink-0">
        <Dashboard />
      </div>

      {/* Pin mode banner */}
      {pinMode && (
        <div className="bg-blue-600 text-white text-xs font-semibold text-center py-2.5 px-4 shrink-0 flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Tap anywhere on the map to drop a pin
          <button
            className="ml-2 text-white/70 hover:text-white underline"
            onClick={() => setPinMode(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center z-10 gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-slate-400 font-medium">Loading map data…</p>
          </div>
        )}
        <MapView onMapClick={handleMapClick} pinLocation={pinLocation} />
        <MapLegend />
      </div>

      <ReportForm
        open={formOpen}
        onOpenChange={setFormOpen}
        pinLocation={pinLocation}
        onRequestPin={handleRequestPin}
        userSession={session}
      />
    </div>
  );
}
