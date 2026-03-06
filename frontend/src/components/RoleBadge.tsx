import type { Role } from "@/types";

export function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, { label: string; cls: string }> = {
    admin: { label: "Admin", cls: "bg-slate-700 text-white border-slate-700" },
    judge: { label: "Hakem", cls: "bg-slate-600 text-white border-slate-600" },
    visitor: { label: "Ziyaretçi", cls: "bg-slate-500 text-white border-slate-500" },
  };
  const m = map[role];
  return (
    <span
      className={
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold " + m.cls
      }
    >
      {m.label}
    </span>
  );
}
