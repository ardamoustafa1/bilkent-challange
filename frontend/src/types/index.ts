export type WeekId = 1 | 2 | 3 | 4;

export type BadgeId = "prompt" | "sprint" | "iletisim" | "lider" | "gelisim" | "mimar";

export type Role = "admin" | "judge" | "visitor";

export type Session = {
  email: string;
  role: Role;
  name: string;
};

export type TournamentCategory =
  | "Custom AI Challenge"
  | "Prototype Challenge"
  | "Agent Challenge"
  | "APP Challenge"
  | "BİG Wiser Challenge";

export type TournamentTier =
  | "C Seviye AI Asistan Oluşturma > Custom Level-1"
  | "B Seviye AI Asistan Oluşturma > Custom Level-2"
  | "A Seviye AI Asistan Oluşturma > Custom Level-3"
  | "C Seviye İş Fikrini Modelleme > MVP Level-1"
  | "B Seviye İş Fikrini Modelleme > MVP Level-2"
  | "A Seviye İş Fikrini Modelleme > MVP Level-3"
  | "C Seviye AI Ajan Geliştirme > Agent Level-1"
  | "B Seviye AI Ajan Geliştirme > Agent Level-2"
  | "A Seviye AI Ajan Geliştirme > Agent Level-3"
  | "C Seviye APP Geliştirme > APP Level-1"
  | "B Seviye APP Geliştirme > APP Level-2"
  | "A Seviye APP Geliştirme > APP Level-3"
  | "C Seviye Girişim Geliştirme > İnnovation Level-1"
  | "B Seviye Girişim Geliştirme > İnnovation Level-2"
  | "A Seviye Girişim Geliştirme > İnnovation Level-3";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  school: string;
  grade: 9 | 10 | 11;
  role: "Kaptan" | "Üye";
};

export type JudgeScores = {
  problem: number;
  aiLogic: number;
  promptQuality: number;
  promptIteration: number;
  analytic: number;
  mvpReality: number;
  guidelineFit: number;
  solutionCoherence: number;
  scalability: number;
  teamHarmony: number;
  comms: number;
  leadership: number;
  discipline: number;
  feedbackOpenness: number;
  presentation: number;
  qna: number;
  stage: number;
};

export type Judge = {
  id: string;
  name: string;
  email: string;
  /** Hakemin bağlı olduğu okul (opsiyonel) */
  school?: string;
  createdAtISO?: string;
};

export type AuditLog = {
  id: string;
  teamId: string;
  judgeId: string;
  action: string;
  oldScores: any;
  newScores: any;
  createdAt: string;
};

export type Team = {
  id: string;
  week: WeekId;
  name: string;
  captain: string;
  members: TeamMember[];
  tournamentCategory: TournamentCategory;
  tournamentTier: TournamentTier;
  projectTitle: string;
  createdAtISO: string;
  badges: BadgeId[];
  scores: JudgeScores;
  rawScores?: Record<string, JudgeScores>;
  judgeNote: string;
  tournament: string;
  school: string;
  projectMainCategory?: string;
  projectSubCategory?: string;
  assignedJudgeId?: string;
  scoresEnteredByJudgeId?: string;
};

export type ImportRow = {
  team_id?: string;
  team_name?: string;
  week?: string | number;
  tournament_category?: string;
  tournament_tier?: string;
  project_title?: string;
  member_school?: string;
  member_name?: string;
  member_email?: string;
  member_grade?: string | number;
  member_role?: string;
  tournament?: string;
  school?: string;
  project_main_category?: string;
  project_sub_category?: string;
};

export type ProjectCategoryTree = {
  main: string;
  mainSDG: string;
  def: string;
  subs: Array<{ name: string; sdgs: string[]; def: string }>;
};
