import { createContext, useContext, useEffect, useMemo, useState, type ReactNode, type Dispatch, type SetStateAction } from "react";
import type { Team, Judge, JudgeScores, Session } from "@/types";
import { normalizeEmail, downloadText } from "@/utils/helpers";
import { LS_JUDGES } from "@/constants/demo";
import { genScores, defaultBadgesFromScores } from "@/utils/scoreUtils";
import { parseImportRows, buildTeamsFromRows, mergeOverwritePreserveScores } from "@/utils/importExport";
import { api } from "@/services/api";
import { socket } from "@/services/socket";
import { useTeamsData } from "@/hooks/useTeamsData";
import { TOURNAMENT_CATALOG } from "@/constants/catalog";
import type { ToastItem } from "@/components/Toast";

// ── Types ──────────────────────────────────────────────────────────
type AppContextValue = {
  session: Session;
  logout: () => Promise<void>;
  teams: Team[];
  setTeams: Dispatch<SetStateAction<Team[]>>;
  apiAvailable: boolean;
  teamsLoading: boolean;
  tournaments: string[];
  schools: string[];
  dashFiltered: Team[];
  sortedDash: Team[];
  playoff: Team[];
  finalFour: Team[];
  baraj: { burs: number; odul: number; aday: number; havuz: number };
  bins: { name: string; count: number }[];
  teamsFiltered: Team[];
  dashTournament: string;
  setDashTournament: (v: string) => void;
  dashSchool: string;
  setDashSchool: (v: string) => void;
  dashWeek: string;
  setDashWeek: (v: string) => void;
  teamsTournament: string;
  setTeamsTournament: (v: string) => void;
  teamsSchool: string;
  setTeamsSchool: (v: string) => void;
  teamsWeek: string;
  setTeamsWeek: (v: string) => void;
  teamsSearch: string;
  setTeamsSearch: (v: string) => void;
  mainCat: string;
  setMainCat: (v: string) => void;
  subCat: string;
  setSubCat: (v: string) => void;
  judges: Judge[];
  setJudges: Dispatch<SetStateAction<Judge[]>>;
  toast: ToastItem;
  setToast: (t: ToastItem) => void;
  activeTeam: Team | null;
  teamDetailOpen: boolean;
  setTeamDetailOpen: (v: boolean) => void;
  openTeamDetail: (teamId: string) => void;
  judgeEntryOpen: boolean;
  setJudgeEntryOpen: (v: boolean) => void;
  judgeDraft: JudgeScores;
  setJudgeDraft: Dispatch<SetStateAction<JudgeScores>>;
  openJudgeEntry: (teamId: string) => void;
  saveJudgeEntry: () => Promise<void>;
  saveJudgeSaving: boolean;
  saveJudgeError: string | null;
  setSaveJudgeError: (v: string | null) => void;
  adminCreateOpen: boolean;
  setAdminCreateOpen: (v: boolean) => void;
  adminEditOpen: boolean;
  setAdminEditOpen: (v: boolean) => void;
  adminDraftTeam: Team | null;
  openAdminCreate: () => void;
  openAdminEdit: (teamId: string) => void;
  submitAdminTeam: (t: Team) => Promise<void>;
  deleteAdminTeam: (id: string) => Promise<void>;
  importFile: (file: File) => Promise<void>;
  importErr: string | null;
  downloadTemplate: () => void;
  handleAssignJudge: (teamId: string, judgeId: string) => void;
  handleUnassignJudge: (teamId: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────────
export function AppProvider({ session, logout, children }: { session: Session; logout: () => Promise<void>; children: ReactNode }) {
  const teamsData = useTeamsData(session);
  const { teams, setTeams, apiAvailable } = teamsData;

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

  useEffect(() => {
    if (apiAvailable) api.getJudges().then(setJudges).catch(() => { });
    else setJudges(JSON.parse(localStorage.getItem(LS_JUDGES) || "[]"));
  }, [apiAvailable]);

  useEffect(() => {
    socket.on("teamUpdated", (updatedTeam: Team) => {
      setTeams((prev) => {
        const index = prev.findIndex((t) => t.id === updatedTeam.id);
        if (index === -1) return [...prev, updatedTeam];
        const copy = [...prev];
        copy[index] = updatedTeam;
        return copy;
      });
    });

    return () => {
      socket.off("teamUpdated");
    };
  }, [setTeams]);

  const openTeamDetail = (teamId: string) => { setActiveTeamId(teamId); setTeamDetailOpen(true); };

  const openJudgeEntry = (teamId: string) => {
    setActiveTeamId(teamId);
    const t = teams.find((x) => x.id === teamId);
    if (!t) return;
    
    let draft = t.scores;
    // Eğer oturumdaki kullanıcı bir hakemse ve daha önce bu takıma puan vermişse, o puanları getir.
    const judgeId = session ? judges.find((j) => normalizeEmail(j.email) === normalizeEmail(session.email))?.id : undefined;
    if (judgeId && t.rawScores && t.rawScores[judgeId]) {
      draft = t.rawScores[judgeId];
    }
    
    setJudgeDraft(draft);
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
    downloadText("chall_import_template.csv", header + "\n", "text/csv;charset=utf-8");
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
      id, week: 1, name: "", captain: "",
      members: [{ id: crypto.randomUUID?.() ?? "id-" + Math.random().toString(16), name: "", email: "", school: "", grade: 9, role: "Kaptan" }],
      tournamentCategory: cat, tournamentTier: tier, projectTitle: "",
      createdAtISO: new Date().toISOString(), badges: defaultBadgesFromScores(scores), scores,
      judgeNote: "", tournament: "Okul İçi Lig", school: "BİLTEK",
      projectMainCategory: undefined, projectSubCategory: undefined,
    };
  };

  const openAdminCreate = () => { setAdminDraftTeam(createTeamDraft()); setAdminCreateOpen(true); };
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

  const deleteAdminTeam = async (id: string) => {
    try {
      if (apiAvailable) await api.deleteTeam(id);
      setTeams((prev) => prev.filter((t) => t.id !== id));
      setToast({ message: "Takım silindi.", type: "success" });
    } catch (e) {
      setToast({ message: (e as Error).message || "Takım silinemedi.", type: "error" });
    }
  };

  const value: AppContextValue = {
    session,
    logout,
    ...teamsData,
    judges, setJudges, toast, setToast,
    activeTeam, teamDetailOpen, setTeamDetailOpen, openTeamDetail,
    judgeEntryOpen, setJudgeEntryOpen, judgeDraft, setJudgeDraft,
    openJudgeEntry, saveJudgeEntry, saveJudgeSaving, saveJudgeError, setSaveJudgeError,
    adminCreateOpen, setAdminCreateOpen, adminEditOpen, setAdminEditOpen, adminDraftTeam,
    openAdminCreate, openAdminEdit, submitAdminTeam, deleteAdminTeam,
    importFile, importErr, downloadTemplate,
    handleAssignJudge, handleUnassignJudge,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
