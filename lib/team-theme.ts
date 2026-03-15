import type { TeamSlug } from "@/lib/types";

export const TEAM_BACKGROUND_COLORS: Record<TeamSlug, string> = {
  doosan: "#1A1748",
  lg: "#C30452",
  ssg: "#CE0E2D",
  kiwoom: "#570514",
  kt: "#000000",
  hanwha: "#FC4E00",
  kia: "#EA0029",
  samsung: "#074CA1",
  lotte: "#041E42",
  nc: "#315288"
};

export function getTeamBackgroundColor(team: TeamSlug) {
  return TEAM_BACKGROUND_COLORS[team];
}
