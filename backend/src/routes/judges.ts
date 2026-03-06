import { Router } from "express";
import { z } from "zod";
import * as store from "../store.js";

const createJudgeBody = z.object({ name: z.string().min(1, "Hakem adı gerekli."), email: z.string().optional().default("") });

export const judgesRouter = Router();

judgesRouter.get("/", (_req, res) => {
  res.json(store.getJudges());
});

judgesRouter.post("/", (req, res) => {
  const parsed = createJudgeBody.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e: { message: string }) => e.message).join(" ") || "Geçersiz istek.";
    res.status(400).json({ error: msg });
    return;
  }
  const { name, email } = parsed.data;
  const created = store.createJudge({ name: name.trim(), email: email.trim() });
  res.status(201).json(created);
});

judgesRouter.get("/:id", (req, res) => {
  const j = store.getJudgeById(req.params.id);
  if (!j) {
    res.status(404).json({ error: "Hakem bulunamadı." });
    return;
  }
  res.json(j);
});

const updateJudgeBody = z.object({ name: z.string().optional(), email: z.string().optional() });

judgesRouter.put("/:id", (req, res) => {
  const parsed = updateJudgeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Geçersiz istek." });
    return;
  }
  const updated = store.updateJudge(req.params.id, parsed.data);
  if (!updated) {
    res.status(404).json({ error: "Hakem bulunamadı." });
    return;
  }
  res.json(updated);
});

judgesRouter.delete("/:id", (req, res) => {
  const ok = store.deleteJudge(req.params.id);
  if (!ok) {
    res.status(404).json({ error: "Hakem bulunamadı." });
    return;
  }
  res.status(204).end();
});
