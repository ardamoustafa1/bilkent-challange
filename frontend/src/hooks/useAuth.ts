import { useEffect, useState } from "react";
import type { Session } from "@/types";
import { LS_SESSION, LS_TOKEN, DEMO_USERS } from "@/constants/demo";
import { normalizeEmail } from "@/utils/helpers";
import { api } from "@/services/api";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(LS_TOKEN);
    if (token) {
      api.getSession(token)
        .then((s) => {
          setSession(s);
          try { localStorage.setItem(LS_SESSION, JSON.stringify(s)); } catch {}
        })
        .catch(() => {
          try { localStorage.removeItem(LS_TOKEN); localStorage.removeItem(LS_SESSION); } catch {}
        });
      return;
    }
    try {
      const raw = localStorage.getItem(LS_SESSION);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Session;
      if (parsed?.email && parsed?.role) setSession(parsed);
    } catch {}
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string } | void> => {
    try {
      const r = await api.login(email, password);
      const withToken = r && typeof (r as { token?: string }).token === "string";
      if (withToken) {
        const { session: s, token } = r as { session: Session; token: string };
        setSession(s);
        try { localStorage.setItem(LS_TOKEN, token); localStorage.setItem(LS_SESSION, JSON.stringify(s)); } catch {}
        return;
      }
      setSession((r as { session: Session }).session);
      try { localStorage.setItem(LS_SESSION, JSON.stringify(r)); } catch {}
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const u = DEMO_USERS.find((x) => x.email === normalizeEmail(email) && x.pass === password);
      if (u) {
        const s: Session = { email: u.email, role: u.role, name: u.name };
        setSession(s);
        try { localStorage.setItem(LS_SESSION, JSON.stringify(s)); } catch {}
        return;
      }
      return { error: msg || "Email veya şifre hatalı." };
    }
  };

  const logout = async () => {
    const token = api.getStoredToken();
    if (token) {
      try { await api.logout(token); } catch {}
      try { localStorage.removeItem(LS_TOKEN); } catch {}
    }
    setSession(null);
    try { localStorage.removeItem(LS_SESSION); } catch {}
  };

  return { session, login, logout };
}
