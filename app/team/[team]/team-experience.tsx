"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { startTransition, useEffect, useState } from "react";
import type { FortuneScores, KeyPlayerSummary } from "@/lib/fortune";
import { getDisplayNameFromTeamName, getTeamDisplayName } from "@/lib/team-display";
import type { LeagueStandingsRecord, MatchRecord, TeamSlug } from "@/lib/types";

type TeamExperienceProps = {
  teamName: string;
  teamSlug: TeamSlug;
  teamColor: string;
  introImageSrc: string | null;
  loadingImageSrc: string | null;
  fortune: string;
  fortuneHeadline: string;
  fortuneScores: FortuneScores;
  keyPlayer: KeyPlayerSummary;
  leagueStandings: LeagueStandingsRecord | null;
  summary: {
    wins: number;
    losses: number;
    draws: number;
  };
  matchupSummary: {
    opponent: string;
    wins: number;
    losses: number;
    draws: number;
  } | null;
  games: MatchRecord[];
};

type ViewState = "intro" | "loading" | "result";

function getResultLabel(result: "W" | "L" | "D") {
  if (result === "W") {
    return "승";
  }

  if (result === "L") {
    return "패";
  }

  return "무";
}

function getOpponentLabel(game: MatchRecord) {
  const prefix = game.homeAway === "home" ? "vs" : "at";
  return `${prefix} ${getDisplayNameFromTeamName(game.opponent)}`;
}

function formatStandingsUpdatedLabel(updatedAt: string) {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return updatedAt;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

function ScoreRing({
  score,
  label,
  size = "default",
  delayMs = 0
}: {
  score: number;
  label: string;
  size?: "default" | "large";
  delayMs?: number;
}) {
  const ringStyle = {
    "--score-angle-target": `${score * 3.6}deg`,
    "--score-delay": `${delayMs}ms`
  } as CSSProperties;

  return (
    <div
      className={`score-ring ${size === "large" ? "score-ring--large" : ""}`}
      style={ringStyle}
      role="img"
      aria-label={`${label} ${score}점`}
    >
      <div className="score-ring__inner">
        <strong className="score-ring__value">{score}</strong>
      </div>
    </div>
  );
}

function FortuneScoreCard({
  label,
  score,
  delayMs = 0
}: {
  label: string;
  score: number;
  delayMs?: number;
}) {
  return (
    <article className="fortune-score-card">
      <ScoreRing score={score} label={label} delayMs={delayMs} />
      <span className="fortune-score-card__label">{label}</span>
    </article>
  );
}

export function TeamExperience({
  teamName,
  teamSlug,
  teamColor,
  introImageSrc,
  loadingImageSrc,
  fortune,
  fortuneHeadline,
  fortuneScores,
  keyPlayer,
  leagueStandings,
  summary,
  matchupSummary,
  games
}: TeamExperienceProps) {
  const [view, setView] = useState<ViewState>("intro");
  const themeStyle = {
    "--page-bg": teamColor
  } as CSSProperties;

  useEffect(() => {
    if (view !== "loading") {
      return;
    }

    const timeout = window.setTimeout(() => {
      startTransition(() => {
        setView("result");
      });
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [view]);

  return (
    <main className="team-shell" style={themeStyle}>
      <section className={`hero-stage hero-stage--${view}`}>
        <div className="hero-glow hero-glow--one" />
        <div className="hero-glow hero-glow--two" />

        {view === "intro" ? (
          <div className="intro-panel">
            <p className="hero-label">LuckyMatchDay</p>
            <button className="fortune-trigger" type="button" onClick={() => setView("loading")}>
              <span className="fortune-trigger__media">
                {introImageSrc ? (
                  <span className="fortune-trigger__media-frame">
                    <Image
                      src={introImageSrc}
                      alt={`${teamName} 오늘의 운세 보기`}
                      fill
                      className="fortune-trigger__image"
                      sizes="(max-width: 720px) 72vw, 300px"
                    />
                  </span>
                ) : (
                  <span className="fortune-trigger__core" />
                )}
              </span>
              <span className="fortune-trigger__caption">오늘 운세 보기</span>
            </button>
            <p className="hero-hint">그림을 클릭해서 오늘의 운세를 확인해보세요.</p>
          </div>
        ) : null}

        {view === "loading" ? (
          <div className="loading-panel">
            {loadingImageSrc ? (
              <div className="loading-visual">
                <div className="loading-visual__frame">
                  <Image
                    src={loadingImageSrc}
                    alt={`${teamName} 운세를 읽는 중`}
                    fill
                    className="loading-visual__image"
                    sizes="(max-width: 720px) 72vw, 300px"
                  />
                </div>
              </div>
            ) : (
              <div className="loading-orb" />
            )}
            <h1>오늘의 <br/>기운을 읽는 중</h1>
            <p className="hero-hint">
              최근 흐름과 점수의 결을 바탕으로
              <br />
              오늘의 분위기를 천천히 살펴보고 있습니다.
            </p>
            <div className="loading-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}

        {view === "result" ? (
          <div className="result-stack">
            <section className="panel panel--fortune">
              <div className="fortune-overview">
                <article className="today-score-card">
                  <span className="summary-card__label">오늘의 점수</span>
                  <ScoreRing score={fortuneScores.overall} label="오늘의 점수" size="large" delayMs={120} />
                </article>
                <div className="fortune-overview__body">
                  <h1>{teamName}</h1>
                  <p className="fortune-highlight">{fortuneHeadline}</p>
                </div>
              </div>
              <div className="fortune-score-grid">
                <FortuneScoreCard label="타격" score={fortuneScores.batting} delayMs={260} />
                <FortuneScoreCard label="수비" score={fortuneScores.defense} delayMs={420} />
                <FortuneScoreCard label="승리" score={fortuneScores.victory} delayMs={580} />
              </div>
              <p className="fortune-copy">{fortune}</p>
              <div className="summary-grid">
                <article className="summary-card">
                  <span className="summary-card__label">키플레이어</span>
                  <strong className="summary-card__value">{keyPlayer.name}</strong>
                  <p className="summary-card__copy">{keyPlayer.line}</p>
                </article>
                <article className="summary-card">
                  <span className="summary-card__label">전적</span>
                  <strong className="summary-card__value">
                    {summary.wins}승 {summary.losses}패 {summary.draws}무
                  </strong>
                </article>
              </div>
              {matchupSummary ? (
                <p className="fortune-subcopy">
                  상대 {matchupSummary.opponent} 기준 최근 맞대결은 {matchupSummary.wins}승{" "}
                  {matchupSummary.losses}패 {matchupSummary.draws}무입니다.
                </p>
              ) : null}
            </section>

            {leagueStandings && leagueStandings.standings.length > 0 ? (
              <section className="panel panel--matches">
                <div className="section-head">
                  <div className="stack">
                    <h3>리그 순위</h3>
                  </div>
                  <p className="muted">{formatStandingsUpdatedLabel(leagueStandings.updatedAt)} 기준</p>
                </div>

                <div className="match-table-wrap">
                  <table className="match-table league-table">
                    <thead>
                      <tr>
                        <th scope="col">팀</th>
                        <th scope="col">승률</th>
                        <th scope="col">게임차</th>
                        <th scope="col">승</th>
                        <th scope="col">무</th>
                        <th scope="col">패</th>
                        <th scope="col">경기</th>
                        <th scope="col">연속</th>
                        <th scope="col">최근 10경기</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leagueStandings.standings.map((standing) => (
                        <tr
                          key={standing.team}
                          className={standing.team === teamSlug ? "league-table__row--active" : undefined}
                        >
                          <td className="league-table__team">{getTeamDisplayName(standing.team)}</td>
                          <td>{standing.pct}</td>
                          <td>{standing.gamesBehind}</td>
                          <td>{standing.wins}</td>
                          <td>{standing.draws}</td>
                          <td>{standing.losses}</td>
                          <td>{standing.games}</td>
                          <td>{standing.streak}</td>
                          <td>{standing.recent10}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            <section className="panel panel--matches">
              <div className="section-head">
                <div className="stack">
                  <h3>최근 경기</h3>
                </div>
              </div>

              <div className="match-table-wrap">
                <table className="match-table recent-match-table">
                  <thead>
                    <tr>
                      <th scope="col">결과</th>
                      <th scope="col">상대</th>
                      <th scope="col">스코어</th>
                      <th scope="col">구장</th>
                      <th scope="col">승리투수</th>
                      <th scope="col">패전투수</th>
                      <th scope="col">세이브</th>
                      <th scope="col">날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((game) => (
                      <tr key={game.gameId}>
                        <td>
                          <span className={`result-pill result-pill--${game.result.toLowerCase()}`}>
                            {getResultLabel(game.result)}
                          </span>
                        </td>
                        <td className="match-table__opponent">{getOpponentLabel(game)}</td>
                        <td className="match-table__score">{game.score}</td>
                        <td>{game.stadium}</td>
                        <td>{game.winningPitcher || "-"}</td>
                        <td>{game.losingPitcher || "-"}</td>
                        <td>{game.savePitcher || "-"}</td>
                        <td className="match-table__date">{game.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
