import type { Team, Session, DemoUser, Judge } from "./types";

const KV_KEY_TEAMS = "chall:teams";
const KV_KEY_DEMO_USERS = "chall:demo_users";
const KV_KEY_JUDGES = "chall:judges";
const SESSION_PREFIX = "chall:session:";
const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 gün

const KV_UNAVAILABLE_MSG =
  "Vercel KV yapılandırılmamış. Deploy için KV_REST_API_URL ve KV_REST_API_TOKEN ortam değişkenlerini ayarlayın.";

async function getKV() {
  try {
    const { kv } = await import("@vercel/kv");
    return kv;
  } catch {
    return null;
  }
}

export function isKVError(e: unknown): boolean {
  return e instanceof Error && (e.message === KV_UNAVAILABLE_MSG || e.message.includes("KV"));
}

export async function getTeams(): Promise<Team[]> {
  const kv = await getKV();
  if (!kv) throw new Error(KV_UNAVAILABLE_MSG);
  const data = await kv.get<Team[]>(KV_KEY_TEAMS);
  return Array.isArray(data) ? data : [];
}

export async function setTeams(teams: Team[]): Promise<void> {
  const kv = await getKV();
  if (!kv) throw new Error(KV_UNAVAILABLE_MSG);
  await kv.set(KV_KEY_TEAMS, teams);
}

export async function getTeamById(id: string): Promise<Team | undefined> {
  const teams = await getTeams();
  return teams.find((t) => t.id === id);
}

export async function upsertTeam(team: Team): Promise<Team> {
  const teams = await getTeams();
  const idx = teams.findIndex((t) => t.id === team.id);
  if (idx >= 0) {
    const existing = teams[idx];
    const incoming = team as { assignedJudgeId?: string | null };
    teams[idx] = {
      ...team,
      scores: existing.scores,
      badges: existing.badges,
      judgeNote: existing.judgeNote,
      createdAtISO: existing.createdAtISO,
      assignedJudgeId: incoming.assignedJudgeId === null ? undefined : (team.assignedJudgeId ?? existing.assignedJudgeId),
    };
  } else {
    teams.push(team);
  }
  await setTeams(teams);
  return teams.find((t) => t.id === team.id)!;
}

export async function updateTeamScores(
  teamId: string,
  scores: Team["scores"],
  badges: Team["badges"],
  judgeNote: string,
  scoresEnteredByJudgeId?: string
): Promise<Team | undefined> {
  const teams = await getTeams();
  const t = teams.find((x) => x.id === teamId);
  if (!t) return undefined;
  t.scores = scores;
  t.badges = badges;
  t.judgeNote = judgeNote;
  if (scoresEnteredByJudgeId !== undefined) t.scoresEnteredByJudgeId = scoresEnteredByJudgeId;
  await setTeams(teams);
  return t;
}

export async function replaceTeamsWithMerge(incoming: Team[]): Promise<Team[]> {
  const teams = await getTeams();
  const byId = new Map(teams.map((t) => [t.id, t]));
  const merged: Team[] = [];
  for (const inc of incoming) {
    const existing = byId.get(inc.id);
    if (existing) {
      merged.push({
        ...inc,
        scores: existing.scores,
        badges: existing.badges,
        judgeNote: existing.judgeNote,
        createdAtISO: existing.createdAtISO,
        assignedJudgeId: existing.assignedJudgeId ?? inc.assignedJudgeId,
      });
    } else {
      merged.push(inc);
    }
  }
  const untouched = teams.filter((t) => !incoming.some((i) => i.id === t.id));
  const result = [...untouched, ...merged];
  await setTeams(result);
  return result;
}

// --- Session (KV'de oturum, cihazlar arası) ---
export async function getSession(token: string): Promise<Session | null> {
  const kv = await getKV();
  if (!kv) throw new Error(KV_UNAVAILABLE_MSG);
  const data = await kv.get<Session>(SESSION_PREFIX + token);
  return data ?? null;
}

export async function setSession(token: string, session: Session): Promise<void> {
  const kv = await getKV();
  if (!kv) throw new Error(KV_UNAVAILABLE_MSG);
  await kv.set(SESSION_PREFIX + token, session, { ex: SESSION_TTL_SEC });
}

export async function deleteSession(token: string): Promise<void> {
  const kv = await getKV();
  if (!kv) throw new Error(KV_UNAVAILABLE_MSG);
  await kv.del(SESSION_PREFIX + token);
}

// --- Kullanıcılar: Demo hesaplar (admin/hakem/misafir) KV boşsa seed'lenir ---
const DEFAULT_DEMO_USERS: DemoUser[] = [
  { email: "admin@biltek.k12.tr", pass: "Biltek2026!", role: "admin", name: "Admin" },
  { email: "hakem@biltek.k12.tr", pass: "Biltek2026!", role: "judge", name: "Hakem" },
  { email: "misafir@biltek.k12.tr", pass: "Biltek2026!", role: "visitor", name: "Ziyaretçi" },
];

export async function getDemoUsers(): Promise<DemoUser[]> {
  const kv = await getKV();
  if (!kv) throw new Error(KV_UNAVAILABLE_MSG);
  const data = await kv.get<DemoUser[]>(KV_KEY_DEMO_USERS);
  if (Array.isArray(data) && data.length > 0) return data;
  await kv.set(KV_KEY_DEMO_USERS, DEFAULT_DEMO_USERS);
  return DEFAULT_DEMO_USERS;
}

export async function setDemoUsers(users: DemoUser[]): Promise<void> {
  const kv = await getKV();
  if (!kv) throw new Error(KV_UNAVAILABLE_MSG);
  await kv.set(KV_KEY_DEMO_USERS, users);
}

// --- Judges (KV'de hakem listesi) ---
export async function getJudges(): Promise<Judge[]> {
  const kv = await getKV();
  if (!kv) throw new Error(KV_UNAVAILABLE_MSG);
  const data = await kv.get<Judge[]>(KV_KEY_JUDGES);
  return Array.isArray(data) ? data : [];
}

export async function setJudges(judges: Judge[]): Promise<void> {
  const kv = await getKV();
  if (!kv) throw new Error(KV_UNAVAILABLE_MSG);
  await kv.set(KV_KEY_JUDGES, judges);
}

export async function getJudgeById(id: string): Promise<Judge | undefined> {
  const list = await getJudges();
  return list.find((j) => j.id === id);
}

export async function createJudge(judge: Judge): Promise<Judge> {
  const list = await getJudges();
  list.push(judge);
  await setJudges(list);
  return judge;
}

export async function updateJudge(id: string, patch: Partial<Judge>): Promise<Judge | undefined> {
  const list = await getJudges();
  const idx = list.findIndex((j) => j.id === id);
  if (idx < 0) return undefined;
  list[idx] = { ...list[idx], ...patch };
  await setJudges(list);
  return list[idx];
}

export async function deleteJudge(id: string): Promise<boolean> {
  const list = await getJudges();
  const next = list.filter((j) => j.id !== id);
  if (next.length === list.length) return false;
  await setJudges(next);
  return true;
}
