import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import type { Session, DemoUser } from "../types.js";
import * as store from "../store.js";

const loginBody = z.object({ email: z.string().min(1, "Email gerekli."), password: z.string().min(1, "Şifre gerekli.") });

const DEMO_USERS: DemoUser[] = [
  {
    email: process.env.ADMIN_EMAIL ?? "admin@biltek.k12.tr",
    pass: process.env.ADMIN_PASS ?? "Biltek2026!",
    role: "admin",
    name: process.env.ADMIN_NAME ?? "Admin",
  },
  {
    email: process.env.JUDGE_EMAIL ?? "hakem@biltek.k12.tr",
    pass: process.env.JUDGE_PASS ?? "Biltek2026!",
    role: "judge",
    name: process.env.JUDGE_NAME ?? "Hakem",
  },
  {
    email: process.env.VISITOR_EMAIL ?? "misafir@biltek.k12.tr",
    pass: process.env.VISITOR_PASS ?? "Biltek2026!",
    role: "visitor",
    name: process.env.VISITOR_NAME ?? "Ziyaretçi",
  },
];

function normalizeEmail(s: string): string {
  return (s || "").trim().toLowerCase();
}

function createToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const parsed = loginBody.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e: { message: string }) => e.message).join(" ") || "Geçersiz istek.";
    res.status(400).json({ error: msg });
    return;
  }
  const { email, password } = parsed.data;
  const e = normalizeEmail(email);
  const u = DEMO_USERS.find((x) => x.email === e && x.pass === password);
  if (!u) {
    res.status(401).json({ error: "Email veya şifre hatalı." });
    return;
  }
  const session: Session = { email: u.email, role: u.role, name: u.name };
  const token = createToken();
  await store.setSession(token, session);
  res.json({ session, token });
});

authRouter.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  const token = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const session = await store.getSession(token);
  if (!session) {
    res.status(401).json({ error: "Oturum geçersiz." });
    return;
  }
  res.json(session);
});

authRouter.post("/logout", async (req, res) => {
  const auth = req.headers.authorization;
  const token = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token) await store.deleteSession(token);
  res.status(204).end();
});
