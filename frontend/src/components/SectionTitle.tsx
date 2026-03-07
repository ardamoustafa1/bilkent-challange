import type { LucideIcon } from "lucide-react";

export function SectionTitle({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 shadow-inner-soft">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}
