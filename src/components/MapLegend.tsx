"use client";

const LEGEND_ITEMS = [
  { color: "#ef4444", label: "High severity" },
  { color: "#f97316", label: "Medium severity" },
  { color: "#22c55e", label: "Low severity" },
  { color: "#3b82f6", label: "In progress" },
  { color: "#9ca3af", label: "Cleaned" },
];

export function MapLegend() {
  return (
    <div className="absolute bottom-8 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/80 px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
        Map Legend
      </p>
      <div className="flex flex-col gap-1">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
