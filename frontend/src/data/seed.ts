import type { Team, TournamentCategory, TournamentTier, WeekId, TeamMember } from "@/types";
import { TOURNAMENT_CATALOG } from "@/constants/catalog";
import { PROJECT_CATEGORIES } from "@/constants/projectCategories";
import { genScores, defaultBadgesFromScores } from "@/utils/scoreUtils";

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
  const mainCats = PROJECT_CATEGORIES.map((c) => c.main);

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
      const main = mainCats[(n + w) % mainCats.length];
      const subList = PROJECT_CATEGORIES.find((x) => x.main === main)?.subs ?? [];
      const sub = subList.length ? subList[(n + w) % subList.length].name : undefined;
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
        projectSubCategory: sub,
      });
    }
  });

  return out;
}
