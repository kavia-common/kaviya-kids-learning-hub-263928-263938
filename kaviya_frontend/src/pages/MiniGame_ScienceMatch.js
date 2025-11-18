import React, { useEffect, useMemo, useRef, useState } from "react";
import { recordGameCompletion, getGameStats } from "../utils/miniGamesStorage";
import { Link } from "react-router-dom";
import "./styles/MiniGames.css";

/**
 * PUBLIC_INTERFACE
 * Science Match: Match simple science pairs. Finish quickly to earn XP 6, perfect grants sticker and a ticket.
 * Keyboard support: Arrow keys to move focus, Enter to select/match.
 */
export default function MiniGame_ScienceMatch() {
  const pairs = useMemo(() => shuffle([
    ["Sun", "Star"],
    ["Earth", "Planet"],
    ["Water", "H2O"],
    ["Plant", "Photosynthesis"],
    ["Heart", "Pump"],
    ["Lung", "Breath"],
  ]).slice(0, 4), []);

  // Create cards: left terms and right definitions, then shuffle
  const [cards] = useState(() => {
    const left = pairs.map(([a]) => ({ id: `L_${a}`, label: a, side: "L", pair: a }));
    const right = pairs.map(([, b], idx) => ({ id: `R_${pairs[idx][0]}`, label: b, side: "R", pair: pairs[idx][0] }));
    return shuffle([...left, ...right]);
  });

  const [selected, setSelected] = useState(null);
  const [matched, setMatched] = useState({});
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);
  const gridRef = useRef(null);
  const stats = useMemo(() => getGameStats("science-match"), []);

  useEffect(() => {
    if (Object.keys(matched).length === pairs.length) {
      setFinished(true);
      const score = Math.max(0, 100 - (moves - pairs.length) * 5); // simple score inverse to extra moves
      recordGameCompletion("science-match", score, 6, "Science Buddy", 1);
    }
    // eslint-disable-next-line
  }, [matched]);

  useEffect(() => {
    const handler = (e) => {
      if (finished) return;
      const cols = 4;
      const total = cards.length;
      if (["ArrowRight","ArrowLeft","ArrowUp","ArrowDown","Enter"," "].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowRight") setFocusIdx((i) => Math.min(total - 1, i + 1));
      if (e.key === "ArrowLeft") setFocusIdx((i) => Math.max(0, i - 1));
      if (e.key === "ArrowUp") setFocusIdx((i) => Math.max(0, i - cols));
      if (e.key === "ArrowDown") setFocusIdx((i) => Math.min(total - 1, i + cols));
      if (e.key === "Enter" || e.key === " ") clickCard(cards[focusIdx]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line
  }, [cards, focusIdx, finished, selected]);

  function clickCard(card) {
    if (matched[card.pair]) return;
    if (!selected) {
      setSelected(card);
      setMoves((m) => m + 1);
      return;
    }
    // if second selection matches pair but on opposite side, success
    if (selected.pair === card.pair && selected.side !== card.side) {
      setMatched((m) => ({ ...m, [card.pair]: true }));
      setSelected(null);
      setMoves((m) => m + 1);
    } else {
      // mismatch, just clear selection and count a move
      setSelected(null);
      setMoves((m) => m + 1);
    }
  }

  return (
    <main className="mg-container" aria-labelledby="science-match-title">
      <header className="mg-header">
        <h1 id="science-match-title">Science Match</h1>
        <p className="mg-subtitle">Match pairs to complete the set!</p>
      </header>

      {!finished ? (
        <section className="mg-game-wrap">
          <div className="mg-bar">
            <span className="mg-chip">Pairs: {Object.keys(matched).length} / {pairs.length}</span>
            <span className="mg-chip">Moves: {moves}</span>
            <span className="mg-chip">Best: {stats.bestScore}</span>
          </div>
          <div
            ref={gridRef}
            role="grid"
            aria-label="Matching grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12
            }}
          >
            {cards.map((c, idx) => {
              const isSelected = selected && selected.id === c.id;
              const isMatched = !!matched[c.pair];
              return (
                <button
                  key={c.id}
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-disabled={isMatched}
                  tabIndex={idx === focusIdx ? 0 : -1}
                  onClick={() => clickCard(c)}
                  onFocus={() => setFocusIdx(idx)}
                  className="mg-btn"
                  style={{
                    padding: 14,
                    height: 72,
                    background: isMatched ? "#E5E7EB" : isSelected ? "#1E40AF" : undefined,
                    color: isMatched ? "#6B7280" : isSelected ? "white" : undefined,
                    border: isMatched ? "2px solid #D1D5DB" : "none"
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 12 }}>
            <Link to="/mini-games" className="mg-cta">Back to Hub</Link>
          </div>
        </section>
      ) : (
        <section className="mg-game-wrap" aria-live="assertive">
          <h2 style={{ marginTop: 0, color: "#1E3A8A" }}>All matched!</h2>
          <p>You finished in <strong>{moves}</strong> moves.</p>
          <p className="mg-success">You earned 6 XP, a Science Buddy sticker, and 1 spin ticket!</p>
          <div style={{ marginTop: 12 }}>
            <Link to="/mini-games/science-match" className="mg-cta" aria-label="Play Science Match again">Play Again</Link>
            <Link to="/spin" className="mg-cta" style={{ marginLeft: 8 }} aria-label="Go to Daily Spin">Use Ticket in Daily Spin</Link>
            <Link to="/mini-games" className="mg-cta" style={{ marginLeft: 8 }} aria-label="Back to Mini-Games hub">Back to Hub</Link>
          </div>
        </section>
      )}
    </main>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
