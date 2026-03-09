import type { Request, Response, NextFunction } from "express";
import type { Session } from "../types.js";
import * as store from "../store.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = req.headers.authorization;
  const token = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const session = await store.getSession(token);
  if (!session) {
    res.status(401).json({ error: "Oturum gerekli. Lütfen giriş yapın." });
    return;
  }
  (req as Request & { session: Session }).session = session;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = (req as Request & { session?: Session }).session;
  if (!session || session.role !== "admin") {
    res.status(403).json({ error: "Bu işlem için yönetici yetkisi gerekli." });
    return;
  }
  next();
}

export function requireJudgeOrAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = (req as Request & { session?: Session }).session;
  if (!session || (session.role !== "admin" && session.role !== "judge")) {
    res.status(403).json({ error: "Bu işlem için hakem veya yönetici yetkisi gerekli." });
    return;
  }
  next();
}
