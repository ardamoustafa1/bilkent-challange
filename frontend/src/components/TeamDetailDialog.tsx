import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Team } from "@/types";
import { evolPercent, formatPct } from "@/utils/scoreUtils";
import { ScoreChip } from "./ScoreChip";
import { EvolRadar } from "./Charts";

export function TeamDetailDialog({ open, onOpenChange, team }: { open: boolean; onOpenChange: (v: boolean) => void; team: Team | null }) {
  if (!team) return null;
  const pct = evolPercent(team.scores);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-3xl">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <DialogHeader>
            <DialogTitle className="text-left">Takım Detayı</DialogTitle>
          </DialogHeader>
          <Button variant="ghost" className="rounded-2xl" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-2">
          <div className="grid min-w-0 gap-4 md:grid-cols-3">
            <div className="min-w-0 md:col-span-2">
              <div className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="break-words text-[17px] font-bold text-slate-900 tracking-tight">{team.name}</div>
                    <div className="mt-1 break-words text-xs text-slate-600">{team.projectTitle}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="rounded-full bg-slate-50">{`Hafta ${team.week}`}</Badge>
                      <Badge variant="secondary" className="rounded-full bg-slate-50">{team.tournamentCategory}</Badge>
                      <Badge variant="secondary" className="rounded-full bg-slate-50">{team.tournamentTier}</Badge>
                      <Badge variant="secondary" className="rounded-full bg-slate-50">{team.tournament}</Badge>
                      <Badge variant="secondary" className="rounded-full bg-slate-50">{team.school}</Badge>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ScoreChip pct={pct} />
                  </div>
                </div>

                <div className="mt-4 rounded-[var(--radius-card)] border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 tracking-tight">EVOL SKORU</div>
                      <div className="mt-1 text-xs text-slate-600">Dijital • Proje • Karakter • Sunum</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">{formatPct(pct)}</div>
                  </div>
                  <EvolRadar scores={team.scores} />
                </div>
              </div>
            </div>

            <div className="grid min-w-0 gap-4">
              <div className="card p-5">
                <div className="text-sm font-semibold text-slate-900 tracking-tight">Üyeler</div>
                <div className="mt-3 grid gap-2">
                  {team.members.map((m) => (
                    <div key={m.id} className="rounded-2xl border bg-white/70 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="break-words text-sm font-semibold text-slate-900">{m.name}</div>
                          <div className="break-words text-xs text-slate-600">{m.school} • {m.grade}. sınıf</div>
                        </div>
                        <Badge variant="secondary" className="rounded-full">{m.role}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <div className="text-sm font-semibold text-slate-900 tracking-tight">Hakem Notu</div>
                <div className="mt-2 break-words text-[13px] leading-relaxed text-slate-600">{team.judgeNote || "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
