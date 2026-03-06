import type { TournamentCategory, TournamentTier } from "@/types";

export const TOURNAMENT_CATALOG: Array<{
  category: TournamentCategory;
  desc: string;
  tiers: TournamentTier[];
}> = [
  {
    category: "Custom AI Challenge",
    desc: "Kısa Açıklama Göster",
    tiers: [
      "C Seviye AI Asistan Oluşturma > Custom Level-1",
      "B Seviye AI Asistan Oluşturma > Custom Level-2",
      "A Seviye AI Asistan Oluşturma > Custom Level-3",
    ],
  },
  {
    category: "Prototype Challenge",
    desc: "Kısa Açıklama Göster",
    tiers: [
      "C Seviye İş Fikrini Modelleme > MVP Level-1",
      "B Seviye İş Fikrini Modelleme > MVP Level-2",
      "A Seviye İş Fikrini Modelleme > MVP Level-3",
    ],
  },
  {
    category: "Agent Challenge",
    desc: "Kısa Açıklama Göster",
    tiers: [
      "C Seviye AI Ajan Geliştirme > Agent Level-1",
      "B Seviye AI Ajan Geliştirme > Agent Level-2",
      "A Seviye AI Ajan Geliştirme > Agent Level-3",
    ],
  },
  {
    category: "APP Challenge",
    desc: "Kısa Açıklama Göster",
    tiers: [
      "C Seviye APP Geliştirme > APP Level-1",
      "B Seviye APP Geliştirme > APP Level-2",
      "A Seviye APP Geliştirme > APP Level-3",
    ],
  },
  {
    category: "BİG Wiser Challenge",
    desc: "Kısa Açıklama Göster",
    tiers: [
      "C Seviye Girişim Geliştirme > İnnovation Level-1",
      "B Seviye Girişim Geliştirme > İnnovation Level-2",
      "A Seviye Girişim Geliştirme > İnnovation Level-3",
    ],
  },
];
