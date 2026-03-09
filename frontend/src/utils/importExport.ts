import * as XLSX from "xlsx";
import type { Team, TeamMember, WeekId, TournamentCategory, TournamentTier, ImportRow } from "@/types";
import { TOURNAMENT_CATALOG } from "@/constants/catalog";
import { safeUUID } from "./helpers";
import { genScores, defaultBadgesFromScores, evolPercent } from "./scoreUtils";
import { SCORE_GROUPS } from "@/constants/scoreMeta";

function coerceWeek(v: unknown): WeekId {
  const n = Number(String(v ?? "").trim());
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return 1;
}

function coerceMemberRole(v: unknown): TeamMember["role"] {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "kaptan" || s === "captain") return "Kaptan";
  return "Üye";
}

function coerceGrade(v: unknown): TeamMember["grade"] {
  const n = Number(String(v ?? "").trim());
  if (n === 9 || n === 10 || n === 11) return n;
  return 9;
}

function coerceTournamentCategory(v: unknown): TournamentCategory {
  const s = String(v ?? "").trim();
  const found = TOURNAMENT_CATALOG.find((x) => x.category === (s as TournamentCategory));
  return (found?.category ?? TOURNAMENT_CATALOG[0].category) as TournamentCategory;
}

function coerceTournamentTier(cat: TournamentCategory, v: unknown): TournamentTier {
  const s = String(v ?? "").trim();
  const found = TOURNAMENT_CATALOG.find((x) => x.category === cat);
  const tiers = found?.tiers ?? TOURNAMENT_CATALOG[0].tiers;
  const t = tiers.find((x) => x === (s as TournamentTier));
  return (t ?? tiers[0]) as TournamentTier;
}

export function parseImportRows(file: File): Promise<ImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.onload = () => {
      try {
        const data = reader.result as ArrayBuffer;
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" }) as Record<string, unknown>[];
        const rows: ImportRow[] = json.map((r) => {
          const get = (k: string) => (r as Record<string, unknown>)[k] ?? (r as Record<string, unknown>)[k.toUpperCase()] ?? (r as Record<string, unknown>)[k.toLowerCase()];
          const w = get("week");
          return {
            team_id: String(get("team_id") ?? "").trim() || undefined,
            team_name: String(get("team_name") ?? "").trim() || undefined,
            week: (typeof w === "string" || typeof w === "number") ? w : undefined,
            tournament_category: String(get("tournament_category") ?? "").trim() || undefined,
            tournament_tier: String(get("tournament_tier") ?? "").trim() || undefined,
            project_title: String(get("project_title") ?? "").trim() || undefined,
            member_school: String(get("member_school") ?? "").trim() || undefined,
            member_name: String(get("member_name") ?? "").trim() || undefined,
            member_email: String(get("member_email") ?? "").trim() || undefined,
            member_grade: (() => { const g = get("member_grade"); return (typeof g === "string" || typeof g === "number") ? g : undefined; })(),
            member_role: String(get("member_role") ?? "").trim() || undefined,
            tournament: String(get("tournament") ?? "").trim() || undefined,
            school: String(get("school") ?? "").trim() || undefined,
            project_main_category: String(get("project_main_category") ?? "").trim() || undefined,
            project_sub_category: String(get("project_sub_category") ?? "").trim() || undefined,
          };
        });
        resolve(rows);
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Dosya çözümlenemedi."));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function buildTeamsFromRows(rows: ImportRow[]): Team[] {
  const byTeam = new Map<string, { base: Partial<Team>; members: TeamMember[] }>();
  const normalizeEmail = (s: string) => (s || "").trim().toLowerCase();

  for (const row of rows) {
    const teamId = String(row.team_id ?? "").trim();
    if (!teamId) continue;

    const week = coerceWeek(row.week);
    const teamName = String(row.team_name ?? "").trim() || `Takım ${teamId}`;
    const projectTitle = String(row.project_title ?? "").trim() || "";
    const tournament = String(row.tournament ?? "").trim() || "Okul İçi Lig";
    const school = String(row.school ?? row.member_school ?? "").trim() || "";
    const projectMainCategory = String(row.project_main_category ?? "").trim() || undefined;
    const projectSubCategory = String(row.project_sub_category ?? "").trim() || undefined;

    const cat = coerceTournamentCategory(row.tournament_category ?? TOURNAMENT_CATALOG[0].category);
    const tier = coerceTournamentTier(cat, row.tournament_tier ?? "");

    const memberName = String(row.member_name ?? "").trim();
    const memberEmail = normalizeEmail(String(row.member_email ?? "").trim());

    if (!byTeam.has(teamId)) {
      byTeam.set(teamId, {
        base: {
          id: teamId,
          week,
          name: teamName,
          tournamentCategory: cat,
          tournamentTier: tier,
          projectTitle,
          tournament,
          school,
          projectMainCategory,
          projectSubCategory,
        },
        members: [],
      });
    }

    const bucket = byTeam.get(teamId)!;
    bucket.base.week = week;
    bucket.base.name = teamName;
    bucket.base.projectTitle = projectTitle;
    bucket.base.tournament = tournament;
    if (school) bucket.base.school = school;
    bucket.base.tournamentCategory = cat;
    bucket.base.tournamentTier = tier;
    bucket.base.projectMainCategory = projectMainCategory ?? bucket.base.projectMainCategory;
    bucket.base.projectSubCategory = projectSubCategory ?? bucket.base.projectSubCategory;

    if (memberName || memberEmail) {
      const role = coerceMemberRole(row.member_role);
      bucket.members.push({
        id: safeUUID(),
        name: memberName || memberEmail || "Üye",
        email: memberEmail,
        school: String(row.member_school ?? bucket.base.school ?? "").trim() || "",
        grade: coerceGrade(row.member_grade),
        role,
      });
    }
  }

  const built: Team[] = [];
  for (const [, data] of byTeam.entries()) {
    const scores = genScores((data.base.id ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0));
    let members = data.members;
    if (members.length === 0) {
      members = [{ id: safeUUID(), name: "Kaptan", email: "", school: String(data.base.school ?? "").trim(), grade: 9, role: "Kaptan" }];
    }
    if (!members.some((m) => m.role === "Kaptan")) members[0] = { ...members[0], role: "Kaptan" };

    const captain = members.find((m) => m.role === "Kaptan")?.name ?? members[0].name;
    const school = String(data.base.school ?? members[0].school ?? "").trim();

    built.push({
      id: data.base.id!,
      week: (data.base.week as WeekId) ?? 1,
      name: (data.base.name as string) ?? `Takım ${data.base.id}`,
      tournamentCategory: (data.base.tournamentCategory as TournamentCategory) ?? TOURNAMENT_CATALOG[0].category,
      tournamentTier: (data.base.tournamentTier as TournamentTier) ?? TOURNAMENT_CATALOG[0].tiers[0],
      projectTitle: (data.base.projectTitle as string) ?? "",
      captain,
      members,
      createdAtISO: new Date().toISOString(),
      badges: defaultBadgesFromScores(scores),
      scores,
      judgeNote: "",
      tournament: String(data.base.tournament ?? "Okul İçi Lig").trim() || "Okul İçi Lig",
      school,
      projectMainCategory: data.base.projectMainCategory,
      projectSubCategory: data.base.projectSubCategory,
    });
  }

  return built;
}

export function mergeOverwritePreserveScores(existing: Team, incoming: Team): Team {
  return { ...incoming, scores: existing.scores, badges: existing.badges, judgeNote: existing.judgeNote, createdAtISO: existing.createdAtISO };
}

export function exportTeamsToCsv(teams: Team[]): string {
  const header = [
    "team_id", "team_name", "week", "tournament_category", "tournament_tier", "project_title",
    "member_school", "member_name", "member_email", "member_grade", "member_role",
    "tournament", "school", "project_main_category", "project_sub_category", "evol_score_pct"
  ];
  
  SCORE_GROUPS.forEach(g => {
    g.items.forEach(it => {
      header.push(`score_${it.key}`);
    });
  });

  const rows: string[] = [header.join(",")];

  teams.forEach(t => {
    const pct = evolPercent(t.scores);
    t.members.forEach(m => {
      const rowData = [
        t.id, `"${t.name.replace(/"/g, '""')}"`, t.week, `"${t.tournamentCategory}"`, `"${t.tournamentTier}"`,
        `"${(t.projectTitle||"").replace(/"/g, '""')}"`, `"${m.school}"`, `"${m.name}"`, `"${m.email}"`,
        m.grade, `"${m.role}"`, `"${t.tournament}"`, `"${t.school}"`,
        `"${t.projectMainCategory || ""}"`, `"${t.projectSubCategory || ""}"`, pct
      ];
      
      SCORE_GROUPS.forEach(g => {
        g.items.forEach(it => {
          rowData.push(String(t.scores[it.key]));
        });
      });

      rows.push(rowData.join(","));
    });
  });

  return rows.join("\n");
}
