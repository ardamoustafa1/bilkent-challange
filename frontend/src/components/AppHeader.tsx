import { Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Session } from "@/types";
import { RoleBadge } from "./RoleBadge";

export function AppHeader({ session, onLogout }: { session: Session; onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/98 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-800">AI Challenge Panel</h1>
            <p className="text-xs text-slate-500">Hakem & Yönetim</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 py-1.5 sm:flex">
            <RoleBadge role={session.role} />
            <span className="max-w-[140px] truncate text-xs font-medium text-slate-700">{session.name || session.email}</span>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış
          </Button>
        </div>
      </div>
    </header>
  );
}
