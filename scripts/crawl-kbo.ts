import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildMatchupRecordFromKbo, buildTeamRecordFromKbo, TEAM_META } from "../lib/kbo";
import { TEAM_SLUGS } from "../lib/types";

function getCurrentKstDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

async function main() {
  const baseDate = process.env.CRAWL_BASE_DATE ?? getCurrentKstDateString();
  mkdirSync(join(process.cwd(), "data", "matchups"), { recursive: true });

  for (const slug of TEAM_SLUGS) {
    const record = await buildTeamRecordFromKbo(slug, baseDate);
    const matchup = await buildMatchupRecordFromKbo(slug, baseDate);
    const path = join(process.cwd(), "data", "teams", `${slug}.json`);
    const matchupPath = join(process.cwd(), "data", "matchups", `${slug}.json`);
    writeFileSync(path, JSON.stringify(record, null, 2), "utf8");
    writeFileSync(matchupPath, JSON.stringify(matchup, null, 2), "utf8");
    console.log(`Updated ${slug} (${TEAM_META[slug].code})${baseDate ? ` from ${baseDate}` : ""}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
