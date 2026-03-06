import type { JudgeScores } from "@/types";

export const SCORE_META: Array<{ key: keyof JudgeScores; label: string; group: "Dijital" | "Proje" | "Beceri" | "Sunum" }> = [
  { key: "problem", label: "Problemi doğru anlama", group: "Dijital" },
  { key: "aiLogic", label: "AI mantığı", group: "Dijital" },
  { key: "promptQuality", label: "Prompt kalitesi", group: "Dijital" },
  { key: "promptIteration", label: "Prompt iterasyonu", group: "Dijital" },
  { key: "analytic", label: "Analitik", group: "Dijital" },
  { key: "mvpReality", label: "MVP gerçekliği", group: "Proje" },
  { key: "guidelineFit", label: "Yönerge uyumu", group: "Proje" },
  { key: "solutionCoherence", label: "Çözüm tutarlılığı", group: "Proje" },
  { key: "scalability", label: "Ölçeklenebilirlik", group: "Proje" },
  { key: "teamHarmony", label: "Takım uyumu", group: "Beceri" },
  { key: "comms", label: "İletişim", group: "Beceri" },
  { key: "leadership", label: "Liderlik", group: "Beceri" },
  { key: "discipline", label: "Disiplin", group: "Beceri" },
  { key: "feedbackOpenness", label: "Geri bildirime açıklık", group: "Beceri" },
  { key: "presentation", label: "Sunum", group: "Sunum" },
  { key: "qna", label: "Soru–cevap", group: "Sunum" },
  { key: "stage", label: "Sahne hâkimiyeti", group: "Sunum" },
];

export const SCORE_GROUPS: Array<{
  id: "Dijital" | "Proje" | "Beceri" | "Sunum";
  title: string;
  items: Array<{ key: keyof JudgeScores; label: string }>;
}> = [
  { id: "Dijital", title: "Dijital", items: SCORE_META.filter((m) => m.group === "Dijital").map((m) => ({ key: m.key, label: m.label })) },
  { id: "Proje", title: "Proje", items: SCORE_META.filter((m) => m.group === "Proje").map((m) => ({ key: m.key, label: m.label })) },
  { id: "Beceri", title: "Karakter", items: SCORE_META.filter((m) => m.group === "Beceri").map((m) => ({ key: m.key, label: m.label })) },
  { id: "Sunum", title: "Sunum", items: SCORE_META.filter((m) => m.group === "Sunum").map((m) => ({ key: m.key, label: m.label })) },
];
