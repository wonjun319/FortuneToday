import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildMatchupRecordFromKbo, buildTeamRecordFromKbo, TEAM_META } from "../lib/kbo";
import { TEAM_SLUGS } from "../lib/types";

async function main() {
  const baseDate = process.env.CRAWL_BASE_DATE;
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
