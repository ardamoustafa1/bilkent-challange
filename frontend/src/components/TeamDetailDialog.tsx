import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Team } from "@/types";
import { evolPercent, formatPct } from "@/utils/scoreUtils";
import { ScoreChip } from "./ScoreChip";
import { EvolRadar } from "./Charts";
import { resolveSubMeta } from "@/utils/category";

export function TeamDetailDialog({ open, onOpenChange, team }: { open: boolean; onOpenChange: (v: boolean) => void; team: Team | null }) {
  if (!team) return null;
  const pct = evolPercent(team.scores);
  const catMeta = resolveSubMeta(team.projectMainCategory, team.projectSubCategory);

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
                    <div className="break-words text-[17px] font-bold tracking-tight text-slate-900">{team.name}</div>
                    <div className="mt-1 break-words text-xs text-slate-500">{team.projectTitle}</div>
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-[11px] text-slate-600">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-32 shrink-0 text-[11px] font-semibold text-slate-700">Turnuva Haftası</span>
                          <Badge variant="secondary" className="rounded-full bg-sky-50 text-sky-800 border-sky-100">{`Hafta ${team.week}`}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-32 shrink-0 text-[11px] font-semibold text-slate-700">Turnuva Kategorisi</span>
                          <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-800 border-indigo-100">{team.tournamentCategory}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-32 shrink-0 text-[11px] font-semibold text-slate-700">Tür &amp; Seviye</span>
                          <Badge variant="secondary" className="rounded-full bg-violet-50 text-violet-800 border-violet-100">{team.tournamentTier}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-32 shrink-0 text-[11px] font-semibold text-slate-700">Turnuva Adı</span>
                          <Badge variant="secondary" className="rounded-full bg-emerald-50 text-emerald-800 border-emerald-100">{team.tournament}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-32 shrink-0 text-[11px] font-semibold text-slate-700">Turnuva Okulu</span>
                          <Badge variant="secondary" className="rounded-full bg-amber-50 text-amber-800 border-amber-100">{team.school}</Badge>
                        </div>
                        {catMeta && (
                          <>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="w-32 shrink-0 text-[11px] font-semibold text-slate-700">Proje Ana Kategori</span>
                              <Badge variant="secondary" className="rounded-full bg-slate-900/90 text-slate-50 border-slate-900">{catMeta.main.main}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="w-32 shrink-0 text-[11px] font-semibold text-slate-700">Proje Alt Kategori</span>
                              <Badge variant="secondary" className="rounded-full bg-slate-800 text-slate-50 border-slate-800">{catMeta.sub.name}</Badge>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ScoreChip pct={pct} />
                  </div>
                </div>

                <div className="mt-4 rounded-[var(--radius-card)] bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold tracking-tight text-slate-50">EVOL SKORU</div>
                      <div className="mt-1 text-xs text-slate-300">Dijital • Proje • Karakter • Sunum</div>
                    </div>
                    <div className="rounded-full bg-slate-50/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                      {formatPct(pct)}
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-slate-950/40 p-3">
                    <EvolRadar scores={team.scores} />
                  </div>
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
