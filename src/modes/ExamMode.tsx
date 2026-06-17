import { useEffect, useMemo, useState } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { Timer } from '@/components/Timer';
import { ResultsScreen } from '@/components/ResultsScreen';
import { useExamSessionStore } from '@/store/examSessionStore';
import { useProgressStore } from '@/store/progressStore';
import { useTimer } from '@/hooks/useTimer';
import { getRandomExamSet, getQuestionById } from '@/data';
import {
  EXAM_DURATION_MINUTES,
  EXAM_PASS_PERCENTAGE,
  EXAM_TOTAL_QUESTIONS,
} from '@/data/topics';
import type { ExamAttempt, TopicId } from '@/types';

export function ExamMode() {
  const session = useExamSessionStore((s) => s.session);
  const start = useExamSessionStore((s) => s.start);
  const answer = useExamSessionStore((s) => s.answer);
  const flag = useExamSessionStore((s) => s.flag);
  const setIndex = useExamSessionStore((s) => s.setIndex);
  const finish = useExamSessionStore((s) => s.finish);
  const clear = useExamSessionStore((s) => s.clear);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);

  const [completedAttempt, setCompletedAttempt] = useState<ExamAttempt | null>(null);

  const beginExam = () => {
    setCompletedAttempt(null);
    const qs = getRandomExamSet();
    start(
      qs.map((q) => q.id),
      EXAM_DURATION_MINUTES * 60 * 1000
    );
  };

  const submit = () => {
    if (!session) return;
    let correctQ = 0;
    const byTopic: ExamAttempt['byTopic'] = {};
    const questionResults: ExamAttempt['questionResults'] = [];

    for (const qid of session.questionIds) {
      const q = getQuestionById(qid);
      if (!q) continue;
      const selected = session.answers[qid];
      const correct = selected === q.correctOptionId;
      if (correct) correctQ++;
      const t = q.topic as TopicId;
      const cur = byTopic[t] ?? { correct: 0, total: 0 };
      byTopic[t] = { correct: cur.correct + (correct ? 1 : 0), total: cur.total + 1 };
      questionResults.push({ questionId: qid, selectedOptionId: selected, correct });
    }

    const total = session.questionIds.length;
    const score = total > 0 ? (correctQ / total) * 100 : 0;
    const attempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      startedAt: session.startedAt,
      finishedAt: Date.now(),
      score,
      passed: score >= EXAM_PASS_PERCENTAGE,
      totalQuestions: total,
      correctQuestions: correctQ,
      byTopic,
      questionResults,
    };
    recordAttempt(attempt);
    finish();
    setCompletedAttempt(attempt);
  };

  if (completedAttempt) {
    return (
      <ResultsScreen
        attempt={completedAttempt}
        onRetake={() => {
          clear();
          setCompletedAttempt(null);
          beginExam();
        }}
      />
    );
  }

  if (!session || session.finished) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold">Mock exam</h1>
        <p className="mt-2 text-sm text-slate-500">
          {EXAM_TOTAL_QUESTIONS} questions · {EXAM_DURATION_MINUTES} minutes · pass at{' '}
          {EXAM_PASS_PERCENTAGE}%
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Mirrors the official Camunda Certified Professional - Developer (C8-CP-DV)
          v8.8.0 format: single correct response, four options, weighted to the
          official topic blueprint. No correctness feedback until you submit.
        </p>
        <div>
          <button className="btn btn-primary mt-4" onClick={beginExam}>
            Start exam
          </button>
        </div>
      </div>
    );
  }

  return <ExamRunner submit={submit} answer={answer} flag={flag} setIndex={setIndex} />;
}

function ExamRunner({
  submit,
  answer,
  flag,
  setIndex,
}: {
  submit: () => void;
  answer: (qid: string, optId: 'a' | 'b' | 'c' | 'd' | null) => void;
  flag: (qid: string, f: boolean) => void;
  setIndex: (i: number) => void;
}) {
  const session = useExamSessionStore((s) => s.session)!;
  const deadline = session.startedAt + session.durationMs;
  const { formatted, expired } = useTimer(deadline);
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);

  const questions = useMemo(
    () => session.questionIds.map((id) => getQuestionById(id)).filter(Boolean),
    [session.questionIds]
  );
  const q = questions[session.currentIndex];

  useEffect(() => {
    if (expired && !session.finished) submit();
  }, [expired, session.finished, submit]);

  if (!q) {
    return <div className="card">Exam loading error.</div>;
  }

  const answeredCount = Object.values(session.answers).filter(Boolean).length;
  const flaggedCount = Object.values(session.flagged).filter(Boolean).length;
  const unanswered = session.questionIds.length - answeredCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Answered: {answeredCount}/{session.questionIds.length} · Flagged: {flaggedCount}
        </div>
        <Timer formatted={formatted} expired={expired} />
      </div>

      <QuestionCard
        key={q.id}
        question={q}
        number={session.currentIndex + 1}
        total={session.questionIds.length}
        mode="exam"
        selectedOptionId={session.answers[q.id] ?? null}
        onAnswer={(opt) => answer(q.id, opt)}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setIndex(Math.max(0, session.currentIndex - 1))}
            disabled={session.currentIndex === 0}
          >
            Previous
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => flag(q.id, !session.flagged[q.id])}
          >
            {session.flagged[q.id] ? 'Unflag' : 'Flag for review'}
          </button>
        </div>
        <div className="flex items-center gap-8">
          <button
            className="btn btn-primary"
            onClick={() =>
              setIndex(Math.min(session.questionIds.length - 1, session.currentIndex + 1))
            }
            disabled={session.currentIndex === session.questionIds.length - 1}
          >
            Next →
          </button>
          <button
            className="rounded border-2 border-red-600 px-4 py-2 font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/30"
            onClick={() => setConfirmingSubmit(true)}
          >
            Submit exam
          </button>
        </div>
      </div>

      {confirmingSubmit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmingSubmit(false)}
        >
          <div
            className="card max-w-md space-y-4 bg-white dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">Submit exam?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              You have answered <strong>{answeredCount}</strong> of{' '}
              <strong>{session.questionIds.length}</strong> questions.
              {unanswered > 0 && (
                <>
                  {' '}
                  <span className="text-red-600">
                    {unanswered} unanswered will be marked wrong.
                  </span>
                </>
              )}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              After submitting you'll see your score and can review every answer with the correct
              option and explanation.
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={() => setConfirmingSubmit(false)}>
                Keep working
              </button>
              <button
                className="rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                onClick={() => {
                  setConfirmingSubmit(false);
                  submit();
                }}
              >
                Submit now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="mb-2 text-sm font-semibold">Navigator</h3>
        <div className="flex flex-wrap gap-1">
          {session.questionIds.map((qid, i) => {
            const isCurrent = i === session.currentIndex;
            const isAnswered = !!session.answers[qid];
            const isFlagged = !!session.flagged[qid];
            return (
              <button
                key={qid}
                onClick={() => setIndex(i)}
                title={qid}
                className={`h-8 w-8 rounded text-xs font-mono ${
                  isCurrent
                    ? 'bg-camunda text-white'
                    : isAnswered
                    ? 'bg-green-200 dark:bg-green-800'
                    : 'bg-slate-200 dark:bg-slate-700'
                } ${isFlagged ? 'ring-2 ring-yellow-400' : ''}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
