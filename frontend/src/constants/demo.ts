import type { Role } from "@/types";

/** LocalStorage anahtarları */
export const LS_SESSION = "chall_session_v1";
export const LS_TOKEN = "chall_token_v1";
export const LS_TEAMS = "chall_teams_v1";
export const LS_JUDGES = "chall_judges_v1";

/** API yokken veya lokal geliştirmede kullanılacak demo kullanıcılar */
export const DEMO_USERS: Array<{ email: string; pass: string; role: Role; name: string }> = [
  { email: "admin@biltek.k12.tr", pass: "Biltek2026!", role: "admin", name: "Admin" },
  { email: "hakem@biltek.k12.tr", pass: "Biltek2026!", role: "judge", name: "Hakem" },
  { email: "misafir@biltek.k12.tr", pass: "Biltek2026!", role: "visitor", name: "Ziyaretçi" },
];

