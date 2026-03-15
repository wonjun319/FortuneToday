import test from "node:test";
import { strict as assert } from "node:assert";
import { parseGamesForTeam } from "../lib/kbo";

test("parseGamesForTeam filters finished games and enriches highlights", async () => {
  const games = [
    {
      LE_ID: 1,
      SR_ID: 0,
      SEASON_ID: 2025,
      G_ID: "20250930LTHH0",
      G_DT: "20250930",
      S_NM: "Daejeon",
      AWAY_ID: "LT",
      HOME_ID: "HH",
      AWAY_NM: "Lotte",
      HOME_NM: "Hanwha",
      W_PIT_P_NM: "Kim Seo-hyun",
      L_PIT_P_NM: "Kim Won-jung",
      SV_PIT_P_NM: "",
      GAME_STATE_SC: "3",
      CANCEL_SC_NM: "정상경기",
      T_SCORE_CN: "0",
      B_SCORE_CN: "1"
    },
    {
      LE_ID: 1,
      SR_ID: 0,
      SEASON_ID: 2025,
      G_ID: "20250929SKHH0",
      G_DT: "20250929",
      S_NM: "Daejeon",
      AWAY_ID: "SK",
      HOME_ID: "HH",
      AWAY_NM: "SSG",
      HOME_NM: "Hanwha",
      W_PIT_P_NM: "",
      L_PIT_P_NM: "",
      SV_PIT_P_NM: "",
      GAME_STATE_SC: "1",
      CANCEL_SC_NM: "정상경기",
      T_SCORE_CN: null,
      B_SCORE_CN: null
    },
    {
      LE_ID: 1,
      SR_ID: 0,
      SEASON_ID: 2025,
      G_ID: "20250927HHLG0",
      G_DT: "20250927",
      S_NM: "Jamsil",
      AWAY_ID: "HH",
      HOME_ID: "LG",
      AWAY_NM: "Hanwha",
      HOME_NM: "LG",
      W_PIT_P_NM: "Moon Dong-ju",
      L_PIT_P_NM: "Im Chan-gyu",
      SV_PIT_P_NM: "Kim Seo-hyun",
      GAME_STATE_SC: "3",
      CANCEL_SC_NM: "정상경기",
      T_SCORE_CN: "4",
      B_SCORE_CN: "2"
    }
  ];

  const parsed = await parseGamesForTeam(games, "HH", async (gameId) => ({
    hitter: { name: `Hitter ${gameId}`, stat: "2H 1RBI", rank: 1 },
    pitcher: { name: `Pitcher ${gameId}`, stat: "6IP 1ER", rank: 1 }
  }));

  assert.deepEqual(parsed, [
    {
      date: "2025-09-30",
      result: "W",
      opponent: "Lotte",
      homeAway: "home",
      score: "1-0",
      stadium: "Daejeon",
      winningPitcher: "Kim Seo-hyun",
      losingPitcher: "Kim Won-jung",
      savePitcher: "",
      gameId: "20250930LTHH0",
      standoutHitter: { name: "Hitter 20250930LTHH0", stat: "2H 1RBI", rank: 1 },
      standoutPitcher: { name: "Pitcher 20250930LTHH0", stat: "6IP 1ER", rank: 1 }
    },
    {
      date: "2025-09-27",
      result: "W",
      opponent: "LG",
      homeAway: "away",
      score: "4-2",
      stadium: "Jamsil",
      winningPitcher: "Moon Dong-ju",
      losingPitcher: "Im Chan-gyu",
      savePitcher: "Kim Seo-hyun",
      gameId: "20250927HHLG0",
      standoutHitter: { name: "Hitter 20250927HHLG0", stat: "2H 1RBI", rank: 1 },
      standoutPitcher: { name: "Pitcher 20250927HHLG0", stat: "6IP 1ER", rank: 1 }
    }
  ]);
});
