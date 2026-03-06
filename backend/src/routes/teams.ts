import { Router } from "express";
import * as store from "../store.js";
import type { Team } from "../types.js";
import { teamSchema, teamIdSchema, scoresPatchSchema, importTeamsSchema, filterValidBadges } from "../lib/validation.js";

export const teamsRouter = Router();

teamsRouter.get("/", (_req, res) => {
  res.json(store.getTeams());
});

teamsRouter.get("/:id", (req, res) => {
  const t = store.getTeamById(req.params.id);
  if (!t) {
    res.status(404).json({ error: "Takım bulunamadı." });
    return;
  }
  res.json(t);
});

teamsRouter.post("/", (req, res) => {
  const parsed = teamSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e: { message: string }) => e.message).join(" ") || "Geçersiz istek.";
    res.status(400).json({ error: msg });
    return;
  }
  const team = parsed.data as Team;
  const created = store.upsertTeam(team);
  res.status(201).json(created);
});

teamsRouter.put("/:id", (req, res) => {
  const parsed = teamSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e: { message: string }) => e.message).join(" ") || "Geçersiz istek.";
    res.status(400).json({ error: msg });
    return;
  }
  const team = parsed.data as Team;
  if (req.params.id !== team.id) {
    res.status(400).json({ error: "URL id ile body id uyuşmuyor." });
    return;
  }
  const updated = store.upsertTeam(team);
  res.json(updated);
});

teamsRouter.patch("/:id/scores", (req, res) => {
  const parsed = scoresPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e: { message: string }) => e.message).join(" ") || "Geçersiz istek.";
    res.status(400).json({ error: msg });
    return;
  }
  const { scores, badges, judgeNote, scoresEnteredByJudgeId } = parsed.data;
  const validBadges = filterValidBadges(badges);
  const updated = store.updateTeamScores(req.params.id, scores as Team["scores"], validBadges, judgeNote, scoresEnteredByJudgeId);
  if (!updated) {
    res.status(404).json({ error: "Takım bulunamadı." });
    return;
  }
  res.json(updated);
});

teamsRouter.post("/import", (req, res) => {
  const parsed = importTeamsSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e: { message: string }) => e.message).join(" ") || "Geçerli takım listesi gerekli.";
    res.status(400).json({ error: msg });
    return;
  }
  const result = store.replaceTeamsWithMerge(parsed.data as Team[]);
  res.json(result);
});
