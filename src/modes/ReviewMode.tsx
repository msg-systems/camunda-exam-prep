import { useMemo, useState } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { useProgressStore } from '@/store/progressStore';
import { ALL_QUESTIONS } from '@/data';

type Filter = 'wrong' | 'bookmarked' | 'unseen';

export function ReviewMode() {
  const progress = useProgressStore((s) => s.progress);
  const [filter, setFilter] = useState<Filter>('wrong');
  const [index, setIndex] = useState(0);

  const questions = useMemo(() => {
    return ALL_QUESTIONS.filter((q) => {
      const p = progress[q.id];
      switch (filter) {
        case 'wrong':
          return p && p.lastAnswerCorrect === false;
        case 'bookmarked':
          return p?.bookmarked;
        case 'unseen':
          return !p || p.attempts === 0;
      }
    });
  }, [progress, filter]);

  const q = questions[index];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-bold">Review</h1>
        {(['wrong', 'bookmarked', 'unseen'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setIndex(0);
            }}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {!q ? (
        <div className="card text-center text-slate-500">
          No questions match this filter yet.
        </div>
      ) : (
        <>
          <QuestionCard
            key={q.id}
            question={q}
            number={index + 1}
            total={questions.length}
            mode="review"
            selectedOptionId={null}
            showCorrectness
          />
          <div className="flex justify-between">
            <button
              className="btn btn-secondary"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
            >
              Previous
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={index === questions.length - 1}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
