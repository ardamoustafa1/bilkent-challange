import { Sparkles, Users, ClipboardList, Trophy, ShieldCheck } from "lucide-react";
import type { Role } from "@/types";

const BASE = [
  { id: "dash", label: "Akış", icon: Sparkles },
  { id: "teams", label: "Takımlar", icon: Users },
  { id: "judge", label: "Hakem", icon: ClipboardList },
  { id: "ucl", label: "Lig", icon: Trophy },
] as const;

export function BottomNav({ value, onChange, role }: { value: string; onChange: (v: string) => void; role: Role }) {
  const items = role === "admin" ? [...BASE, { id: "admin", label: "Admin", icon: ShieldCheck }] : BASE;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/60 bg-white/98 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-1 px-2 py-2.5">
        {items.map((it) => {
          const active = value === it.id;
          return (
            <button
              key={it.id}
              type="button"
              aria-label={it.label}
              aria-current={active ? "page" : undefined}
              onClick={() => onChange(it.id)}
              className={
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition " +
                (active
                  ? "bg-slate-100 text-slate-800"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700")
              }
            >
              <it.icon className={"h-4 w-4 " + (active ? "text-slate-700" : "text-slate-400")} />
              {it.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
