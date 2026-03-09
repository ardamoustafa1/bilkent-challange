import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import * as store from "../store.js";

export const logsRouter = Router();

logsRouter.get("/", requireAdmin, async (_req, res) => {
  try {
    const logs = await store.getAuditLogs();
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: "Loglar getirilirken hata oluştu." });
  }
});
