import { z } from "zod";
import type { BadgeId } from "../types.js";
import { sanitizeHtml } from "./sanitize.js";

const BADGE_IDS = ["prompt", "sprint", "iletisim", "lider", "gelisim", "mimar"] as const;

const weekSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
const gradeSchema = z.union([z.literal(9), z.literal(10), z.literal(11)]);
const roleSchema = z.enum(["Kaptan", "Üye"]);
const badgeSchema = z.enum(BADGE_IDS);

const teamMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
  school: z.string(),
  grade: gradeSchema,
  role: roleSchema,
});

const judgeScoresSchema = z.object({
  problem: z.number(),
  aiLogic: z.number(),
  promptQuality: z.number(),
  promptIteration: z.number(),
  analytic: z.number(),
  mvpReality: z.number(),
  guidelineFit: z.number(),
  solutionCoherence: z.number(),
  scalability: z.number(),
  teamHarmony: z.number(),
  comms: z.number(),
  leadership: z.number(),
  discipline: z.number(),
  feedbackOpenness: z.number(),
  presentation: z.number(),
  qna: z.number(),
  stage: z.number(),
});

export const teamSchema = z.object({
  id: z.string().min(1, "Takım id gerekli."),
  week: weekSchema,
  name: z.string().min(1, "Takım adı gerekli.").transform(sanitizeHtml),
  captain: z.string().min(1, "Kaptan adı gerekli.").transform(sanitizeHtml),
  members: z.array(teamMemberSchema),
  tournamentCategory: z.string().min(1, "Turnuva kategorisi gerekli."),
  tournamentTier: z.string().min(1, "Turnuva seviyesi gerekli."),
  projectTitle: z.string().transform(sanitizeHtml),
  createdAtISO: z.string(),
  badges: z.array(badgeSchema),
  scores: judgeScoresSchema,
  judgeNote: z.string().transform(sanitizeHtml),
  tournament: z.string().transform(sanitizeHtml),
  school: z.string().transform(sanitizeHtml),
  projectMainCategory: z.string().optional(),
  projectSubCategory: z.string().optional(),
  assignedJudgeId: z.string().optional().nullable(),
  scoresEnteredByJudgeId: z.string().optional(),
}).passthrough();

export const teamIdSchema = z.object({ id: z.string().min(1, "Takım id gerekli.") });

export const scoresPatchSchema = z.object({
  scores: z.record(z.string(), z.number()).optional().default({}),
  badges: z.array(z.string()).optional().default([]),
  judgeNote: z.string().optional().default("").transform(sanitizeHtml),
  scoresEnteredByJudgeId: z.string().optional(),
});

export function filterValidBadges(badges: string[]): BadgeId[] {
  return badges.filter((b): b is BadgeId => BADGE_IDS.includes(b as BadgeId));
}

const teamImportItemSchema = z.object({
  id: z.string().min(1),
}).passthrough();

export const importTeamsSchema = z.array(teamImportItemSchema);
