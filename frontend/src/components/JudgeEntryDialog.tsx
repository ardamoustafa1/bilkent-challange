import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Team, JudgeScores } from "@/types";
import { SCORE_GROUPS } from "@/constants/scoreMeta";
import { evolPercent } from "@/utils/scoreUtils";
import { ScoreChip } from "./ScoreChip";
import { MetricSlider } from "./MetricSlider";

export function JudgeEntryDialog({
  open,
  onOpenChange,
  team,
  draft,
  setDraft,
  onSave,
  saving = false,
  saveError = null,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  team: Team | null;
  draft: JudgeScores;
  setDraft: (s: JudgeScores) => void;
  onSave: () => void;
  saving?: boolean;
  saveError?: string | null;
}) {
  if (!team) return null;
  const pct = evolPercent(draft);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl rounded-3xl">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <DialogHeader>
            <DialogTitle className="text-left">Veri Girişi • {team.name}</DialogTitle>
          </DialogHeader>
          <Button variant="ghost" className="rounded-2xl" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="text-xs text-slate-600">1–5 arası puan verin</div>
          <ScoreChip pct={pct} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-2">
          <div className="grid gap-4 md:grid-cols-2">
            {SCORE_GROUPS.map((g) => (
              <div key={g.id} className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="text-sm font-semibold text-slate-800">{g.title}</div>
                <div className="mt-3 grid gap-3">
                  {g.items.map((it) => (
                    <MetricSlider
                      key={String(it.key)}
                      label={it.label}
                      value={draft[it.key]}
                      onChange={(v) => setDraft({ ...draft, [it.key]: v })}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {saveError ? <div className="mt-2 shrink-0 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{saveError}</div> : null}
        <div className="mt-4 flex shrink-0 items-center justify-end gap-2">
          <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)} disabled={saving}>Kapat</Button>
          <Button className="rounded-2xl" onClick={onSave} disabled={saving}>{saving ? "Kaydediliyor…" : "Kaydet"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
