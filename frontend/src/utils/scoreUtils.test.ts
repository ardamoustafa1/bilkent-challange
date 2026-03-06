import { describe, it, expect } from "vitest";
import { evolPercent, scoreLabel } from "@/utils/scoreUtils";
import { clamp } from "@/utils/helpers";

describe("scoreUtils", () => {
  it("evolPercent returns 0–100", () => {
    const allOnes = {
      problem: 1, aiLogic: 1, promptQuality: 1, promptIteration: 1, analytic: 1,
      mvpReality: 1, guidelineFit: 1, solutionCoherence: 1, scalability: 1,
      teamHarmony: 1, comms: 1, leadership: 1, discipline: 1, feedbackOpenness: 1,
      presentation: 1, qna: 1, stage: 1,
    };
    expect(evolPercent(allOnes)).toBeGreaterThanOrEqual(0);
    expect(evolPercent(allOnes)).toBeLessThanOrEqual(100);
    const allFives = { ...allOnes, problem: 5, aiLogic: 5, promptQuality: 5, promptIteration: 5, analytic: 5, mvpReality: 5, guidelineFit: 5, solutionCoherence: 5, scalability: 5, teamHarmony: 5, comms: 5, leadership: 5, discipline: 5, feedbackOpenness: 5, presentation: 5, qna: 5, stage: 5 };
    expect(evolPercent(allFives)).toBe(100);
  });

  it("scoreLabel returns correct tier for percentage", () => {
    expect(scoreLabel(92).label).toBe("Ödül + Burs");
    expect(scoreLabel(85).label).toBe("Ödül");
    expect(scoreLabel(72).label).toBe("Performans Aday");
    expect(scoreLabel(50).label).toBe("Gelişim Havuzu");
  });
});

describe("helpers", () => {
  it("clamp constrains number", () => {
    expect(clamp(10, 0, 5)).toBe(5);
    expect(clamp(-1, 0, 5)).toBe(0);
    expect(clamp(3, 0, 5)).toBe(3);
  });
});
