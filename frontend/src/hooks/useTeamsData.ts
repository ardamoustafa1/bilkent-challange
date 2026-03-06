import { useEffect, useMemo, useState } from "react";
import type { Team } from "@/types";
import { makeDemoTeams } from "@/data/seed";
import { api } from "@/services/api";
import { buildScoreBins, BarajCounts, sortByScoreDesc } from "@/utils/scoreUtils";
import { LS_TEAMS } from "@/constants/demo";

function readStoredTeams(): Team[] | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_TEAMS) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Team[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredTeams(teams: Team[]) {
  try {
    localStorage.setItem(LS_TEAMS, JSON.stringify(teams));
  } catch {}
}

export function useTeamsData(session: { email: string } | null) {
  const [teams, setTeams] = useState<Team[]>(() => readStoredTeams() ?? makeDemoTeams());
  const [apiAvailable, setApiAvailable] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(true);

  const [dashTournament, setDashTournament] = useState("all");
  const [dashSchool, setDashSchool] = useState("all");
  const [teamsTournament, setTeamsTournament] = useState("all");
  const [teamsSchool, setTeamsSchool] = useState("all");
  const [teamsWeek, setTeamsWeek] = useState("all");
  const [teamsSearch, setTeamsSearch] = useState("");
  const [mainCat, setMainCat] = useState("all");
  const [subCat, setSubCat] = useState("all");

  useEffect(() => {
    const token = api.getStoredToken();
    if (!token && !session) {
      setTeamsLoading(false);
      return;
    }
    setTeamsLoading(true);
    api.getTeams()
      .then((data) => { setTeams(data); setApiAvailable(true); })
      .catch(() => { setTeams(readStoredTeams() ?? makeDemoTeams()); setApiAvailable(false); })
      .finally(() => setTeamsLoading(false));
  }, [session]);

  useEffect(() => {
    if (!apiAvailable) writeStoredTeams(teams);
  }, [teams, apiAvailable]);

  const tournaments = useMemo(() => Array.from(new Set(teams.map((t) => t.tournament).filter(Boolean))).sort(), [teams]);
  const schools = useMemo(() => Array.from(new Set(teams.map((t) => t.school).filter(Boolean))).sort(), [teams]);

  const dashFiltered = useMemo(() =>
    teams
      .filter((t) => (dashTournament === "all" ? true : t.tournament === dashTournament))
      .filter((t) => (dashSchool === "all" ? true : t.school === dashSchool)),
  [teams, dashTournament, dashSchool]);

  const sortedDash = useMemo(() => [...dashFiltered].sort(sortByScoreDesc), [dashFiltered]);
  const playoff = useMemo(() => sortedDash.slice(0, 8), [sortedDash]);
  const finalFour = useMemo(() => sortedDash.slice(0, 4), [sortedDash]);
  const baraj = useMemo(() => BarajCounts(dashFiltered), [dashFiltered]);
  const bins = useMemo(() => buildScoreBins(dashFiltered), [dashFiltered]);

  const teamsFiltered = useMemo(() => {
    const q = teamsSearch.trim().toLowerCase();
    return teams
      .filter((t) => (teamsTournament === "all" ? true : t.tournament === teamsTournament))
      .filter((t) => (teamsSchool === "all" ? true : t.school === teamsSchool))
      .filter((t) => (teamsWeek === "all" ? true : String(t.week) === teamsWeek))
      .filter((t) => (mainCat === "all" ? true : t.projectMainCategory === mainCat))
      .filter((t) => (subCat === "all" ? true : t.projectSubCategory === subCat))
      .filter((t) => {
        if (!q) return true;
        const hay = `${t.name} ${t.captain} ${t.projectTitle} ${t.school} ${t.tournament} ${t.projectMainCategory ?? ""} ${t.projectSubCategory ?? ""} ${t.tournamentCategory} ${t.tournamentTier}`.toLowerCase();
        return hay.includes(q);
      })
      .sort(sortByScoreDesc);
  }, [teams, teamsTournament, teamsSchool, teamsWeek, mainCat, subCat, teamsSearch]);

  return {
    teams,
    setTeams,
    apiAvailable,
    teamsLoading,
    tournaments,
    schools,
    dashFiltered,
    sortedDash,
    playoff,
    finalFour,
    baraj,
    bins,
    teamsFiltered,
    dashTournament,
    setDashTournament,
    dashSchool,
    setDashSchool,
    teamsTournament,
    setTeamsTournament,
    teamsSchool,
    setTeamsSchool,
    teamsWeek,
    setTeamsWeek,
    teamsSearch,
    setTeamsSearch,
    mainCat,
    setMainCat,
    subCat,
    setSubCat,
  };
}
