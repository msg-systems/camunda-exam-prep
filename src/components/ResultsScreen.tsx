import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ExamAttempt } from '@/types';
import { TOPICS_BY_ID } from '@/data/topics';
import { getQuestionById } from '@/data';
import { QuestionCard } from '@/components/QuestionCard';

interface ResultsScreenProps {
  attempt: ExamAttempt;
  onRetake: () => void;
}

export function ResultsScreen({ attempt, onRetake }: ResultsScreenProps) {
  const [reviewIdx, setReviewIdx] = useState<number | null>(null);

  if (reviewIdx !== null) {
    const result = attempt.questionResults[reviewIdx];
    const q = result ? getQuestionById(result.questionId) : null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            className="text-sm text-camunda hover:underline"
            onClick={() => setReviewIdx(null)}
          >
            ← Back to results
          </button>
          <span className="text-sm text-slate-500">
            Review {reviewIdx + 1} / {attempt.questionResults.length}
          </span>
        </div>
        {q && result && (
          <>
            <div
              className={`card border-l-4 ${
                result.correct ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <p className="text-sm">
                <strong>Your answer:</strong>{' '}
                {result.selectedOptionId ? (
                  <span
                    className={
                      result.correct
                        ? 'font-mono text-green-700 dark:text-green-400'
                        : 'font-mono text-red-700 dark:text-red-400'
                    }
                  >
                    {result.selectedOptionId.toUpperCase()}
                  </span>
                ) : (
                  <span className="text-slate-500">— (not answered)</span>
                )}
                {' · '}
                <strong>Correct:</strong>{' '}
                <span className="font-mono text-green-700 dark:text-green-400">
                  {q.correctOptionId.toUpperCase()}
                </span>
              </p>
            </div>
            <QuestionCard
              key={q.id}
              question={q}
              number={reviewIdx + 1}
              total={attempt.questionResults.length}
              mode="review"
              selectedOptionId={(result.selectedOptionId as 'a' | 'b' | 'c' | 'd' | null) ?? null}
              showCorrectness
            />
          </>
        )}
        <div className="flex justify-between">
          <button
            className="btn btn-secondary"
            disabled={reviewIdx === 0}
            onClick={() => setReviewIdx((i) => Math.max(0, (i ?? 0) - 1))}
          >
            ← Previous
          </button>
          <button className="btn btn-secondary" onClick={() => setReviewIdx(null)}>
            Done reviewing
          </button>
          <button
            className="btn btn-primary"
            disabled={reviewIdx === attempt.questionResults.length - 1}
            onClick={() =>
              setReviewIdx((i) =>
                Math.min(attempt.questionResults.length - 1, (i ?? 0) + 1)
              )
            }
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  const wrongResults = attempt.questionResults
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => !r.correct);

  return (
    <div className="space-y-6">
      <div className="card text-center">
        <h2 className="text-2xl font-bold">{attempt.passed ? 'Passed' : 'Did not pass'}</h2>
        <p className="mt-2 text-4xl font-bold text-camunda">{attempt.score.toFixed(1)}%</p>
        <p className="mt-1 text-sm text-slate-500">
          {attempt.correctQuestions} / {attempt.totalQuestions} correct
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button className="btn btn-primary" onClick={() => setReviewIdx(0)}>
            Review all answers
          </button>
          {wrongResults.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={() => setReviewIdx(wrongResults[0].i)}
            >
              Review wrong only ({wrongResults.length})
            </button>
          )}
          <button className="btn btn-secondary" onClick={onRetake}>
            Take another exam
          </button>
          <Link to="/dashboard" className="btn btn-secondary">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3 font-semibold">Per-topic breakdown</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="pb-2">Topic</th>
              <th className="pb-2">Correct</th>
              <th className="pb-2">Total</th>
              <th className="pb-2">%</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(attempt.byTopic).map(([topicId, stats]) => {
              if (!stats) return null;
              const pct = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
              return (
                <tr key={topicId} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="py-1.5">{TOPICS_BY_ID[topicId as keyof typeof TOPICS_BY_ID]?.name ?? topicId}</td>
                  <td>{stats.correct}</td>
                  <td>{stats.total}</td>
                  <td>{pct.toFixed(0)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {wrongResults.length > 0 && (
        <div className="card">
          <h3 className="mb-3 font-semibold">Wrong answers ({wrongResults.length})</h3>
          <ul className="space-y-1 text-sm">
            {wrongResults.map(({ r, i }) => {
              const q = getQuestionById(r.questionId);
              return (
                <li key={r.questionId}>
                  <button
                    className="text-camunda hover:underline"
                    onClick={() => setReviewIdx(i)}
                  >
                    Question {i + 1}
                  </button>{' '}
                  <span className="text-slate-500">
                    — you picked{' '}
                    <span className="font-mono">{r.selectedOptionId?.toUpperCase() ?? '—'}</span>
                    , correct is{' '}
                    <span className="font-mono text-green-700 dark:text-green-400">
                      {q?.correctOptionId.toUpperCase() ?? '?'}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
