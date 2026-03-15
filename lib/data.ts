import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { LeagueStandingsRecord, MatchupRecord, TeamRecord, TeamSlug } from "@/lib/types";
import { TEAM_SLUGS } from "@/lib/types";

export function isTeamSlug(v: string): v is TeamSlug {
  return TEAM_SLUGS.includes(v as TeamSlug);
}

export function getTeamRecord(team: TeamSlug): TeamRecord | null {
  try {
    const raw = readFileSync(join(process.cwd(), "data", "teams", `${team}.json`), "utf8");
    return JSON.parse(raw) as TeamRecord;
  } catch {
    return null;
  }
}

export function getTeamMatchupRecord(team: TeamSlug): MatchupRecord | null {
  try {
    const raw = readFileSync(join(process.cwd(), "data", "matchups", `${team}.json`), "utf8");
    return JSON.parse(raw) as MatchupRecord;
  } catch {
    return null;
  }
}

export function getLeagueStandingsRecord(): LeagueStandingsRecord | null {
  try {
    const raw = readFileSync(join(process.cwd(), "data", "standings", "daily.json"), "utf8");
    return JSON.parse(raw) as LeagueStandingsRecord;
  } catch {
    return null;
  }
}
