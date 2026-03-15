import type {
  LeagueStanding,
  LeagueStandingsRecord,
  MatchRecord,
  MatchResult,
  MatchupRecord,
  PlayerHighlight,
  TeamRecord,
  TeamSlug
} from "@/lib/types";

type TeamMeta = {
  code: string;
  name: string;
};

type KboGame = {
  LE_ID: number;
  SR_ID: number;
  SEASON_ID: number;
  G_ID: string;
  G_DT: string;
  S_NM: string;
  AWAY_ID: string;
  HOME_ID: string;
  AWAY_NM: string;
  HOME_NM: string;
  W_PIT_P_NM: string;
  L_PIT_P_NM: string;
  SV_PIT_P_NM: string;
  GAME_STATE_SC: string;
  CANCEL_SC_NM: string;
  T_SCORE_CN: string | null;
  B_SCORE_CN: string | null;
};

type GameListResponse = {
  game: KboGame[];
  code: string;
  msg: string;
};

type KeyPlayerEntry = {
  RANK_NO: number;
  P_NM: string;
  T_ID: string;
  RECORD_IF: string;
};

type KeyPlayerResponse = {
  record: KeyPlayerEntry[];
  code: string;
  msg: string;
};

type CandidateGame = MatchRecord & {
  leId: number;
  srId: number;
};

type TeamPairing = {
  opponent: string;
  opponentCode: string;
  opponentSlug: TeamSlug | null;
};

const GAME_LIST_URL = "https://www.koreabaseball.com/ws/Main.asmx/GetKboGameList";
const KEY_HITTER_URL = "https://www.koreabaseball.com/ws/Schedule.asmx/GetKeyPlayerHitter";
const KEY_PITCHER_URL = "https://www.koreabaseball.com/ws/Schedule.asmx/GetKeyPlayerPitcher";
const TEAM_RANK_DAILY_URL = "https://www.koreabaseball.com/Record/TeamRank/TeamRankDaily.aspx";
const GAMECENTER_SERIES_IDS = "0,1,3,4,5,6,7,8,9";
const REGULAR_LEAGUE_ID = "1";
const LAST10_LIMIT = 10;
const MAX_DAY_LOOKBACK = 160;
const MAX_MATCHUP_LOOKBACK = 365;

const gameListCache = new Map<string, Promise<GameListResponse>>();
const keyPlayerCache = new Map<string, Promise<{ hitter: PlayerHighlight | null; pitcher: PlayerHighlight | null }>>();

export const TEAM_META: Record<TeamSlug, TeamMeta> = {
  kia: { code: "HT", name: "KIA Tigers" },
  lg: { code: "LG", name: "LG Twins" },
  ssg: { code: "SK", name: "SSG Landers" },
  doosan: { code: "OB", name: "Doosan Bears" },
  samsung: { code: "SS", name: "Samsung Lions" },
  lotte: { code: "LT", name: "Lotte Giants" },
  hanwha: { code: "HH", name: "Hanwha Eagles" },
  kt: { code: "KT", name: "KT Wiz" },
  nc: { code: "NC", name: "NC Dinos" },
  kiwoom: { code: "WO", name: "Kiwoom Heroes" }
};

const TEAM_CODE_TO_SLUG = Object.fromEntries(
  Object.entries(TEAM_META).map(([slug, meta]) => [meta.code, slug as TeamSlug])
) as Record<string, TeamSlug>;

const TEAM_RANK_NAME_TO_SLUG: Record<string, TeamSlug> = {
  KIA: "kia",
  LG: "lg",
  SSG: "ssg",
  두산: "doosan",
  삼성: "samsung",
  롯데: "lotte",
  한화: "hanwha",
  KT: "kt",
  NC: "nc",
  키움: "kiwoom"
};

function formatCompactDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .format(date)
    .replace(/-/g, "");
}

function formatIsoDate(compactDate: string): string {
  return `${compactDate.slice(0, 4)}-${compactDate.slice(4, 6)}-${compactDate.slice(6, 8)}`;
}

function parseScore(value: string | null): number | null {
  if (value === null || value === "") {
    return null;
  }

  const score = Number(value);
  return Number.isFinite(score) ? score : null;
}

function isFinishedRegularGame(game: KboGame): boolean {
  return game.GAME_STATE_SC === "3" && game.CANCEL_SC_NM === "정상경기";
}

function getCurrentKstDate(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const pick = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return new Date(Date.UTC(pick("year"), pick("month") - 1, pick("day")));
}

function getKstTimestamp(): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).formatToParts(new Date());

  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${pick("year")}-${pick("month")}-${pick("day")}T${pick("hour")}:${pick("minute")}:${pick("second")}+09:00`;
}

function parseBaseDate(input?: string): Date {
  if (!input) {
    return getCurrentKstDate();
  }

  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    throw new Error(`Invalid base date: ${input}. Expected YYYY-MM-DD.`);
  }

  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function stripHtml(input: string): string {
  return input.replace(/<br\s*\/?>/gi, " / ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function toPlayerHighlight(entry: KeyPlayerEntry | null): PlayerHighlight | null {
  if (!entry) {
    return null;
  }

  return {
    name: entry.P_NM.trim(),
    stat: stripHtml(entry.RECORD_IF),
    rank: entry.RANK_NO
  };
}

async function fetchKeyPlayerEntries(
  url: string,
  params: Record<string, string>
): Promise<KeyPlayerEntry[]> {
  const body = new URLSearchParams(params);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`KBO key player request failed with ${response.status}`);
  }

  const payload = (await response.json()) as KeyPlayerResponse;
  return payload.record ?? [];
}

async function pickTopPlayer(
  url: string,
  baseParams: { leId: number; srId: number; gameId: string; sort: "ASC" | "DESC" },
  groups: string[],
  teamCode: string
): Promise<PlayerHighlight | null> {
  for (const groupSc of groups) {
    const records = await fetchKeyPlayerEntries(url, {
      leId: String(baseParams.leId),
      srId: String(baseParams.srId),
      gameId: baseParams.gameId,
      groupSc,
      sort: baseParams.sort
    });
    const match = records.find((record) => record.T_ID === teamCode);

    if (match) {
      return toPlayerHighlight(match);
    }
  }

  return null;
}

async function fetchGameHighlights(
  gameId: string,
  leId: number,
  srId: number,
  teamCode: string
): Promise<{ hitter: PlayerHighlight | null; pitcher: PlayerHighlight | null }> {
  const cacheKey = `${gameId}:${teamCode}`;
  const cached = keyPlayerCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const promise = Promise.all([
    pickTopPlayer(
      KEY_HITTER_URL,
      { leId, srId, gameId, sort: "DESC" },
      ["GAME_WPA_RT", "RBI_CN", "HIT_CN", "OPS_RT"],
      teamCode
    ),
    pickTopPlayer(
      KEY_PITCHER_URL,
      { leId, srId, gameId, sort: "DESC" },
      ["WPA_RT", "KK_CN", "INN2_CN"],
      teamCode
    )
  ]).then(([hitter, pitcher]) => ({ hitter, pitcher }));

  keyPlayerCache.set(cacheKey, promise);
  return promise;
}

function buildTeamPairing(game: KboGame, teamCode: string): TeamPairing | null {
  const isAway = game.AWAY_ID === teamCode;
  const isHome = game.HOME_ID === teamCode;

  if (!isAway && !isHome) {
    return null;
  }

  const opponentCode = isAway ? game.HOME_ID : game.AWAY_ID;
  return {
    opponent: isAway ? game.HOME_NM : game.AWAY_NM,
    opponentCode,
    opponentSlug: TEAM_CODE_TO_SLUG[opponentCode] ?? null
  };
}

type HighlightFetcher = (
  gameId: string,
  leId: number,
  srId: number,
  teamCode: string
) => Promise<{ hitter: PlayerHighlight | null; pitcher: PlayerHighlight | null }>;

async function toMatchRecord(
  game: KboGame,
  teamCode: string,
  highlightFetcher: HighlightFetcher
): Promise<CandidateGame | null> {
  if (!isFinishedRegularGame(game)) {
    return null;
  }

  const pairing = buildTeamPairing(game, teamCode);

  if (!pairing) {
    return null;
  }

  const isAway = game.AWAY_ID === teamCode;
  const awayScore = parseScore(game.T_SCORE_CN);
  const homeScore = parseScore(game.B_SCORE_CN);

  if (awayScore === null || homeScore === null) {
    return null;
  }

  let result: MatchResult;

  if (awayScore === homeScore) {
    result = "D";
  } else {
    const didAwayWin = awayScore > homeScore;
    result = isAway ? (didAwayWin ? "W" : "L") : didAwayWin ? "L" : "W";
  }

  const highlights = await highlightFetcher(game.G_ID, game.LE_ID, game.SR_ID, teamCode);

  return {
    date: formatIsoDate(game.G_DT),
    result,
    opponent: pairing.opponent,
    homeAway: isAway ? "away" : "home",
    score: isAway ? `${awayScore}-${homeScore}` : `${homeScore}-${awayScore}`,
    stadium: game.S_NM,
    winningPitcher: game.W_PIT_P_NM.trim(),
    losingPitcher: game.L_PIT_P_NM.trim(),
    savePitcher: game.SV_PIT_P_NM.trim(),
    gameId: game.G_ID,
    standoutHitter: highlights.hitter,
    standoutPitcher: highlights.pitcher,
    leId: game.LE_ID,
    srId: game.SR_ID
  };
}

export async function parseGamesForTeam(
  games: KboGame[],
  teamCode: string,
  highlightFetcher: HighlightFetcher = fetchGameHighlights
): Promise<MatchRecord[]> {
  const records = await Promise.all(games.map((game) => toMatchRecord(game, teamCode, highlightFetcher)));
  return records
    .filter((record): record is CandidateGame => record !== null)
    .map(({ leId: _leId, srId: _srId, ...record }) => record);
}

export async function fetchGameListByDate(compactDate: string): Promise<GameListResponse> {
  const cached = gameListCache.get(compactDate);

  if (cached) {
    return cached;
  }

  const body = new URLSearchParams({
    leId: REGULAR_LEAGUE_ID,
    srId: GAMECENTER_SERIES_IDS,
    date: compactDate
  });

  const promise = fetch(GAME_LIST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: body.toString()
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`KBO game list request failed with ${response.status}`);
    }

    return (await response.json()) as GameListResponse;
  });

  gameListCache.set(compactDate, promise);
  return promise;
}

function sortMatchRecords<T extends MatchRecord>(games: T[]): T[] {
  return [...games].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    return dateCompare !== 0 ? dateCompare : b.gameId.localeCompare(a.gameId);
  });
}

function summarizeResults(games: MatchRecord[]) {
  return games.reduce(
    (summary, game) => {
      if (game.result === "W") {
        summary.wins += 1;
      } else if (game.result === "L") {
        summary.losses += 1;
      } else {
        summary.draws += 1;
      }

      return summary;
    },
    { wins: 0, losses: 0, draws: 0 }
  );
}

async function collectRecentGames(
  teamCode: string,
  baseDate: Date,
  limit: number,
  lookback: number,
  filter?: (game: KboGame) => boolean
): Promise<MatchRecord[]> {
  const collected: MatchRecord[] = [];

  for (let offset = 0; offset < lookback && collected.length < limit; offset += 1) {
    const date = new Date(baseDate);
    date.setUTCDate(baseDate.getUTCDate() - offset);
    const compactDate = formatCompactDate(date);
    const response = await fetchGameListByDate(compactDate);
    const scopedGames = filter ? response.game.filter(filter) : response.game;
    const parsed = await parseGamesForTeam(scopedGames, teamCode);
    collected.push(...parsed);
  }

  return sortMatchRecords(collected).slice(0, limit);
}

function findTodayOpponent(games: KboGame[], teamCode: string): TeamPairing | null {
  const game = games.find((candidate) => buildTeamPairing(candidate, teamCode) !== null);
  return game ? buildTeamPairing(game, teamCode) : null;
}

export async function buildTeamRecordFromKbo(slug: TeamSlug, baseDateInput?: string): Promise<TeamRecord> {
  const team = TEAM_META[slug];
  const baseDate = parseBaseDate(baseDateInput);
  const last10 = await collectRecentGames(team.code, baseDate, LAST10_LIMIT, MAX_DAY_LOOKBACK);

  return {
    team: team.name,
    slug,
    updatedAt: getKstTimestamp(),
    last10
  };
}

export async function buildMatchupRecordFromKbo(slug: TeamSlug, baseDateInput?: string): Promise<MatchupRecord> {
  const team = TEAM_META[slug];
  const baseDate = parseBaseDate(baseDateInput);
  const baseCompactDate = formatCompactDate(baseDate);
  const todayGames = (await fetchGameListByDate(baseCompactDate)).game;
  const pairing = findTodayOpponent(todayGames, team.code);

  if (!pairing) {
    return {
      team: team.name,
      slug,
      updatedAt: getKstTimestamp(),
      gameDate: formatIsoDate(baseCompactDate),
      opponent: null,
      opponentSlug: null,
      last10: [],
      summary: { wins: 0, losses: 0, draws: 0 }
    };
  }

  const matchupGames = await collectRecentGames(
    team.code,
    baseDate,
    LAST10_LIMIT,
    MAX_MATCHUP_LOOKBACK,
    (game) => {
      const teamCodes = [game.AWAY_ID, game.HOME_ID];
      return teamCodes.includes(team.code) && teamCodes.includes(pairing.opponentCode);
    }
  );

  return {
    team: team.name,
    slug,
    updatedAt: getKstTimestamp(),
    gameDate: formatIsoDate(baseCompactDate),
    opponent: pairing.opponent,
    opponentSlug: pairing.opponentSlug,
    last10: matchupGames,
    summary: summarizeResults(matchupGames)
  };
}
