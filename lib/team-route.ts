import type { TeamSlug } from "@/lib/types";

export const TEAM_ROUTE_SLUGS: Record<TeamSlug, string> = {
  kia: "tigers",
  lg: "twins",
  ssg: "landers",
  doosan: "bears",
  samsung: "lions",
  lotte: "giants",
  hanwha: "eagles",
  kt: "wiz",
  nc: "dinos",
  kiwoom: "heroes"
};

const ROUTE_TO_TEAM = Object.fromEntries(
  Object.entries(TEAM_ROUTE_SLUGS).map(([team, route]) => [route, team])
) as Record<string, TeamSlug>;

export function getTeamRouteSlug(team: TeamSlug) {
  return TEAM_ROUTE_SLUGS[team];
}

export function getTeamFromRouteSlug(routeSlug: string) {
  return ROUTE_TO_TEAM[routeSlug] ?? null;
}
