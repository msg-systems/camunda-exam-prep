import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ExamAttempt } from '@/types';
import { TOPICS_BY_ID, EXAM_PASS_PERCENTAGE } from '@/data/topics';
import { getQuestionById } from '@/data';
import { QuestionCard } from '@/components/QuestionCard';

interface ResultsScreenProps {
  attempt: ExamAttempt;
  onRetake: () => void;
}

interface ScoreBand {
  label: string;
  blurb: string;
  classes: string;
}

function scoreBandFor(pct: number, pass: number): ScoreBand {
  if (pct >= 80) {
    return {
      label: 'Very comfortable pass',
      blurb: 'You are exam-ready. Stop studying tonight.',
      classes: 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-100',
    };
  }
  if (pct >= 70) {
    return {
      label: 'Pass range',
      blurb: 'Likely pass. Skim the topics you missed and you are done.',
      classes: 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100',
    };
  }
  if (pct >= pass) {
    return {
      label: 'Thin pass margin',
      blurb: `Above the ${pass}% cut-off, but only just. Drill the weakest topics before exam day.`,
      classes: 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100',
    };
  }
  return {
    label: 'Below pass',
    blurb: `Under the ${pass}% cut-off. Identify the topic cluster you missed and focus there.`,
    classes: 'border-red-500 bg-red-50 text-red-900 dark:bg-red-900/30 dark:text-red-100',
  };
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

  const band = scoreBandFor(attempt.score, EXAM_PASS_PERCENTAGE);

  return (
    <div className="space-y-6">
      <div className="card text-center">
        <h2 className="text-2xl font-bold">{attempt.passed ? 'Passed' : 'Did not pass'}</h2>
        <p className="mt-2 text-4xl font-bold text-camunda">{attempt.score.toFixed(1)}%</p>
        <p className="mt-1 text-sm text-slate-500">
          {attempt.correctQuestions} / {attempt.totalQuestions} correct · pass at {EXAM_PASS_PERCENTAGE}%
        </p>
        <div className={`mt-4 rounded border-l-4 p-3 text-left text-sm ${band.classes}`}>
          <p className="font-semibold">{band.label}</p>
          <p className="mt-1 text-xs">{band.blurb}</p>
        </div>
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
