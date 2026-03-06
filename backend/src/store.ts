import type { Team, Session, Judge } from "./types.js";
import { makeDemoTeams } from "./seed.js";

const teams: Team[] = makeDemoTeams();
const judges: Judge[] = [];

export function getTeams(): Team[] {
  return teams;
}

export function getTeamById(id: string): Team | undefined {
  return teams.find((t) => t.id === id);
}

export function setTeams(newTeams: Team[]): void {
  teams.length = 0;
  teams.push(...newTeams);
}

export function upsertTeam(team: Team): Team {
  const idx = teams.findIndex((t) => t.id === team.id);
  const body = team as Team & { assignedJudgeId?: string | null };
  if (idx >= 0) {
    const existing = teams[idx];
    const assignedJudgeId = body.assignedJudgeId === null ? undefined : (team.assignedJudgeId ?? existing.assignedJudgeId);
    teams[idx] = { ...team, scores: existing.scores, badges: existing.badges, judgeNote: existing.judgeNote, createdAtISO: existing.createdAtISO, assignedJudgeId };
    return teams[idx];
  }
  teams.push({ ...team, assignedJudgeId: body.assignedJudgeId === null ? undefined : team.assignedJudgeId });
  return teams[teams.length - 1];
}

export function updateTeamScores(teamId: string, scores: Team["scores"], badges: Team["badges"], judgeNote: string, scoresEnteredByJudgeId?: string): Team | undefined {
  const t = teams.find((x) => x.id === teamId);
  if (!t) return undefined;
  t.scores = scores;
  t.badges = badges;
  t.judgeNote = judgeNote;
  if (scoresEnteredByJudgeId !== undefined) t.scoresEnteredByJudgeId = scoresEnteredByJudgeId;
  return t;
}

export function replaceTeamsWithMerge(incoming: Team[]): Team[] {
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
        scoresEnteredByJudgeId: existing.scoresEnteredByJudgeId ?? inc.scoresEnteredByJudgeId,
      });
    } else {
      merged.push(inc);
    }
  }
  const untouched = teams.filter((t) => !incoming.some((i) => i.id === t.id));
  setTeams([...untouched, ...merged]);
  return getTeams();
}

// In-memory session store (token -> session)
const sessions = new Map<string, Session>();

export function setSession(token: string, session: Session): void {
  sessions.set(token, session);
}

export function getSession(token: string): Session | null {
  return sessions.get(token) ?? null;
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}

export function validateSession(token: string): Session | null {
  return getSession(token);
}

// Judges (in-memory)
export function getJudges(): Judge[] {
  return [...judges];
}

export function getJudgeById(id: string): Judge | undefined {
  return judges.find((j) => j.id === id);
}

export function createJudge(judge: Omit<Judge, "id" | "createdAtISO">): Judge {
  const id = `j-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const created: Judge = { ...judge, id, createdAtISO: new Date().toISOString() };
  judges.push(created);
  return created;
}

export function updateJudge(id: string, patch: Partial<Pick<Judge, "name" | "email">>): Judge | undefined {
  const j = judges.find((x) => x.id === id);
  if (!j) return undefined;
  if (patch.name !== undefined) j.name = patch.name;
  if (patch.email !== undefined) j.email = patch.email;
  return j;
}

export function deleteJudge(id: string): boolean {
  const idx = judges.findIndex((x) => x.id === id);
  if (idx < 0) return false;
  judges.splice(idx, 1);
  return true;
}
