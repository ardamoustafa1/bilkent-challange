import type { Request, Response, NextFunction } from "express";
import type { Session } from "../types.js";
import * as store from "../store.js";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  const token = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const session = store.getSession(token);
  if (!session) {
    res.status(401).json({ error: "Oturum gerekli. Lütfen giriş yapın." });
    return;
  }
  (req as Request & { session: Session }).session = session;
  next();
}
