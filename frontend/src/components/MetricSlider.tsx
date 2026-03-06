import { clamp } from "@/utils/helpers";

export function MetricSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">{label}</div>
          <div className="mt-1 text-xs text-slate-600">1–5</div>
        </div>
        <div className="shrink-0 text-sm font-semibold text-slate-800">{value}/5</div>
      </div>
      <div className="mt-3">
        <input
          className="w-full accent-cyan-600"
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value || 1), 1, 5))}
        />
      </div>
    </div>
  );
}
