import React, { useEffect, useMemo, useRef, useState } from "react";
import { recordGameCompletion, getGameStats } from "../utils/miniGamesStorage";
import { Link, useNavigate } from "react-router-dom";
import "./styles/MiniGames.css";

/**
 * PUBLIC_INTERFACE
 * Math Maze: Answer 10 quick math questions. Earn 10 XP and a sticker if perfect score.
 * Keyboard accessible: input focus, Enter to submit, Tab navigate buttons/links.
 */
export default function MiniGame_MathMaze() {
  const navigate = useNavigate();
  const [questions] = useState(() => makeQuestions(10));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef(null);

  const current = questions[index];
  const stats = useMemo(() => getGameStats("math-maze"), []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [index, finished]);

  function handleSubmit(e) {
    e.preventDefault();
    const numeric = Number(answer);
    if (numeric === current.ans) {
      setScore(s => s + 1);
    }
    setAnswer("");
    if (index + 1 >= questions.length) {
      // finish
      const perfect = score + (numeric === current.ans ? 1 : 0) === questions.length;
      recordGameCompletion("math-maze", score + (numeric === current.ans ? 1 : 0), 10, perfect ? "Math Star" : null, perfect ? 1 : 0);
      setFinished(true);
    } else {
      setIndex(i => i + 1);
    }
  }

  return (
    <main className="mg-container" aria-labelledby="math-maze-title">
      <header className="mg-header">
        <h1 id="math-maze-title">Math Maze</h1>
        <p className="mg-subtitle">Solve quick sums to reach the goal!</p>
      </header>

      {!finished ? (
        <section className="mg-game-wrap" aria-live="polite">
          <div className="mg-bar">
            <span className="mg-chip">Question {index + 1} / {questions.length}</span>
            <span className="mg-chip">Score: {score}</span>
            <span className="mg-chip">Best: {stats.bestScore}</span>
          </div>
          <div style={{ fontSize: 28, margin: "16px 0", color: "#1E3A8A", fontWeight: 800 }}>
            {current.a} {current.op} {current.b} = ?
          </div>
          <form onSubmit={handleSubmit} aria-label="Answer input area">
            <label htmlFor="mathAnswer" className="visually-hidden">Enter your answer</label>
            <input
              id="mathAnswer"
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value.replace(/[^0-9-]/g, ""))}
              inputMode="numeric"
              pattern="[0-9-]*"
              aria-label="Answer"
              className="mg-card"
              style={{ padding: 12, fontSize: 20, width: 200 }}
            />
            <div style={{ marginTop: 12 }}>
              <button type="submit" className="mg-btn" aria-label="Submit answer">Submit</button>
              <Link to="/mini-games" className="mg-cta" style={{ marginLeft: 8 }}>Back to Hub</Link>
            </div>
          </form>
        </section>
      ) : (
        <section className="mg-game-wrap" aria-live="assertive">
          <h2 style={{ marginTop: 0, color: "#1E3A8A" }}>Great job!</h2>
          <p>You scored <strong>{score}</strong> out of {questions.length}.</p>
          <p className={score === questions.length ? "mg-success" : ""}>
            {score === questions.length ? "Perfect! You earned 10 XP, a Math Star sticker, and 1 spin ticket!" : "You earned 10 XP!"}
          </p>
          <div style={{ marginTop: 12 }}>
            <button className="mg-btn" onClick={() => navigate(0)} aria-label="Play again">Play Again</button>
            <Link to="/spin" className="mg-cta" style={{ marginLeft: 8 }} aria-label="Go to Daily Spin">Use Ticket in Daily Spin</Link>
            <Link to="/mini-games" className="mg-cta" style={{ marginLeft: 8 }} aria-label="Back to Mini-Games hub">Back to Hub</Link>
          </div>
        </section>
      )}
    </main>
  );
}

function makeQuestions(n) {
  const ops = ["+", "-", "×"];
  const arr = [];
  for (let i = 0; i < n; i++) {
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    let ans = 0;
    if (op === "+") ans = a + b;
    else if (op === "-") ans = a - b;
    else ans = a * b;
    arr.push({ a, b, op, ans });
  }
  return arr;
}
