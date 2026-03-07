import { useMemo, useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionTitle } from "@/components/SectionTitle";
import { ScoreChip } from "@/components/ScoreChip";
import { TeamCard } from "@/components/TeamCard";
import { EvolRadar } from "@/components/Charts";
import { JudgePanelModule } from "@/components/JudgePanelModule";
import { useAppContext } from "@/context/AppContext";
import { evolPercent, sortByScoreDesc } from "@/utils/scoreUtils";

export function JudgePage() {
  const {
    teams, tournaments, schools,
    apiAvailable, judges, setJudges,
    openTeamDetail, openJudgeEntry, setToast,
    handleAssignJudge, handleUnassignJudge,
  } = useAppContext();

  const [judgeTournament, setJudgeTournament] = useState("all");
  const [judgeSchool, setJudgeSchool] = useState("all");
  const [judgeTeamId, setJudgeTeamId] = useState("all");
  const [judgeMode, setJudgeMode] = useState<"Görüntüle" | "Veri Girişi">("Görüntüle");

  const judgeCandidates = useMemo(
    () => teams.filter((t) => (judgeTournament === "all" ? true : t.tournament === judgeTournament)).filter((t) => (judgeSchool === "all" ? true : t.school === judgeSchool)).sort(sortByScoreDesc),
    [teams, judgeTournament, judgeSchool],
  );

  const selectedJudgeTeam = useMemo(() => (judgeTeamId === "all" ? null : teams.find((t) => t.id === judgeTeamId) ?? null), [teams, judgeTeamId]);

  useEffect(() => {
    if (judgeTournament !== "all" && judgeSchool !== "all") {
      const candidates = teams.filter((t) => t.tournament === judgeTournament && t.school === judgeSchool);
      if (candidates.length && judgeTeamId !== "all" && !candidates.some((t) => t.id === judgeTeamId)) setJudgeTeamId("all");
    }
  }, [judgeTournament, judgeSchool, teams, judgeTeamId]);

  return (
    <div className="grid gap-4">
      <SectionTitle icon={ClipboardList} title="Hakem Değerlendirme" subtitle="Filtre + takım seçimi + veri girişi" />
      <div className="card p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label className="text-xs text-slate-600">Turnuva</Label>
            <Select value={judgeTournament} onValueChange={(v) => { setJudgeTournament(v); setJudgeSchool("all"); setJudgeTeamId("all"); }}>
              <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {tournaments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Okul</Label>
            <Select value={judgeSchool} onValueChange={(v) => { setJudgeSchool(v); setJudgeTeamId("all"); }}>
              <SelectTrigger className="mt-1 rounded-xl" disabled={judgeTournament === "all"}><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {schools.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Takım</Label>
            <Select value={judgeTeamId} onValueChange={setJudgeTeamId}>
              <SelectTrigger className="mt-1 rounded-xl" disabled={judgeTournament === "all" || judgeSchool === "all"}><SelectValue placeholder="Tümü" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Seçiniz</SelectItem>
                {judgeCandidates.filter((t) => (judgeTournament === "all" ? true : t.tournament === judgeTournament) && (judgeSchool === "all" ? true : t.school === judgeSchool)).map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant={judgeMode === "Görüntüle" ? "default" : "outline"} className="rounded-xl" onClick={() => setJudgeMode("Görüntüle")}>Görüntüle</Button>
          <Button variant={judgeMode === "Veri Girişi" ? "default" : "outline"} className="rounded-xl" onClick={() => setJudgeMode("Veri Girişi")}>Veri Girişi</Button>
        </div>
      </div>
      <JudgePanelModule apiAvailable={apiAvailable} judges={judges} setJudges={setJudges} judgeCandidates={judgeCandidates} onAssignJudge={handleAssignJudge} onUnassignJudge={handleUnassignJudge} onError={(msg) => setToast({ message: msg, type: "error" })} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-slate-800">Takım Listesi</div>
              <div className="mt-1 text-xs text-slate-600">Takım seçip EVOL skorunu görüntüleyin veya veri girişi yapın</div>
            </div>
            <Button variant="outline" className="rounded-xl" disabled={judgeCandidates.length === 0} onClick={() => { const top = [...judgeCandidates].sort(sortByScoreDesc)[0]; if (top) setJudgeTeamId(top.id); }}>En Yüksek Skor</Button>
          </div>
          <div className="mt-4 grid gap-3">
            {judgeCandidates.slice(0, 10).map((t) => <TeamCard key={t.id} team={t} clickable onOpen={() => { setJudgeTeamId(t.id); }} />)}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-800">Hakem Paneli</div>
            {selectedJudgeTeam ? <ScoreChip pct={evolPercent(selectedJudgeTeam.scores)} /> : null}
          </div>
          {selectedJudgeTeam ? (
            <div className="mt-4">
              <div className="card p-4">
                <div className="text-sm font-semibold text-slate-800">{judgeMode === "Veri Girişi" ? "Veri Girişi" : "Görüntü"}: {selectedJudgeTeam.name}</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="card p-4">
                    <div className="text-xs font-semibold text-slate-800">EVOL Radar</div>
                    <EvolRadar scores={selectedJudgeTeam.scores} />
                  </div>
                  <div className="card p-4">
                    <div className="text-xs font-semibold text-slate-800">Hakem Notu</div>
                    <div className="mt-2 text-sm text-zinc-700">{selectedJudgeTeam.judgeNote || "-"}</div>
                    <div className="mt-4 flex items-center justify-end">
                      <Button className="rounded-xl" onClick={() => { judgeMode === "Veri Girişi" ? openJudgeEntry(selectedJudgeTeam.id) : openTeamDetail(selectedJudgeTeam.id); }}>
                        {judgeMode === "Veri Girişi" ? "Veri Girişi" : "Detay"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 text-sm text-slate-600">Filtrelerden takım seçin.</div>
          )}
        </div>
      </div>
    </div>
  );
}
