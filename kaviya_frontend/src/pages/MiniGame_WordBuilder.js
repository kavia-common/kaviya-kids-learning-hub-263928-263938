import React, { useEffect, useMemo, useRef, useState } from "react";
import { recordGameCompletion, getGameStats } from "../utils/miniGamesStorage";
import { Link } from "react-router-dom";
import "./styles/MiniGames.css";

/**
 * PUBLIC_INTERFACE
 * Word Builder: Build as many valid target words as you can from provided letters.
 * Simple round: 60 seconds, earn XP 8; perfect bonus sticker if all targets found.
 */
export default function MiniGame_WordBuilder() {
  const inputRef = useRef(null);
  const [letters] = useState(() => randomLetters());
  const [targets] = useState(() => makeTargets(letters));
  const [found, setFound] = useState([]);
  const [text, setText] = useState("");
  const [time, setTime] = useState(60);
  const [done, setDone] = useState(false);
  const stats = useMemo(() => getGameStats("word-builder"), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          clearInterval(timer);
          finalize();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [done]);

  function onEnter(e) {
    e.preventDefault();
    const normalized = text.toLowerCase();
    if (normalized && targets.includes(normalized) && !found.includes(normalized)) {
      setFound([...found, normalized]);
      setText("");
    }
  }

  function finalize() {
    if (done) return;
    const score = found.length;
    const perfect = score === targets.length;
    recordGameCompletion("word-builder", score, 8, perfect ? "Word Wizard" : null, perfect ? 1 : 0);
    setDone(true);
  }

  const addLetter = (ch) => {
    setText(t => (t + ch).toLowerCase());
    if (inputRef.current) inputRef.current.focus();
  };

  const backspace = () => {
    setText(t => t.slice(0, -1));
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <main className="mg-container" aria-labelledby="word-builder-title">
      <header className="mg-header">
        <h1 id="word-builder-title">Word Builder</h1>
        <p className="mg-subtitle">Make words from the letters before time runs out!</p>
      </header>

      {!done ? (
        <section className="mg-game-wrap">
          <div className="mg-bar">
            <span className="mg-chip">Time: {time}s</span>
            <span className="mg-chip">Found: {found.length}</span>
            <span className="mg-chip">Best: {stats.bestScore}</span>
          </div>

          <div aria-label="Available letters" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {letters.map((ch, idx) => (
              <button
                key={idx}
                className="mg-btn"
                onClick={() => addLetter(ch)}
                aria-label={`Add letter ${ch}`}
              >
                {ch.toUpperCase()}
              </button>
            ))}
            <button className="mg-btn" onClick={backspace} aria-label="Backspace">⌫</button>
          </div>

          <form onSubmit={onEnter} aria-label="Word input">
            <label htmlFor="wbInput" className="visually-hidden">Enter word</label>
            <input
              id="wbInput"
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))}
              className="mg-card"
              aria-label="Word input"
              style={{ padding: 12, fontSize: 20, width: 260 }}
            />
            <div style={{ marginTop: 12 }}>
              <button className="mg-btn" aria-label="Submit word">Submit</button>
              <button type="button" className="mg-btn" style={{ marginLeft: 8, background: "#6B7280" }} onClick={finalize} aria-label="Finish game early">Finish</button>
              <Link to="/mini-games" className="mg-cta" style={{ marginLeft: 8 }}>Back to Hub</Link>
            </div>
          </form>

          <div style={{ marginTop: 16 }}>
            <h2 style={{ margin: "8px 0", color: "#1E3A8A" }}>Found Words</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {found.map((w) => (
                <span key={w} className="mg-chip" aria-label={`Found ${w}`}>{w}</span>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="mg-game-wrap" aria-live="assertive">
          <h2 style={{ marginTop: 0, color: "#1E3A8A" }}>Time's up!</h2>
          <p>You found <strong>{found.length}</strong> word(s).</p>
          <p className={found.length === targets.length ? "mg-success" : ""}>
            {found.length === targets.length ? "Amazing! You earned 8 XP, a Word Wizard sticker, and 1 spin ticket!" : "You earned 8 XP!"}
          </p>
          <div style={{ marginTop: 12 }}>
            <Link to="/mini-games/word-builder" className="mg-cta" aria-label="Play Word Builder again">Play Again</Link>
            <Link to="/spin" className="mg-cta" style={{ marginLeft: 8 }} aria-label="Go to Daily Spin">Use Ticket in Daily Spin</Link>
            <Link to="/mini-games" className="mg-cta" style={{ marginLeft: 8 }} aria-label="Back to Mini-Games hub">Back to Hub</Link>
          </div>
        </section>
      )}
    </main>
  );
}

function randomLetters() {
  const alpha = "etaoinshrdlucmfwygpbvkxqjz"; // frequency-biased
  const letters = [];
  for (let i = 0; i < 8; i++) {
    letters.push(alpha[Math.floor(Math.random() * alpha.length)]);
  }
  return letters;
}

function makeTargets(letters) {
  // Simple target set: choose a few plausible short words built from available letters.
  // For offline, no-dictionary mode, we predefine a small pool and filter by letters.
  const pool = [
    "the","and","sun","sand","hand","cat","dog","run","map","cap","cup","mud","rug",
    "log","jam","bed","red","led","pen","pin","pan","man","men","den","hen","ten",
    "can","fan","fun","rag","rag","tag","tan","tin","sit","sat","rat","hat","hit"
  ];
  return pool
    .filter(w => canBuild(w, letters))
    .slice(0, 8);
}

function canBuild(word, letters) {
  const counts = {};
  for (const l of letters) counts[l] = (counts[l] || 0) + 1;
  for (const c of word) {
    if (!counts[c]) return false;
    counts[c]--;
  }
  return true;
}
