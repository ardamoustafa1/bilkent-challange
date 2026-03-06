import type { JudgeScores, BadgeId, Team } from "@/types";
import { clamp } from "./helpers";

export function computeSubScores(s: JudgeScores) {
  const avg = (keys: (keyof JudgeScores)[]) => keys.reduce((a, k) => a + s[k], 0) / (keys.length || 1);
  const digital = avg(["problem", "aiLogic", "promptQuality", "promptIteration", "analytic"]);
  const project = avg(["mvpReality", "guidelineFit", "solutionCoherence", "scalability"]);
  const skill = avg(["teamHarmony", "comms", "leadership", "discipline", "feedbackOpenness"]);
  const presentation = avg(["presentation", "qna", "stage"]);
  return { digital, project, skill, presentation };
}

export function evolPercent(s: JudgeScores) {
  const { digital, project, skill, presentation } = computeSubScores(s);
  const raw = digital * 0.35 + project * 0.25 + skill * 0.25 + presentation * 0.15;
  const pct = (raw / 5) * 100;
  return clamp(pct, 0, 100);
}

export function formatPct(n: number) {
  return `${Math.round(n)}%`;
}

export function scoreLabel(pct: number) {
  if (pct >= 90) return { label: "Ödül + Burs", tone: "success" as const };
  if (pct >= 80) return { label: "Ödül", tone: "primary" as const };
  if (pct >= 70) return { label: "Performans Aday", tone: "warning" as const };
  return { label: "Gelişim Havuzu", tone: "muted" as const };
}

export function toneBadge(tone: "success" | "primary" | "warning" | "muted") {
  switch (tone) {
    case "success":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/70";
    case "primary":
      return "bg-slate-100 text-slate-700 border-slate-200/80";
    case "warning":
      return "bg-amber-50 text-amber-800 border-amber-200/70";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200/70";
  }
}

export function genScores(seed: number): JudgeScores {
  const rnd = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  const base = () => clamp(1 + Math.floor(rnd() * 5), 1, 5);
  return {
    problem: base(),
    aiLogic: base(),
    promptQuality: base(),
    promptIteration: base(),
    analytic: base(),
    mvpReality: base(),
    guidelineFit: base(),
    solutionCoherence: base(),
    scalability: base(),
    teamHarmony: base(),
    comms: base(),
    leadership: base(),
    discipline: base(),
    feedbackOpenness: base(),
    presentation: base(),
    qna: base(),
    stage: base(),
  };
}

export function defaultBadgesFromScores(s: JudgeScores): BadgeId[] {
  const out: BadgeId[] = [];
  if (s.promptQuality >= 4 && s.promptIteration >= 4) out.push("prompt");
  if (s.mvpReality >= 4 && s.solutionCoherence >= 4) out.push("sprint");
  if (s.comms >= 4 && s.qna >= 4) out.push("iletisim");
  if (s.leadership >= 4) out.push("lider");
  if (s.feedbackOpenness >= 4) out.push("gelisim");
  if (s.scalability >= 4 && s.problem >= 4) out.push("mimar");
  return out.slice(0, 3);
}

export function buildScoreBins(teams: Array<{ scores: JudgeScores }>) {
  const bins = [
    { name: "90+", count: 0 },
    { name: "80–89", count: 0 },
    { name: "70–79", count: 0 },
    { name: "<70", count: 0 },
  ];
  for (const t of teams) {
    const p = evolPercent(t.scores);
    if (p >= 90) bins[0].count++;
    else if (p >= 80) bins[1].count++;
    else if (p >= 70) bins[2].count++;
    else bins[3].count++;
  }
  return bins;
}

export function BarajCounts(teams: Array<{ scores: JudgeScores }>) {
  let burs = 0, odul = 0, aday = 0, havuz = 0;
  for (const t of teams) {
    const p = evolPercent(t.scores);
    if (p >= 90) burs++;
    else if (p >= 80) odul++;
    else if (p >= 70) aday++;
    else havuz++;
  }
  return { burs, odul, aday, havuz };
}

export function sortByScoreDesc(a: Team, b: Team) {
  return evolPercent(b.scores) - evolPercent(a.scores);
}
