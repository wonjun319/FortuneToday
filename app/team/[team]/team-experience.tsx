"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { startTransition, useEffect, useState } from "react";
import type { MatchRecord } from "@/lib/types";
import { getDisplayNameFromTeamName } from "@/lib/team-display";

type TeamExperienceProps = {
  teamName: string;
  teamColor: string;
  introImageSrc: string | null;
  loadingImageSrc: string | null;
  fortune: string;
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

export function TeamExperience({
  teamName,
  teamColor,
  introImageSrc,
  loadingImageSrc,
  fortune,
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
            <p className="hero-label">LuckMatchDay</p>
            <button className="fortune-trigger" type="button" onClick={() => setView("loading")}>
              <span className="fortune-trigger__media">
                {introImageSrc ? (
                  <span className="fortune-trigger__media-frame">
                    <Image
                      src={introImageSrc}
                      alt={`${teamName} 오늘 운세 보기`}
                      fill
                      className="fortune-trigger__image"
                      sizes="(max-width: 720px) 68vw, 280px"
                    />
                  </span>
                ) : (
                  <span className="fortune-trigger__core" />
                )}
              </span>
              <span className="fortune-trigger__caption">오늘 운세 보기</span>
            </button>
            <p className="hero-hint">{teamName}의 오늘 흐름을 확인해보세요.</p>
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
            <h1>오늘의 기운을 읽는 중</h1>
            <p className="hero-hint">
              최근 흐름과 쌓인 신호를 바탕으로 오늘의 분위기를 천천히 살펴보고 있습니다.
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
              <p className="hero-label">오늘의 운세</p>
              <h1>{teamName}</h1>
              <p className="fortune-copy">{fortune}</p>
              <div className="summary-grid">
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

            <section className="panel panel--matches">
              <div className="section-head">
                <div>
                  <h3>최근 경기</h3>
                </div>
                <div className="badge-row">
                  {games.map((game) => (
                    <span key={game.gameId} className={`badge badge--${game.result.toLowerCase()}`}>
                      {game.result}
                    </span>
                  ))}
                </div>
              </div>

              <div className="match-table-wrap">
                <table className="match-table">
                  <thead>
                    <tr>
                      <th scope="col">날짜</th>
                      <th scope="col">결과</th>
                      <th scope="col">상대</th>
                      <th scope="col">스코어</th>
                      <th scope="col">구장</th>
                      <th scope="col">승리투수</th>
                      <th scope="col">패전투수</th>
                      <th scope="col">세이브</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((game) => (
                      <tr key={game.gameId}>
                        <td className="match-table__date">{game.date}</td>
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
