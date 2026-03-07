import { clamp } from "@/utils/helpers";

export function MetricSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  // 1 değerinde %0, 5 değerinde %100 doluluk olmasını sağlıyoruz
  const pct = ((value - 1) / 4) * 100;

  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 transition-colors hover:border-slate-200">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold text-slate-900">{label}</div>
          <div className="mt-1 text-[12px] font-medium text-slate-500">1–5</div>
        </div>
        <div className="shrink-0 text-[15px] font-extrabold text-slate-900">{value}/5</div>
      </div>
      <div>
        <input
          className="custom-slider"
          style={{
            background: `linear-gradient(to right, #0f172a 0%, #0f172a ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`
          }}
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
