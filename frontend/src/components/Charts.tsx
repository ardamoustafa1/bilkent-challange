import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { JudgeScores } from "@/types";
import { computeSubScores } from "@/utils/scoreUtils";

export function EvolRadar({ scores }: { scores: JudgeScores }) {
  const subs = computeSubScores(scores);
  const data = [
    { k: "Dijital", v: subs.digital },
    { k: "Proje", v: subs.project },
    { k: "Karakter", v: subs.skill },
    { k: "Sunum", v: subs.presentation },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="k" />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tickCount={6} />
          <Radar dataKey="v" stroke="#64748b" fill="#94a3b8" fillOpacity={0.15} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreDistribution({ data }: { data: Array<{ name: string; count: number }> }) {
  return (
    <div className="card p-5">
      <div className="text-sm font-semibold text-slate-900 tracking-tight">Skor Dağılımı</div>
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={18}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F172A" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#334155" stopOpacity={0.75} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip />
            <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function BarajDagilimi({ burs, odul, aday, havuz }: { burs: number; odul: number; aday: number; havuz: number }) {
  const items = [
    { title: "%90+ • Burs", value: burs, cls: "bg-emerald-50/50 border-emerald-100 text-emerald-800" },
    { title: "%80–89 • Ödül", value: odul, cls: "bg-slate-50/50 border-slate-100 text-slate-800" },
    { title: "%70–79 • Aday", value: aday, cls: "bg-amber-50/50 border-amber-100 text-amber-800" },
    { title: "<70 • Havuz", value: havuz, cls: "bg-white border-slate-100 text-slate-500" },
  ];
  return (
    <div className="card p-5">
      <div className="text-sm font-semibold text-slate-900 tracking-tight">Baraj Dağılımı</div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className={"rounded-[var(--radius-card)] border px-4 py-4 " + it.cls}>
            <div className="text-xs font-semibold">{it.title}</div>
            <div className="mt-1 text-sm font-medium opacity-80">{it.value} takım</div>
          </div>
        ))}
      </div>
    </div>
  );
}
