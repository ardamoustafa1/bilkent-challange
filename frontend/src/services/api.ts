import type { Session, Team, Judge, AuditLog } from "@/types";
import { LS_TOKEN } from "@/constants/demo";

const API_BASE =
  typeof import.meta.env !== "undefined" && import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/$/, "")
    : "";
const base = API_BASE ? API_BASE : (typeof window !== "undefined" ? "" : "http://localhost:3001");

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_TOKEN);
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  async login(email: string, password: string): Promise<{ session: Session; token: string }> {
    return fetchJson<{ session: Session; token: string }>(`${base}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async getSession(token: string): Promise<Session> {
    return fetchJson<Session>(`${base}/api/auth/me`, {
      headers: { ...authHeaders(), Authorization: `Bearer ${token}` },
    });
  },

  async logout(token: string): Promise<void> {
    try {
      await fetch(`${base}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  },

  getStoredToken,

  async getTeams(): Promise<Team[]> {
    return fetchJson<Team[]>(`${base}/api/teams`);
  },

  async createTeam(team: Team): Promise<Team> {
    return fetchJson<Team>(`${base}/api/teams`, {
      method: "POST",
      body: JSON.stringify(team),
    });
  },

  async updateTeam(team: Team): Promise<Team> {
    return fetchJson<Team>(`${base}/api/teams/${team.id}`, {
      method: "PUT",
      body: JSON.stringify(team),
    });
  },

  async deleteTeam(id: string): Promise<void> {
    await fetchJson<void>(`${base}/api/teams/${id}`, {
      method: "DELETE",
    });
  },

  async updateTeamScores(teamId: string, scores: Team["scores"], badges: Team["badges"], judgeNote: string, scoresEnteredByJudgeId?: string): Promise<Team> {
    return fetchJson<Team>(`${base}/api/teams/${teamId}/scores`, {
      method: "PATCH",
      body: JSON.stringify({ scores, badges, judgeNote, scoresEnteredByJudgeId }),
    });
  },

  async importTeams(teams: Team[]): Promise<Team[]> {
    return fetchJson<Team[]>(`${base}/api/teams/import`, {
      method: "POST",
      body: JSON.stringify(teams),
    });
  },

  async getJudges(): Promise<Judge[]> {
    return fetchJson<Judge[]>(`${base}/api/judges`);
  },

  async createJudge(judge: { name: string; email: string }): Promise<Judge> {
    return fetchJson<Judge>(`${base}/api/judges`, {
      method: "POST",
      body: JSON.stringify(judge),
    });
  },

  async updateJudge(id: string, patch: { name?: string; email?: string }): Promise<Judge> {
    return fetchJson<Judge>(`${base}/api/judges/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  },

  async deleteJudge(id: string): Promise<void> {
    await fetchJson<void>(`${base}/api/judges/${id}`, { method: "DELETE" });
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return fetchJson<AuditLog[]>(`${base}/api/logs`);
  },

  async health(): Promise<boolean> {
    try {
      const r = await fetch(`${base}/api/health`);
      return r.ok;
    } catch {
      return false;
    }
  },
};
