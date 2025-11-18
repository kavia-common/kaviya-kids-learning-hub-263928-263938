import React from "react";
import { Link } from "react-router-dom";
import { getTickets, getMiniGamesState } from "../utils/miniGamesStorage";
import "./styles/MiniGames.css";

/**
 * PUBLIC_INTERFACE
 * MiniGamesHub - lists available mini-games, shows current spin tickets,
 * and provides quick actions. Kid-friendly, accessible, and styled to Corporate Navy.
 */
export default function MiniGamesHub() {
  const tickets = getTickets();
  const state = getMiniGamesState();

  const games = [
    {
      key: "math-maze",
      name: "Math Maze",
      desc: "Solve quick sums to reach the goal!",
      path: "/mini-games/math-maze",
      icon: "➕",
    },
    {
      key: "word-builder",
      name: "Word Builder",
      desc: "Form words from letters!",
      path: "/mini-games/word-builder",
      icon: "🔤",
    },
    {
      key: "science-match",
      name: "Science Match",
      desc: "Match items with their pairs!",
      path: "/mini-games/science-match",
      icon: "🔬",
    },
  ];

  return (
    <main className="mg-container" aria-labelledby="mini-games-heading">
      <header className="mg-header">
        <h1 id="mini-games-heading">Mini-Games</h1>
        <p className="mg-subtitle">Play quick games, earn XP and fun stickers!</p>
      </header>

      <section className="mg-stats" aria-label="Your rewards">
        <div className="mg-card">
          <div className="mg-stat-title">XP</div>
          <div className="mg-stat-value" aria-live="polite">{state.xp}</div>
        </div>
        <div className="mg-card">
          <div className="mg-stat-title">Spin Tickets</div>
          <div className="mg-stat-value" aria-live="polite">{tickets}</div>
          <Link className="mg-cta" to="/spin" aria-label="Go to Daily Spin to use your tickets">Use in Daily Spin</Link>
        </div>
        <div className="mg-card">
          <div className="mg-stat-title">Stickers</div>
          <div className="mg-stat-value" aria-live="polite">{state.stickers.length}</div>
          <Link className="mg-cta" to="/stickers" aria-label="Open Sticker Book">Open Sticker Book</Link>
        </div>
      </section>

      <section className="mg-list" aria-label="Available mini-games">
        {games.map(g => {
          const stats = state.completed[g.key] || { bestScore: 0, timesPlayed: 0 };
          return (
            <article key={g.key} className="mg-game-card">
              <div className="mg-icon" aria-hidden="true">{g.icon}</div>
              <div className="mg-info">
                <h2 className="mg-game-title">{g.name}</h2>
                <p className="mg-game-desc">{g.desc}</p>
                <p className="mg-game-meta">
                  Best: <strong>{stats.bestScore}</strong> • Played: <strong>{stats.timesPlayed || 0}</strong>
                </p>
              </div>
              <div className="mg-actions">
                <Link className="mg-play-btn" to={g.path} aria-label={`Play ${g.name}`}>Play</Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
