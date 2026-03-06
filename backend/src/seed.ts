import type { Team, JudgeScores, BadgeId, TournamentCategory, TournamentTier, WeekId, TeamMember } from "./types.js";

const TOURNAMENT_CATALOG: Array<{ category: TournamentCategory; tiers: TournamentTier[] }> = [
  {
    category: "Custom AI Challenge",
    tiers: [
      "C Seviye AI Asistan Oluşturma > Custom Level-1",
      "B Seviye AI Asistan Oluşturma > Custom Level-2",
      "A Seviye AI Asistan Oluşturma > Custom Level-3",
    ],
  },
  {
    category: "Prototype Challenge",
    tiers: [
      "C Seviye İş Fikrini Modelleme > MVP Level-1",
      "B Seviye İş Fikrini Modelleme > MVP Level-2",
      "A Seviye İş Fikrini Modelleme > MVP Level-3",
    ],
  },
  {
    category: "Agent Challenge",
    tiers: [
      "C Seviye AI Ajan Geliştirme > Agent Level-1",
      "B Seviye AI Ajan Geliştirme > Agent Level-2",
      "A Seviye AI Ajan Geliştirme > Agent Level-3",
    ],
  },
  {
    category: "APP Challenge",
    tiers: [
      "C Seviye APP Geliştirme > APP Level-1",
      "B Seviye APP Geliştirme > APP Level-2",
      "A Seviye APP Geliştirme > APP Level-3",
    ],
  },
  {
    category: "BİG Wiser Challenge",
    tiers: [
      "C Seviye Girişim Geliştirme > İnnovation Level-1",
      "B Seviye Girişim Geliştirme > İnnovation Level-2",
      "A Seviye Girişim Geliştirme > İnnovation Level-3",
    ],
  },
];

const PROJECT_MAIN_CATS = [
  "Eğitim Teknolojileri ve Öğrenme Dönüşümü",
  "Sürdürülebilirlik ve İklim Çözümleri",
  "Sağlık ve Yaşam Kalitesi",
  "Toplumsal Fayda ve Eşitlik",
  "Akıllı Şehirler ve Altyapı",
  "Ekonomi, Finans ve İş Dünyası",
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function safeUUID() {
  const c = typeof crypto !== "undefined" ? (crypto as Crypto) : null;
  if (c?.randomUUID) return c.randomUUID();
  return "id-" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function genScores(seed: number): JudgeScores {
  let s = seed;
  const rnd = () => {
    const x = Math.sin(s++) * 10000;
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

function defaultBadgesFromScores(s: JudgeScores): BadgeId[] {
  const out: BadgeId[] = [];
  if (s.promptQuality >= 4 && s.promptIteration >= 4) out.push("prompt");
  if (s.mvpReality >= 4 && s.solutionCoherence >= 4) out.push("sprint");
  if (s.comms >= 4 && s.qna >= 4) out.push("iletisim");
  if (s.leadership >= 4) out.push("lider");
  if (s.feedbackOpenness >= 4) out.push("gelisim");
  if (s.scalability >= 4 && s.problem >= 4) out.push("mimar");
  return out.slice(0, 3);
}

function pickTournamentCategory(n: number): TournamentCategory {
  return TOURNAMENT_CATALOG[n % TOURNAMENT_CATALOG.length].category;
}

function pickTournamentTier(cat: TournamentCategory, n: number): TournamentTier {
  const tiers = TOURNAMENT_CATALOG.find((x) => x.category === cat)?.tiers ?? TOURNAMENT_CATALOG[0].tiers;
  return tiers[n % tiers.length];
}

export function makeDemoTeams(): Team[] {
  const themes = ["Sınav Strateji Motoru", "Soru Çözüm Rehberi", "Sunum Hazırlık Asistanı", "Duygu & Motivasyon Takibi", "AI Öğrenme Koçu"];
  const teams = ["Nova", "Quanta", "Neuron", "Orbit", "Pulse", "Astra", "Echo", "Helix", "Zenith", "Cobalt"];
  const names = ["Deniz", "Ece", "Mert", "Asya", "Arda", "Elif", "Kerem", "Zeynep", "Mina", "Can", "Eren", "Ada", "Sude", "Eylül"];
  const schools = ["BİLTEK", "BİLTEK Kampüs B", "İzmir Türk Koleji", "Teknokent Kolejleri", "BİLTEK Kampüs C"];
  const tournaments = ["Okul İçi Lig", "İlçe Championship", "Kampüs Ligi"];

  const out: Team[] = [];
  let n = 0;
  ([1, 2, 3, 4] as WeekId[]).forEach((w) => {
    for (let i = 0; i < 10; i++) {
      n++;
      const captainName = names[(n + 2) % names.length];
      const id = `t-${w}-${String(n).padStart(2, "0")}`;
      const school = schools[(n + w) % schools.length];
      const members: TeamMember[] = Array.from({ length: 4 }, (_, mi) => {
        const name = mi === 0 ? captainName : names[(n + mi + 1) % names.length];
        return {
          id: `m-${id}-${mi}`,
          name,
          email: `${name.toLowerCase()}${w}${n}${mi}@biltek.k12.tr`,
          school,
          grade: ([9, 10, 11] as const)[(n + mi) % 3],
          role: mi === 0 ? "Kaptan" : "Üye",
        };
      });
      const scores = genScores(n * 13 + w * 101);
      const main = PROJECT_MAIN_CATS[(n + w) % PROJECT_MAIN_CATS.length];
      const cat = pickTournamentCategory(n + w);
      const tier = pickTournamentTier(cat, n + w);

      out.push({
        id,
        week: w,
        name: `Takım ${teams[(n + w) % teams.length]}-${String(n).padStart(2, "0")}`,
        captain: captainName,
        members,
        tournamentCategory: cat,
        tournamentTier: tier,
        projectTitle: themes[(n + w) % themes.length],
        createdAtISO: new Date(Date.now() - (5 + ((n + w) % 20)) * 86400000).toISOString(),
        badges: defaultBadgesFromScores(scores),
        scores,
        judgeNote: (n + w) % 2 === 0 ? "İterasyon iyi; MVP net." : "Sunum güçlü; detaylar olgunlaşıyor.",
        tournament: tournaments[(n + w) % tournaments.length],
        school,
        projectMainCategory: main,
        projectSubCategory: undefined,
      });
    }
  });
  return out;
}
