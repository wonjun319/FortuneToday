import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createAccessToken, getUrlTokenTtlMinutes } from "@/lib/access";
import { isTeamSlug } from "@/lib/data";
import { getTeamFromRouteSlug, getTeamRouteSlug } from "@/lib/team-route";

function loadEnvFile(filename: string) {
  const filePath = join(process.cwd(), filename);

  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadLocalEnv() {
  loadEnvFile(".env");
  loadEnvFile(".env.local");
}

async function main() {
  loadLocalEnv();
  const input = process.argv[2]?.toLowerCase();
  const team = input ? getTeamFromRouteSlug(input) ?? input : undefined;

  if (!team || !isTeamSlug(team)) {
    console.error("Usage: npm run token -- <team-slug|route-slug>");
    process.exit(1);
  }

  const token = await createAccessToken(team);
  const baseUrl = process.env.LMD_BASE_URL?.trim() || "http://localhost:3000";

  console.log(`Team: ${team}`);
  console.log(`Route: ${getTeamRouteSlug(team)}`);
  console.log(`TTL minutes: ${getUrlTokenTtlMinutes()}`);
  console.log(`Token: ${token}`);
  console.log(`URL: ${baseUrl}/t/${token}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
