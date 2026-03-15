import type { TeamSlug } from "@/lib/types";

const TEAM_DISPLAY_NAMES: Record<TeamSlug, string> = {
  hanwha: "대전독수리",
  kia: "광주호랑이",
  lg: "서울쌍둥이",
  doosan: "서울곰",
  samsung: "대구사자",
  lotte: "부산갈매기",
  ssg: "인천상륙자",
  kt: "수원마법사",
  nc: "창원공룡",
  kiwoom: "서울영웅"
};

const TEAM_NAME_ALIASES: Record<string, TeamSlug> = {
  "KIA Tigers": "kia",
  KIA: "kia",
  기아: "kia",
  "LG Twins": "lg",
  LG: "lg",
  엘지: "lg",
  "SSG Landers": "ssg",
  SSG: "ssg",
  "Doosan Bears": "doosan",
  Doosan: "doosan",
  두산: "doosan",
  "Samsung Lions": "samsung",
  Samsung: "samsung",
  삼성: "samsung",
  "Lotte Giants": "lotte",
  Lotte: "lotte",
  롯데: "lotte",
  "Hanwha Eagles": "hanwha",
  Hanwha: "hanwha",
  한화: "hanwha",
  "KT Wiz": "kt",
  KT: "kt",
  kt: "kt",
  "NC Dinos": "nc",
  NC: "nc",
  엔씨: "nc",
  "Kiwoom Heroes": "kiwoom",
  Kiwoom: "kiwoom",
  키움: "kiwoom"
};

export function getTeamDisplayName(slug: TeamSlug) {
  return TEAM_DISPLAY_NAMES[slug];
}

export function getDisplayNameFromTeamName(name: string) {
  const slug = TEAM_NAME_ALIASES[name];
  return slug ? TEAM_DISPLAY_NAMES[slug] : name;
}
