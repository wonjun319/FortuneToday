import test from "node:test";
import { strict as assert } from "node:assert";
import { buildFortune } from "../lib/fortune";
import type { MatchupRecord, TeamRecord } from "../lib/types";

const sampleRecord: TeamRecord = {
  team: "KIA Tigers",
  slug: "kia",
  updatedAt: "2026-03-04T00:00:00+09:00",
  last10: [
    { date: "2026-03-04", result: "W", opponent: "LG", homeAway: "home", score: "5-2", stadium: "Gwangju", winningPitcher: "A", losingPitcher: "B", savePitcher: "", gameId: "1", standoutHitter: { name: "Kim", stat: "3H", rank: 1 }, standoutPitcher: { name: "Yang", stat: "6IP", rank: 1 } },
    { date: "2026-03-03", result: "W", opponent: "LG", homeAway: "home", score: "6-3", stadium: "Gwangju", winningPitcher: "A", losingPitcher: "B", savePitcher: "", gameId: "2", standoutHitter: { name: "Kim", stat: "2H", rank: 1 }, standoutPitcher: { name: "Yang", stat: "7IP", rank: 1 } },
    { date: "2026-03-02", result: "W", opponent: "SSG", homeAway: "away", score: "4-3", stadium: "Munhak", winningPitcher: "A", losingPitcher: "B", savePitcher: "", gameId: "3", standoutHitter: null, standoutPitcher: null },
    { date: "2026-03-01", result: "W", opponent: "Samsung", homeAway: "home", score: "4-1", stadium: "Gwangju", winningPitcher: "A", losingPitcher: "B", savePitcher: "", gameId: "4", standoutHitter: null, standoutPitcher: null },
    { date: "2026-02-28", result: "L", opponent: "Lotte", homeAway: "away", score: "1-2", stadium: "Sajik", winningPitcher: "A", losingPitcher: "B", savePitcher: "", gameId: "5", standoutHitter: null, standoutPitcher: null },
    { date: "2026-02-27", result: "W", opponent: "Hanwha", homeAway: "home", score: "7-6", stadium: "Gwangju", winningPitcher: "A", losingPitcher: "B", savePitcher: "", gameId: "6", standoutHitter: null, standoutPitcher: null },
    { date: "2026-02-26", result: "W", opponent: "Doosan", homeAway: "away", score: "3-2", stadium: "Jamsil", winningPitcher: "A", losingPitcher: "B", savePitcher: "", gameId: "7", standoutHitter: null, standoutPitcher: null },
    { date: "2026-02-25", result: "L", opponent: "NC", homeAway: "home", score: "0-1", stadium: "Gwangju", winningPitcher: "A", losingPitcher: "B", savePitcher: "", gameId: "8", standoutHitter: null, standoutPitcher: null },
    { date: "2026-02-24", result: "W", opponent: "KT", homeAway: "away", score: "9-4", stadium: "Suwon", winningPitcher: "A", losingPitcher: "B", savePitcher: "", gameId: "9", standoutHitter: null, standoutPitcher: null },
    { date: "2026-02-23", result: "W", opponent: "Kiwoom", homeAway: "home", score: "6-5", stadium: "Gwangju", winningPitcher: "A", losingPitcher: "B", savePitcher: "", gameId: "10", standoutHitter: null, standoutPitcher: null }
  ]
};

const sampleMatchup: MatchupRecord = {
  team: "KIA Tigers",
  slug: "kia",
  updatedAt: "2026-03-04T00:00:00+09:00",
  gameDate: "2026-03-04",
  opponent: "LG",
  opponentSlug: "lg",
  last10: sampleRecord.last10.slice(0, 4),
  summary: { wins: 3, losses: 1, draws: 0 }
};

test("buildFortune uses multiline copy and hides direct recent-five phrasing", () => {
  const fortune = buildFortune(sampleRecord, sampleMatchup, "2026-03-04");

  assert.match(fortune, /최근 4연승/);
  assert.match(fortune, /오늘의 키플레이어는 Kim입니다\./);
  assert.doesNotMatch(fortune, /최근 5경기/);
  assert.ok(fortune.split("\n").length >= 5);
});

test("buildFortune stays fixed within a day and changes on a different day", () => {
  const first = buildFortune(sampleRecord, sampleMatchup, "2026-03-04");
  const second = buildFortune(sampleRecord, sampleMatchup, "2026-03-04");
  const third = buildFortune(sampleRecord, sampleMatchup, "2026-03-05");

  assert.equal(first, second);
  assert.notEqual(first, third);
});
