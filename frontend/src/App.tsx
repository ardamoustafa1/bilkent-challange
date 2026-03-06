import { useEffect, useMemo, useState } from "react";
import { Sparkles, Users, ClipboardList, Trophy, ShieldCheck, Plus, Download, Upload, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { normalizeEmail } from "@/utils/helpers";
import { TOURNAMENT_CATALOG } from "@/constants/catalog";
import type { Team, Judge, JudgeScores } from "@/types";
import { downloadText } from "@/utils/helpers";
import { evolPercent, genScores, defaultBadgesFromScores, sortByScoreDesc } from "@/utils/scoreUtils";
import { parseImportRows, buildTeamsFromRows, mergeOverwritePreserveScores } from "@/utils/importExport";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useTeamsData } from "@/hooks/useTeamsData";

import { LoginScreen } from "@/components/LoginScreen";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { SectionTitle } from "@/components/SectionTitle";
import { ScoreChip } from "@/components/ScoreChip";
import { TeamCard } from "@/components/TeamCard";
import { TeamDetailDialog } from "@/components/TeamDetailDialog";
import { JudgeEntryDialog } from "@/components/JudgeEntryDialog";
import { AdminTeamDialog } from "@/components/AdminTeamDialog";
import { BarajDagilimi, ScoreDistribution, EvolRadar } from "@/components/Charts";
import { ProjectCategoryFilters } from "@/components/ProjectCategoryFilters";
import { JudgePanelModule } from "@/components/JudgePanelModule";
import { Toast, type ToastItem } from "@/components/Toast";

export default function App() {
  const { session, login: handleLogin, logout } = useAuth();
  const teamsData = useTeamsData(session);
  const {
    teams,
    setTeams,
    apiAvailable,
    teamsLoading,
    tournaments,
    schools,
    sortedDash,
    playoff,
    finalFour,
    baraj,
    bins,
    teamsFiltered,
    dashTournament,
    setDashTournament,
    dashSchool,
    setDashSchool,
    teamsTournament,
    setTeamsTournament,
    teamsSchool,
    setTeamsSchool,
    teamsWeek,
    setTeamsWeek,
    teamsSearch,
    setTeamsSearch,
    mainCat,
    setMainCat,
    subCat,
    setSubCat,
  } = teamsData;

  const [tab, setTab] = useState("dash");
  const [teamDetailOpen, setTeamDetailOpen] = useState(false);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const activeTeam = useMemo(() => teams.find((t) => t.id === activeTeamId) ?? null, [teams, activeTeamId]);

  const [judgeEntryOpen, setJudgeEntryOpen] = useState(false);
  const [judgeDraft, setJudgeDraft] = useState<JudgeScores>(() => genScores(123));
  const [saveJudgeSaving, setSaveJudgeSaving] = useState(false);
  const [saveJudgeError, setSaveJudgeError] = useState<string | null>(null);

  const [adminCreateOpen, setAdminCreateOpen] = useState(false);
  const [adminEditOpen, setAdminEditOpen] = useState(false);
  const [adminDraftTeam, setAdminDraftTeam] = useState<Team | null>(null);

  const [importErr, setImportErr] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastItem>(null);

  const [judges, setJudges] = useState<Judge[]>([]);
  const [judgeTournament, setJudgeTournament] = useState("all");
  const [judgeSchool, setJudgeSchool] = useState("all");
  const [judgeTeamId, setJudgeTeamId] = useState("all");
  const [judgeMode, setJudgeMode] = useState<"Görüntüle" | "Veri Girişi">("Görüntüle");

  useEffect(() => {
    if (apiAvailable) api.getJudges().then(setJudges).catch(() => {});
    else setJudges(JSON.parse(localStorage.getItem("apc_judges_v1") || "[]"));
  }, [apiAvailable]);

  const judgeCandidates = useMemo(() => {
    return teams
      .filter((t) => (judgeTournament === "all" ? true : t.tournament === judgeTournament))
      .filter((t) => (judgeSchool === "all" ? true : t.school === judgeSchool))
      .sort(sortByScoreDesc);
  }, [teams, judgeTournament, judgeSchool]);

  const selectedJudgeTeam = useMemo(() => {
    if (judgeTeamId === "all") return null;
    return teams.find((t) => t.id === judgeTeamId) ?? null;
  }, [teams, judgeTeamId]);

  useEffect(() => {
    if (judgeTournament !== "all" && judgeSchool !== "all") {
      const candidates = teams.filter((t) => t.tournament === judgeTournament && t.school === judgeSchool);
      if (candidates.length && judgeTeamId !== "all" && !candidates.some((t) => t.id === judgeTeamId)) setJudgeTeamId("all");
    }
  }, [judgeTournament, judgeSchool, teams, judgeTeamId]);

  const openTeamDetail = (teamId: string) => {
    setActiveTeamId(teamId);
    setTeamDetailOpen(true);
  };

  const openJudgeEntry = (teamId: string) => {
    setActiveTeamId(teamId);
    const t = teams.find((x) => x.id === teamId);
    if (!t) return;
    setJudgeDraft(t.scores);
    setJudgeEntryOpen(true);
  };

  const handleAssignJudge = (teamId: string, judgeId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    const updated = { ...team, assignedJudgeId: judgeId };
    setTeams((prev) => prev.map((t) => (t.id === teamId ? updated : t)));
    if (apiAvailable) api.updateTeam(updated).catch((e) => setToast({ message: (e as Error).message || "Hakem atanamadı.", type: "error" }));
  };

  const handleUnassignJudge = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    const updated = { ...team, assignedJudgeId: undefined };
    setTeams((prev) => prev.map((t) => (t.id === teamId ? updated : t)));
    if (apiAvailable) api.updateTeam({ ...updated, assignedJudgeId: undefined } as Team).catch((e) => setToast({ message: (e as Error).message || "Hakem kaldırılamadı.", type: "error" }));
  };

  const saveJudgeEntry = async () => {
    if (!activeTeamId) return;
    setSaveJudgeSaving(true);
    setSaveJudgeError(null);
    const team = teams.find((t) => t.id === activeTeamId);
    const judgeId = session ? judges.find((j) => normalizeEmail(j.email) === normalizeEmail(session.email))?.id : undefined;
    try {
      if (apiAvailable) {
        const updated = await api.updateTeamScores(activeTeamId, judgeDraft, defaultBadgesFromScores(judgeDraft), team?.judgeNote ?? "", judgeId);
        setTeams((prev) => prev.map((t) => (t.id === activeTeamId ? updated : t)));
      } else {
        const updated = { ...team!, scores: judgeDraft, badges: defaultBadgesFromScores(judgeDraft), scoresEnteredByJudgeId: judgeId };
        setTeams((prev) => prev.map((t) => (t.id === activeTeamId ? updated : t)));
      }
      setJudgeEntryOpen(false);
      setToast({ message: "Kaydedildi.", type: "success" });
    } catch (e) {
      setSaveJudgeError((e as Error).message || "Kaydedilemedi. Tekrar deneyin.");
    } finally {
      setSaveJudgeSaving(false);
    }
  };

  const downloadTemplate = () => {
    const header = ["team_id", "team_name", "week", "tournament_category", "tournament_tier", "project_title", "tournament", "school", "project_main_category", "project_sub_category", "member_school", "member_name", "member_email", "member_grade", "member_role"].join(",");
    downloadText("apc_import_template.csv", header + "\n", "text/csv;charset=utf-8");
  };

  const importFile = async (file: File) => {
    setImportErr(null);
    try {
      const rows = await parseImportRows(file);
      const incoming = buildTeamsFromRows(rows);
      if (apiAvailable) {
        try {
          const merged = await api.importTeams(incoming);
          setTeams(merged);
        } catch (e) {
          setImportErr(e instanceof Error ? e.message : "Import sırasında hata oluştu.");
        }
        return;
      }
      setTeams((prev) => {
        const byId = new Map(prev.map((t) => [t.id, t] as const));
        const merged: Team[] = [];
        for (const inc of incoming) {
          const existing = byId.get(inc.id);
          merged.push(existing ? mergeOverwritePreserveScores(existing, inc) : inc);
        }
        const untouched = prev.filter((t) => !incoming.some((i) => i.id === t.id));
        return [...untouched, ...merged];
      });
    } catch (e) {
      setImportErr(e instanceof Error ? e.message : "Import sırasında hata oluştu.");
    }
  };

  const createTeamDraft = (): Team => {
    const id = `t-new-${Date.now().toString(16)}`;
    const scores = genScores(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
    const cat = TOURNAMENT_CATALOG[0].category;
    const tier = TOURNAMENT_CATALOG[0].tiers[0];
    return {
      id,
      week: 1,
      name: "",
      captain: "",
      members: [{ id: crypto.randomUUID?.() ?? "id-" + Math.random().toString(16), name: "", email: "", school: "", grade: 9, role: "Kaptan" }],
      tournamentCategory: cat,
      tournamentTier: tier,
      projectTitle: "",
      createdAtISO: new Date().toISOString(),
      badges: defaultBadgesFromScores(scores),
      scores,
      judgeNote: "",
      tournament: "Okul İçi Lig",
      school: "BİLTEK",
      projectMainCategory: undefined,
      projectSubCategory: undefined,
    };
  };

  const openAdminCreate = () => {
    setAdminDraftTeam(createTeamDraft());
    setAdminCreateOpen(true);
  };

  const openAdminEdit = (teamId: string) => {
    const t = teams.find((x) => x.id === teamId);
    if (!t) return;
    setAdminDraftTeam({ ...t, members: t.members.map((m) => ({ ...m })) });
    setAdminEditOpen(true);
  };

  const submitAdminTeam = async (t: Team) => {
    if (apiAvailable) {
      try {
        const updated = await (teams.some((x) => x.id === t.id) ? api.updateTeam(t) : api.createTeam(t));
        setTeams((prev) => (prev.some((x) => x.id === t.id) ? prev.map((x) => (x.id === t.id ? updated : x)) : [...prev, updated]));
        setToast({ message: "Takım kaydedildi.", type: "success" });
      } catch (e) {
        setToast({ message: (e as Error).message || "Takım kaydedilemedi.", type: "error" });
      }
      return;
    }
    setTeams((prev) => {
      const exists = prev.some((x) => x.id === t.id);
      if (!exists) return [...prev, { ...t }];
      return prev.map((x) => (x.id === t.id ? { ...t, scores: x.scores, badges: defaultBadgesFromScores(x.scores) } : x));
    });
    setToast({ message: "Takım kaydedildi.", type: "success" });
  };

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const canSeeAdmin = session.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50/80">
      <AppHeader session={session} onLogout={logout} />

      <div className="mx-auto max-w-6xl px-4 pb-28 pt-6">
        {teamsLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-slate-200/60 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-medium text-slate-500">Yükleniyor…</p>
          </div>
        ) : (
        <>
        {tab === "dash" && (
          <div className="grid gap-4">
            <SectionTitle icon={Sparkles} title="Akış" subtitle="Filtreli seçim + skorlar + PlayOff + Final Four" />
            <div className="card p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-slate-600">Turnuva</Label>
                  <Select value={dashTournament} onValueChange={setDashTournament}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Turnuva" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {tournaments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Okul</Label>
                  <Select value={dashSchool} onValueChange={setDashSchool}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Okul" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {schools.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <BarajDagilimi burs={baraj.burs} odul={baraj.odul} aday={baraj.aday} havuz={baraj.havuz} />
            <ScoreDistribution data={bins} />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="card p-4">
                <div className="text-sm font-semibold text-slate-800">Seçime Ait Takımlar</div>
                <div className="mt-3 grid gap-3">
                  {sortedDash.length === 0 ? <p className="py-4 text-center text-sm text-slate-500">Bu filtreye uygun takım yok.</p> : sortedDash.slice(0, 6).map((t) => <TeamCard key={t.id} team={t} onOpen={() => openTeamDetail(t.id)} clickable />)}
                </div>
              </div>
              <div className="card border-slate-200/60 bg-slate-50/50 p-4">
                <div className="text-sm font-semibold text-slate-800">PlayOff</div>
                <div className="mt-3 grid gap-3">
                  {playoff.map((t) => <TeamCard key={t.id} team={t} onOpen={() => openTeamDetail(t.id)} clickable />)}
                </div>
              </div>
              <div className="card border-slate-200/60 bg-slate-50/50 p-4">
                <div className="text-sm font-semibold text-slate-800">Final Four</div>
                <div className="mt-3 grid gap-3">
                  {finalFour.map((t) => <TeamCard key={t.id} team={t} onOpen={() => openTeamDetail(t.id)} clickable />)}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "teams" && (
          <div className="grid gap-4">
            <SectionTitle icon={Users} title="Takımlar" subtitle="Hızlı özet + analitik filtreler" />
            <div className="card p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <Label className="text-xs text-slate-600">Turnuva</Label>
                  <Select value={teamsTournament} onValueChange={setTeamsTournament}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Turnuva" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {tournaments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Okul</Label>
                  <Select value={teamsSchool} onValueChange={setTeamsSchool}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Okul" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {schools.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Hafta</Label>
                  <Select value={teamsWeek} onValueChange={setTeamsWeek}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Hafta" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {[1, 2, 3, 4].map((w) => <SelectItem key={w} value={String(w)}>{w}. Hafta</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4"><ProjectCategoryFilters mainValue={mainCat} subValue={subCat} onMain={setMainCat} onSub={setSubCat} /></div>
              <div className="mt-4">
                <Label className="text-xs text-slate-600">Arama</Label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input className="w-full bg-transparent text-sm outline-none" value={teamsSearch} onChange={(e) => setTeamsSearch(e.target.value)} placeholder="Takım / Kaptan / Proje / Okul" />
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              {teamsFiltered.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Arama kriterlerine uygun takım bulunamadı.</p> : teamsFiltered.map((t) => <TeamCard key={t.id} team={t} onOpen={() => openTeamDetail(t.id)} clickable />)}
            </div>
          </div>
        )}

        {tab === "judge" && (
          <div className="grid gap-4">
            <SectionTitle icon={ClipboardList} title="Hakem Değerlendirme" subtitle="Filtre + takım seçimi + veri girişi" />
            <div className="card p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <Label className="text-xs text-slate-600">Turnuva</Label>
                  <Select value={judgeTournament} onValueChange={(v) => { setJudgeTournament(v); setJudgeSchool("all"); setJudgeTeamId("all"); }}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Turnuva" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {tournaments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Okul</Label>
                  <Select value={judgeSchool} onValueChange={(v) => { setJudgeSchool(v); setJudgeTeamId("all"); }}>
                    <SelectTrigger className="mt-1 rounded-xl" disabled={judgeTournament === "all"}><SelectValue placeholder="Okul" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {schools.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Takım</Label>
                  <Select value={judgeTeamId} onValueChange={setJudgeTeamId}>
                    <SelectTrigger className="mt-1 rounded-xl" disabled={judgeTournament === "all" || judgeSchool === "all"}><SelectValue placeholder="Takım" /></SelectTrigger>
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
            <JudgePanelModule
              apiAvailable={apiAvailable}
              judges={judges}
              setJudges={setJudges}
              judgeCandidates={judgeCandidates}
              onAssignJudge={handleAssignJudge}
              onUnassignJudge={handleUnassignJudge}
              onError={(msg) => setToast({ message: msg, type: "error" })}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Takım Listesi</div>
                    <div className="mt-1 text-xs text-slate-600">(Demo) Takım seçip EVOL skorunu görüntüleyin</div>
                  </div>
                  <Button variant="outline" className="rounded-xl" onClick={() => { const top = [...judgeCandidates].sort(sortByScoreDesc)[0]; if (top) setJudgeTeamId(top.id); }}>En Yüksek Skor</Button>
                </div>
                <div className="mt-4 grid gap-3">
                  {judgeCandidates.slice(0, 10).map((t) => <TeamCard key={t.id} team={t} clickable onOpen={() => { setJudgeTeamId(t.id); setActiveTeamId(t.id); }} />)}
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
                            <Button className="rounded-xl" onClick={() => { setActiveTeamId(selectedJudgeTeam.id); judgeMode === "Veri Girişi" ? openJudgeEntry(selectedJudgeTeam.id) : openTeamDetail(selectedJudgeTeam.id); }}>
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
        )}

        {tab === "ucl" && (
          <div className="grid gap-4">
            <SectionTitle icon={Trophy} title="Lig" subtitle="Tüm zamanların en iyileri" />
            <div className="card p-4">
              <div className="text-sm font-semibold text-slate-800">16 Takım • Tüm turnuvalar</div>
              <div className="mt-1 text-xs text-slate-600">Bu ekran bilgi amaçlıdır.</div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[...teams].sort(sortByScoreDesc).slice(0, 16).map((t) => <TeamCard key={t.id} team={t} onOpen={() => {}} clickable={false} />)}
            </div>
          </div>
        )}

        {tab === "admin" && canSeeAdmin && (
          <div className="grid gap-4">
            <SectionTitle icon={ShieldCheck} title="Admin" subtitle="Takım & üye yönetimi + Excel/CSV import" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2 card p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Takımlar</div>
                    <div className="mt-1 text-xs text-slate-600">Düzenle ile takım detaylarını açın.</div>
                  </div>
                  <Button className="rounded-xl" onClick={openAdminCreate}><Plus className="mr-2 h-4 w-4" /> Takım Ekle</Button>
                </div>
                <div className="mt-4 grid gap-3">
                  {[...teams].sort(sortByScoreDesc).slice(0, 14).map((t) => (
                    <div key={t.id} className="card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-800">{t.name}</div>
                          <div className="mt-1 text-xs text-slate-600">{t.projectTitle}</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full border bg-white px-2 py-1 text-xs">{t.tournament}</span>
                            <span className="rounded-full border bg-white px-2 py-1 text-xs">{t.school}</span>
                            <span className="rounded-full border bg-white px-2 py-1 text-xs">{`Hafta ${t.week}`}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ScoreChip pct={evolPercent(t.scores)} />
                          <Button variant="outline" className="rounded-xl" onClick={() => openAdminEdit(t.id)}>Düzenle</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-4">
                <div className="text-sm font-semibold text-slate-800">Excel / CSV Import</div>
                <div className="mt-2 text-xs text-slate-600">Aynı team_id tekrar yüklenirse takım kaydı overwrite edilir, hakem skorları korunur.</div>
                <div className="mt-4 grid gap-3">
                  <Button variant="outline" className="rounded-xl" onClick={downloadTemplate}><Download className="mr-2 h-4 w-4" /> Şablon indir</Button>
                  <label className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-white">
                    <div className="flex items-center gap-2"><Upload className="h-4 w-4" /><span>.xlsx / .xls / .csv yükle</span></div>
                    <input className="hidden" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) { importFile(f); e.currentTarget.value = ""; } }} />
                  </label>
                  {importErr ? <div className="rounded-xl border border-red-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{importErr}</div> : null}
                </div>
                <div className="mt-6 card p-4">
                  <div className="text-xs font-semibold text-slate-800">Not</div>
                  <div className="mt-2 text-xs text-zinc-700">Import sonrası veriler anında tüm listelere yansır.</div>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>

      <BottomNav value={tab} onChange={setTab} role={session.role} />

      <TeamDetailDialog open={teamDetailOpen} onOpenChange={setTeamDetailOpen} team={activeTeam} />
      <JudgeEntryDialog open={judgeEntryOpen} onOpenChange={(v) => { setJudgeEntryOpen(v); if (!v) setSaveJudgeError(null); }} team={activeTeam} draft={judgeDraft} setDraft={setJudgeDraft} onSave={saveJudgeEntry} saving={saveJudgeSaving} saveError={saveJudgeError} />

      {adminDraftTeam && (
        <>
          <AdminTeamDialog open={adminCreateOpen} onOpenChange={setAdminCreateOpen} mode="create" initial={adminDraftTeam} onSubmit={(t) => submitAdminTeam(t)} />
          <AdminTeamDialog open={adminEditOpen} onOpenChange={setAdminEditOpen} mode="edit" initial={adminDraftTeam} onSubmit={(t) => submitAdminTeam(t)} />
        </>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
