export const TEAM_SLUGS = [
  "kia",
  "lg",
  "ssg",
  "doosan",
  "samsung",
  "lotte",
  "hanwha",
  "kt",
  "nc",
  "kiwoom"
] as const;

export type TeamSlug = (typeof TEAM_SLUGS)[number];
export type MatchResult = "W" | "L" | "D";
export type HomeAway = "home" | "away";
export type PlayerHighlight = {
  name: string;
  stat: string;
  rank: number;
};
export type MatchRecord = {
  date: string;
  result: MatchResult;
  opponent: string;
  homeAway: HomeAway;
  score: string;
  stadium: string;
  winningPitcher: string;
  losingPitcher: string;
  savePitcher: string;
  gameId: string;
  standoutHitter: PlayerHighlight | null;
  standoutPitcher: PlayerHighlight | null;
};

export type TeamRecord = {
  team: string;
  slug: TeamSlug;
  updatedAt: string;
  last10: MatchRecord[];
};

export type MatchupRecord = {
  team: string;
  slug: TeamSlug;
  updatedAt: string;
  gameDate: string | null;
  opponent: string | null;
  opponentSlug: TeamSlug | null;
  last10: MatchRecord[];
  summary: {
    wins: number;
    losses: number;
    draws: number;
  };
};

export type TokenMap = Record<string, TeamSlug>;
