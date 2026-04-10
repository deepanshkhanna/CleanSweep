"use client";

import { useRouter } from "next/navigation";
import { Leaf, ShieldCheck, Users } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center gap-2.5">
        <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-200">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900">CleanSweep</span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-20 h-20 bg-green-600 rounded-3xl flex items-center justify-center shadow-xl shadow-green-200 mb-6">
          <Leaf className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
          Community Cleanup,{" "}
          <span className="text-green-600">Made Simple</span>
        </h1>
        <p className="text-slate-500 text-base sm:text-lg max-w-md mb-10 leading-relaxed">
          Report waste spots on the map, claim cleanups, submit proof, and get verified by
          our admin — together we build a cleaner community.
        </p>

        {/* Portal cards */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          {/* User card */}
          <button
            onClick={() => router.push("/user")}
            className="flex-1 group bg-white border-2 border-slate-200 hover:border-green-400 rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-11 h-11 bg-green-100 group-hover:bg-green-600 rounded-xl flex items-center justify-center mb-3 transition-colors">
              <Users className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Volunteer Portal</h2>
            <p className="text-xs text-slate-500 leading-snug">
              Report waste, claim cleanups &amp; submit completion proof
            </p>
            <div className="mt-4 text-xs font-semibold text-green-600 group-hover:underline">
              Enter as Volunteer →
            </div>
          </button>

          {/* Admin card */}
          <button
            onClick={() => router.push("/admin")}
            className="flex-1 group bg-white border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-11 h-11 bg-blue-100 group-hover:bg-blue-600 rounded-xl flex items-center justify-center mb-3 transition-colors">
              <ShieldCheck className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Admin Portal</h2>
            <p className="text-xs text-slate-500 leading-snug">
              Review cleanup proofs &amp; officially verify completed spots
            </p>
            <div className="mt-4 text-xs font-semibold text-blue-600 group-hover:underline">
              Enter as Admin →
            </div>
          </button>
        </div>

        {/* Steps */}
        <div className="mt-14 flex flex-col sm:flex-row gap-6 text-center max-w-lg w-full">
          {[
            { step: "1", title: "Report", desc: "Drop a pin on a waste spot" },
            { step: "2", title: "Claim & Clean", desc: "Volunteer claims it & cleans up" },
            { step: "3", title: "Verify", desc: "Admin checks proof photo" },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex-1">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center mx-auto mb-2">
                {step}
              </div>
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-5 text-xs text-slate-400">
        CleanSweep — Built for GDG Hackathon 2026
      </footer>
    </div>
  );
}
