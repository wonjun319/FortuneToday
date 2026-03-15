import { notFound } from "next/navigation";
import { buildFortune } from "@/lib/fortune";
import { getLeagueStandingsRecord, getTeamMatchupRecord, getTeamRecord } from "@/lib/data";
import { TeamExperience } from "@/app/team/[team]/team-experience";
import { getDisplayNameFromTeamName } from "@/lib/team-display";
import { getTeamFromRouteSlug } from "@/lib/team-route";
import { getTeamBackgroundColor } from "@/lib/team-theme";
import { getTeamVisuals } from "@/lib/team-visuals";

export const dynamic = "force-dynamic";

export default async function TeamPage({
  params
}: {
  params: Promise<{ team: string }>;
}) {
  const { team } = await params;
  const slug = getTeamFromRouteSlug(team.toLowerCase());

  if (!slug) {
    notFound();
  }

  const record = getTeamRecord(slug);
  const matchup = getTeamMatchupRecord(slug);
  const leagueStandings = getLeagueStandingsRecord();
  const visuals = getTeamVisuals(slug);

  if (!record) {
    notFound();
  }

  const fortune = buildFortune(record, matchup);
  const wins = record.last10.filter((game) => game.result === "W").length;
  const losses = record.last10.filter((game) => game.result === "L").length;
  const draws = record.last10.filter((game) => game.result === "D").length;

  return (
    <TeamExperience
      teamName={getDisplayNameFromTeamName(record.team)}
      teamSlug={slug}
      teamColor={getTeamBackgroundColor(slug)}
      introImageSrc={visuals.introImageSrc}
      loadingImageSrc={visuals.loadingImageSrc}
      fortune={fortune}
      leagueStandings={leagueStandings}
      summary={{
        wins,
        losses,
        draws
      }}
      matchupSummary={
        matchup?.opponent
          ? {
              opponent: getDisplayNameFromTeamName(matchup.opponent),
              wins: matchup.summary.wins,
              losses: matchup.summary.losses,
              draws: matchup.summary.draws
            }
          : null
      }
      games={record.last10}
    />
  );
}
