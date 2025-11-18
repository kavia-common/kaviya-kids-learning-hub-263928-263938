import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import quizService from '../api/services/quizService';

/**
 * PUBLIC_INTERFACE
 * QuizPage fetches questions by subject and submits answers.
 */
export default function QuizPage() {
  const { subject = 'math' } = useParams();
  const { user } = useAuth();
  const userId = user?.id || user?._id || user?.userId || 'me';

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    setResult(null);
    quizService
      .getQuizBySubject(subject)
      .then((data) => {
        setQuestions(data?.questions || []);
      })
      .catch((err) => setError(err?.message || 'Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [subject]);

  const onChoose = (qid, opt) => {
    setAnswers((a) => ({ ...a, [qid]: opt }));
  };

  const payload = useMemo(() => {
    const arr = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
    return { userId, subject, answers: arr };
  }, [answers, subject, userId]);

  const onSubmit = async () => {
    setSubmitLoading(true);
    setError('');
    try {
      const res = await quizService.submitQuiz(payload);
      setResult(res);
    } catch (err) {
      setError(err?.message || 'Failed to submit quiz');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#1E3A8A' }}>Quiz: {subject}</h2>
      {loading && <p>Loading questions...</p>}
      {error && <p style={{ color: '#DC2626' }}>{error}</p>}
      {!loading && !error && (
        <>
          {questions.length === 0 && <p>No questions available.</p>}
          {questions.map((q, idx) => (
            <div key={q.id || idx} style={{ background: '#fff', padding: 16, borderRadius: 10, marginBottom: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {idx + 1}. {q.question}
              </div>
              <div>
                {(q.options || []).map((opt) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => onChoose(q.id, opt)}
                      style={{
                        padding: '8px 10px',
                        marginRight: 8,
                        marginBottom: 8,
                        borderRadius: 8,
                        border: selected ? '2px solid #059669' : '1px solid #D1D5DB',
                        background: selected ? '#ECFDF5' : '#fff',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button onClick={onSubmit} disabled={submitLoading} style={{ padding: '10px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8 }}>
            {submitLoading ? 'Submitting...' : 'Submit Quiz'}
          </button>

          {result && (
            <div style={{ marginTop: 16, background: '#fff', padding: 16, borderRadius: 10 }}>
              <h3 style={{ marginTop: 0 }}>Results</h3>
              <p>Score: {result.score}</p>
              <p>
                Correct: {result.correct} / {result.total}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
