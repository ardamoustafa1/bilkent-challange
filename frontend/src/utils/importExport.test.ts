import { describe, it, expect } from "vitest";
import { mergeOverwritePreserveScores } from "./importExport";
import type { Team } from "@/types";

describe("importExport", () => {
  it("mergeOverwritePreserveScores keeps existing scores when merging", () => {
    const existing: Team = {
      id: "t1",
      week: 1,
      name: "Takım A",
      captain: "Ali",
      members: [],
      tournamentCategory: "Custom AI Challenge",
      tournamentTier: "C Seviye AI Asistan Oluşturma > Custom Level-1",
      projectTitle: "Proje",
      createdAtISO: "2024-01-01",
      badges: [],
      scores: { problem: 5, aiLogic: 4, promptQuality: 5, promptIteration: 4, analytic: 4, mvpReality: 4, guidelineFit: 4, solutionCoherence: 4, scalability: 4, teamHarmony: 4, comms: 4, leadership: 4, discipline: 4, feedbackOpenness: 4, presentation: 4, qna: 4, stage: 4 },
      judgeNote: "Güzel",
      tournament: "Lig",
      school: "Okul",
    };
    const incoming: Team = {
      ...existing,
      name: "Takım A Güncel",
      scores: { ...existing.scores, problem: 1 },
    };
    const merged = mergeOverwritePreserveScores(existing, incoming);
    expect(merged.scores).toEqual(existing.scores);
    expect(merged.name).toBe("Takım A Güncel");
  });
});
