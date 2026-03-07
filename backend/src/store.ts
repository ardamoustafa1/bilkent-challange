import fs from "fs";
import path from "path";
import type { Team, Session, Judge } from "./types.js";
import { logger } from "./lib/logger.js";

// ── JSON File Persistence ─────────────────────────────────────────
// Veriler data/ klasörüne JSON olarak kaydedilir.
// Sunucu restart olsa bile veriler korunur.

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const TEAMS_FILE = path.join(DATA_DIR, "teams.json");
const JUDGES_FILE = path.join(DATA_DIR, "judges.json");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    logger.info("store", `Data dizini oluşturuldu: ${DATA_DIR}`);
  }
}

function loadJson<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      logger.info("store", `${path.basename(filePath)} yüklendi (${Array.isArray(data) ? data.length : 0} kayıt)`);
      return data as T;
    }
  } catch (e) {
    logger.error("store", `${filePath} okunamadı:`, e);
  }
  return fallback;
}

function saveJson(filePath: string, data: unknown): void {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    logger.error("store", `${filePath} yazılamadı:`, e);
  }
}

// Debounce: çok sık dosya yazımını önler (100ms)
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
function debouncedSave(filePath: string, data: unknown): void {
  const existing = saveTimers.get(filePath);
  if (existing) clearTimeout(existing);
  saveTimers.set(filePath, setTimeout(() => {
    saveJson(filePath, data);
    saveTimers.delete(filePath);
  }, 100));
}

function persistTeams(): void { debouncedSave(TEAMS_FILE, teams); }
function persistJudges(): void { debouncedSave(JUDGES_FILE, judges); }

// ── Initialize from disk ──────────────────────────────────────────
ensureDataDir();
const teams: Team[] = loadJson<Team[]>(TEAMS_FILE, []);
const judges: Judge[] = loadJson<Judge[]>(JUDGES_FILE, []);

// ── Teams ─────────────────────────────────────────────────────────
export function getTeams(): Team[] {
  return teams;
}

export function getTeamById(id: string): Team | undefined {
  return teams.find((t) => t.id === id);
}

export function setTeams(newTeams: Team[]): void {
  teams.length = 0;
  teams.push(...newTeams);
  persistTeams();
}

export function upsertTeam(team: Team): Team {
  const idx = teams.findIndex((t) => t.id === team.id);
  const body = team as Team & { assignedJudgeId?: string | null };
  if (idx >= 0) {
    const existing = teams[idx];
    const assignedJudgeId = body.assignedJudgeId === null ? undefined : (team.assignedJudgeId ?? existing.assignedJudgeId);
    teams[idx] = { ...team, scores: existing.scores, badges: existing.badges, judgeNote: existing.judgeNote, createdAtISO: existing.createdAtISO, assignedJudgeId };
    persistTeams();
    return teams[idx];
  }
  teams.push({ ...team, assignedJudgeId: body.assignedJudgeId === null ? undefined : team.assignedJudgeId });
  persistTeams();
  return teams[teams.length - 1];
}

export function deleteTeam(id: string): boolean {
  const idx = teams.findIndex((t) => t.id === id);
  if (idx < 0) return false;
  teams.splice(idx, 1);
  persistTeams();
  return true;
}

export function updateTeamScores(teamId: string, scores: Team["scores"], badges: Team["badges"], judgeNote: string, scoresEnteredByJudgeId?: string): Team | undefined {
  const t = teams.find((x) => x.id === teamId);
  if (!t) return undefined;
  t.scores = scores;
  t.badges = badges;
  t.judgeNote = judgeNote;
  if (scoresEnteredByJudgeId !== undefined) t.scoresEnteredByJudgeId = scoresEnteredByJudgeId;
  persistTeams();
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

// ── Sessions (file-persisted) ──────────────────────────────────────
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

const sessionsData = loadJson<Record<string, Session>>(SESSIONS_FILE, {});
const sessions = new Map<string, Session>(Object.entries(sessionsData));

function persistSessions(): void {
  const obj = Object.fromEntries(sessions);
  debouncedSave(SESSIONS_FILE, obj);
}

export function setSession(token: string, session: Session): void {
  sessions.set(token, session);
  persistSessions();
}

export function getSession(token: string): Session | null {
  return sessions.get(token) ?? null;
}

export function deleteSession(token: string): void {
  sessions.delete(token);
  persistSessions();
}

export function validateSession(token: string): Session | null {
  return getSession(token);
}

// ── Judges ────────────────────────────────────────────────────────
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
  persistJudges();
  return created;
}

export function updateJudge(id: string, patch: Partial<Pick<Judge, "name" | "email">>): Judge | undefined {
  const j = judges.find((x) => x.id === id);
  if (!j) return undefined;
  if (patch.name !== undefined) j.name = patch.name;
  if (patch.email !== undefined) j.email = patch.email;
  persistJudges();
  return j;
}

export function deleteJudge(id: string): boolean {
  const idx = judges.findIndex((x) => x.id === id);
  if (idx < 0) return false;
  judges.splice(idx, 1);
  persistJudges();
  return true;
}
