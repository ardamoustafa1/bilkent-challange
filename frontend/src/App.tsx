import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppProvider, useAppContext } from "@/context/AppContext";

import { LoginScreen } from "@/components/LoginScreen";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { TeamDetailDialog } from "@/components/TeamDetailDialog";
import { JudgeEntryDialog } from "@/components/JudgeEntryDialog";
import { AdminTeamDialog } from "@/components/AdminTeamDialog";
import { Toast } from "@/components/Toast";

import { DashboardPage } from "@/pages/DashboardPage";
import { TeamsPage } from "@/pages/TeamsPage";
import { JudgePage } from "@/pages/JudgePage";
import { LeaguePage } from "@/pages/LeaguePage";
import { AdminPage } from "@/pages/AdminPage";
import { TvModePage } from "@/pages/TvModePage";

// Sürüm güncellemesi: Eski demo verilerini temizle
const OLD_LS_KEYS = [
  "apc_demo_session_v1", "apc_token_v1", "apc_demo_teams_v2", "apc_judges_v1",
  "chall_session_v1", "chall_token_v1", "chall_teams_v1", "chall_judges_v1"
];
const DATA_VERSION = "chall_v3_clean";
function clearOldStorageOnce() {
  try {
    if (localStorage.getItem(DATA_VERSION) === "done") return;
    OLD_LS_KEYS.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(DATA_VERSION, "done");
  } catch { }
}

export default function App() {
  useEffect(() => { clearOldStorageOnce(); }, []);

  const { session, login: handleLogin, logout } = useAuth();
  const isTvMode = typeof window !== "undefined" && window.location.pathname === "/tv";

  if (isTvMode) {
    return (
      <AppProvider session={{ email: "tv@mode.com", role: "visitor", name: "TV Mode" }} logout={logout}>
        <TvModePage />
      </AppProvider>
    );
  }

  if (!session) return <LoginScreen onLogin={handleLogin} />;

  return (
    <AppProvider session={session} logout={logout}>
      <AppShell />
    </AppProvider>
  );
}

function AppShell() {
  const ctx = useAppContext();
  const [tab, setTab] = useState("dash");

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-slate-200">
      <AppHeader session={ctx.session} onLogout={ctx.logout} />

      <div className="mx-auto max-w-6xl px-4 pb-28 pt-6">
        {ctx.teamsLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center rounded-[var(--radius-card)] bg-white p-8 shadow-soft">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
              <p className="text-sm font-medium text-slate-500">Yükleniyor…</p>
            </div>
          </div>
        ) : (
          <>
            {tab === "dash" && <DashboardPage />}
            {tab === "teams" && <TeamsPage />}
            {/* Ziyaretçi rolünde Hakem sayfası gösterilmez */}
            {tab === "judge" && ctx.session.role !== "visitor" && <JudgePage />}
            {tab === "ucl" && <LeaguePage />}
            {tab === "admin" && ctx.session.role === "admin" && <AdminPage />}
          </>
        )}
      </div>

      <BottomNav value={tab} onChange={setTab} role={ctx.session.role} />

      {/* Dialogs */}
      <TeamDetailDialog open={ctx.teamDetailOpen} onOpenChange={ctx.setTeamDetailOpen} team={ctx.activeTeam} />
      <JudgeEntryDialog
        open={ctx.judgeEntryOpen}
        onOpenChange={(v) => { ctx.setJudgeEntryOpen(v); if (!v) ctx.setSaveJudgeError(null); }}
        team={ctx.activeTeam}
        draft={ctx.judgeDraft}
        setDraft={ctx.setJudgeDraft}
        onSave={ctx.saveJudgeEntry}
        saving={ctx.saveJudgeSaving}
        saveError={ctx.saveJudgeError}
      />

      {ctx.adminDraftTeam && (
        <>
          <AdminTeamDialog open={ctx.adminCreateOpen} onOpenChange={ctx.setAdminCreateOpen} mode="create" initial={ctx.adminDraftTeam} onSubmit={ctx.submitAdminTeam} />
          <AdminTeamDialog open={ctx.adminEditOpen} onOpenChange={ctx.setAdminEditOpen} mode="edit" initial={ctx.adminDraftTeam} onSubmit={ctx.submitAdminTeam} onDelete={ctx.deleteAdminTeam} />
        </>
      )}

      <Toast toast={ctx.toast} onClose={() => ctx.setToast(null)} />
    </div>
  );
}
