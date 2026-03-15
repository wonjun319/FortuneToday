import type { LeagueStanding, LeagueStandingsRecord, TeamSlug } from "@/lib/types";

const TEAM_RANK_DAILY_URL = "https://www.koreabaseball.com/Record/TeamRank/TeamRankDaily.aspx";

const TEAM_RANK_NAME_TO_SLUG: Record<string, TeamSlug> = {
  KIA: "kia",
  LG: "lg",
  SSG: "ssg",
  "\uB450\uC0B0": "doosan",
  "\uC0BC\uC131": "samsung",
  "\uB86F\uB370": "lotte",
  "\uD55C\uD654": "hanwha",
  KT: "kt",
  NC: "nc",
  "\uD0A4\uC6C0": "kiwoom"
};

function formatIsoDate(compactDate: string): string {
  return `${compactDate.slice(0, 4)}-${compactDate.slice(4, 6)}-${compactDate.slice(6, 8)}`;
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

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function stripTableCell(input: string): string {
  return decodeHtmlEntities(
    input.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
  );
}

function parseTeamRankBasisDate(html: string): string {
  const match = html.match(/ChangeDatePickerValue\('(\d{8})\s*'\)/);

  if (!match) {
    throw new Error("KBO standings basis date not found");
  }

  return formatIsoDate(match[1]);
}

function parseLeagueStandingRows(html: string): string[][] {
  const tableMatch = html.match(
    /<table[^>]*summary="순위,\s*팀명,승,패,무,승률,승차,최근10경기,연속,홈,방문"[^>]*>([\s\S]*?)<\/table>/
  );

  if (!tableMatch) {
    throw new Error("KBO standings table not found");
  }

  const tbodyMatch = tableMatch[1].match(/<tbody>([\s\S]*?)<\/tbody>/);

  if (!tbodyMatch) {
    throw new Error("KBO standings table body not found");
  }

  return [...tbodyMatch[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((row) =>
    [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((cell) => stripTableCell(cell[1]))
  );
}

function parseLeagueStandings(rows: string[][]): LeagueStanding[] {
  return rows.flatMap((cells) => {
    if (cells.length < 10) {
      return [];
    }

    const team = TEAM_RANK_NAME_TO_SLUG[cells[1]];

    if (!team) {
      return [];
    }

    return [
      {
        rank: Number(cells[0]),
        team,
        games: Number(cells[2]),
        wins: Number(cells[3]),
        losses: Number(cells[4]),
        draws: Number(cells[5]),
        pct: cells[6],
        gamesBehind: cells[7],
        recent10: cells[8],
        streak: cells[9]
      }
    ];
  });
}

export async function buildLeagueStandingsFromKbo(_baseDateInput?: string): Promise<LeagueStandingsRecord> {
  const response = await fetch(TEAM_RANK_DAILY_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!response.ok) {
    throw new Error(`KBO team rank request failed with ${response.status}`);
  }

  const html = await response.text();

  return {
    updatedAt: getKstTimestamp(),
    basisDate: parseTeamRankBasisDate(html),
    standings: parseLeagueStandings(parseLeagueStandingRows(html))
  };
}
