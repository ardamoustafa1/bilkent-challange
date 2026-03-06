import type { WeekId, TeamMember, TournamentCategory, TournamentTier } from "@/types";
import { TOURNAMENT_CATALOG } from "@/constants/catalog";

export function coerceWeek(v: unknown): WeekId {
  const n = Number(String(v ?? "").trim());
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return 1;
}

export function coerceMemberRole(v: unknown): TeamMember["role"] {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "kaptan" || s === "captain") return "Kaptan";
  return "Üye";
}

export function coerceGrade(v: unknown): TeamMember["grade"] {
  const n = Number(String(v ?? "").trim());
  if (n === 9 || n === 10 || n === 11) return n;
  return 9;
}

export function coerceTournamentCategory(v: unknown): TournamentCategory {
  const s = String(v ?? "").trim();
  const found = TOURNAMENT_CATALOG.find((x) => x.category === (s as TournamentCategory));
  return (found?.category ?? TOURNAMENT_CATALOG[0].category) as TournamentCategory;
}

export function coerceTournamentTier(cat: TournamentCategory, v: unknown): TournamentTier {
  const s = String(v ?? "").trim();
  const found = TOURNAMENT_CATALOG.find((x) => x.category === cat);
  const tiers = found?.tiers ?? TOURNAMENT_CATALOG[0].tiers;
  const t = tiers.find((x) => x === (s as TournamentTier));
  return (t ?? tiers[0]) as TournamentTier;
}
