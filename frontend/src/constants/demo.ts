import type { Role } from "@/types";

export const DEMO_USERS: Array<{ email: string; pass: string; role: Role; name: string }> = [
  { email: "admin@biltek.k12.tr", pass: "Biltek2026!", role: "admin", name: "Admin" },
  { email: "hakem@biltek.k12.tr", pass: "Biltek2026!", role: "judge", name: "Hakem" },
  { email: "misafir@biltek.k12.tr", pass: "Biltek2026!", role: "visitor", name: "Ziyaretçi" },
];

export const LS_SESSION = "apc_demo_session_v1";
export const LS_TOKEN = "apc_token_v1";
export const LS_TEAMS = "apc_demo_teams_v2";
