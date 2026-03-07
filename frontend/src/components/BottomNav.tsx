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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-header border-t">
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
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-all duration-200 " +
                (active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")
              }
            >
              <it.icon className={"h-4 w-4 " + (active ? "text-white" : "text-slate-400")} />
              {it.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
