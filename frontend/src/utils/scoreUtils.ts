import type { JudgeScores, BadgeId, Team } from "@/types";
import { clamp } from "./helpers";

export function computeSubScores(s: JudgeScores) {
  const weightedAvg = (items: { k: keyof JudgeScores, w: number }[]) => {
    const sum = items.reduce((a, item) => a + s[item.k] * item.w, 0);
    const weightSum = items.reduce((a, item) => a + item.w, 0);
    return weightSum > 0 ? sum / weightSum : 1;
  };

  const digital = weightedAvg([
    { k: "aiLogic", w: 3 },
    { k: "promptQuality", w: 2 },
    { k: "problem", w: 1 },
    { k: "promptIteration", w: 1 },
    { k: "analytic", w: 1 }
  ]);
  const project = weightedAvg([
    { k: "mvpReality", w: 2 },
    { k: "solutionCoherence", w: 2 },
    { k: "scalability", w: 1 },
    { k: "guidelineFit", w: 1 }
  ]);
  const skill = weightedAvg([
    { k: "leadership", w: 2 },
    { k: "teamHarmony", w: 2 },
    { k: "comms", w: 1 },
    { k: "discipline", w: 1 },
    { k: "feedbackOpenness", w: 1 }
  ]);
  const presentation = weightedAvg([
    { k: "presentation", w: 2 },
    { k: "qna", w: 2 },
    { k: "stage", w: 1 }
  ]);
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

export function BarajCounts(filtered: Team[]): { burs: number; odul: number; aday: number; havuz: number } {
  const arr = [...filtered].sort(sortByScoreDesc);
  let b = 0, o = 0, a = 0, h = 0;
  arr.forEach((t, i) => {
    const total = evolPercent(t.scores);
    if (i < 4 && total >= 80) b++;
    else if (i < 10 && total >= 70) o++;
    else if (i < 20 && total >= 60) a++;
    else h++;
  });
  return { burs: b, odul: o, aday: a, havuz: h };
}

export function getLeagueData(teams: Team[]) {
  return [...teams].sort(sortByScoreDesc).map(team => {
    const totalScore = evolPercent(team.scores);
    const hasScores = totalScore > 0;
    return {
      team,
      totalScore,
      hasScores
    };
  });
}

export function formatScore(score: number): string {
  return score.toFixed(1) + "%";
}

export function getRankColor(index: number): string {
  if (index === 0) return "text-yellow-400";
  if (index === 1) return "text-slate-300";
  if (index === 2) return "text-amber-500";
  return "text-slate-400";
}

export function sortByScoreDesc(a: Team, b: Team) {
  return evolPercent(b.scores) - evolPercent(a.scores);
}
