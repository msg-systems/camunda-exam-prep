import { useState } from 'react';
import type { Question } from '@/types';
import { useProgressStore } from '@/store/progressStore';

interface QuestionCardProps {
  question: Question;
  number?: number;
  total?: number;
  /** practice = show feedback after answer; exam = no feedback */
  mode: 'practice' | 'exam' | 'review';
  /** Pre-selected answer (for exam navigation) */
  selectedOptionId?: 'a' | 'b' | 'c' | 'd' | null;
  onAnswer?: (optionId: 'a' | 'b' | 'c' | 'd') => void;
  showCorrectness?: boolean; // forced reveal (review mode)
}

export function QuestionCard({
  question,
  number,
  total,
  mode,
  selectedOptionId = null,
  onAnswer,
  showCorrectness = false,
}: QuestionCardProps) {
  const [localAnswer, setLocalAnswer] = useState<'a' | 'b' | 'c' | 'd' | null>(selectedOptionId);
  const recordAnswer = useProgressStore((s) => s.recordAnswer);
  const toggleBookmark = useProgressStore((s) => s.toggleBookmark);
  const bookmarked = useProgressStore((s) => s.progress[question.id]?.bookmarked ?? false);

  const answered = localAnswer !== null;
  const reveal = showCorrectness || (mode === 'practice' && answered) || mode === 'review';

  const handleSelect = (id: 'a' | 'b' | 'c' | 'd') => {
    if (mode === 'practice' && answered) return;
    setLocalAnswer(id);
    onAnswer?.(id);
    if (mode === 'practice') {
      recordAnswer(question.id, id === question.correctOptionId);
    }
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {number !== undefined && total !== undefined
            ? `Question ${number} of ${total}`
            : null}
          <span className="ml-2 rounded bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700">
            {question.topic}
          </span>
          <span className="ml-1 rounded bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700">
            {question.difficulty}
          </span>
          {question.kind === 'negative' && (
            <span className="ml-1 rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-200">
              negative
            </span>
          )}
        </div>
        <button
          onClick={() => toggleBookmark(question.id)}
          className="text-xl"
          title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          {bookmarked ? '★' : '☆'}
        </button>
      </div>

      {question.kind === 'negative' && (
        <div className="rounded border-l-4 border-red-500 bg-red-50 p-3 text-sm font-medium text-red-900 dark:bg-red-900/30 dark:text-red-100">
          Read carefully — this question asks for the wrong / false option.
        </div>
      )}

      {question.scenario && (
        <div className="rounded border-l-4 border-camunda bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 whitespace-pre-line dark:bg-slate-800 dark:text-slate-300">
          {question.scenario}
        </div>
      )}

      {question.diagramUrl && (
        <img
          src={question.diagramUrl}
          alt={question.diagramAlt ?? 'Diagram'}
          className="max-w-full rounded border border-slate-200 dark:border-slate-700"
        />
      )}

      <h2 className="text-lg font-semibold leading-snug">{question.question}</h2>

      {question.codeBlocks?.stem && (
        <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs leading-relaxed text-slate-100 dark:bg-slate-950">
          <code>{question.codeBlocks.stem}</code>
        </pre>
      )}

      <ul className="space-y-2">
        {question.options.map((opt) => {
          const isSelected = localAnswer === opt.id;
          const isCorrect = opt.id === question.correctOptionId;
          const optExp = question.optionExplanations?.[opt.id];
          const perOptionCode = question.codeBlocks?.perOption?.[opt.id];
          let cls =
            'block w-full text-left rounded border px-4 py-2 transition border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700';
          if (reveal) {
            if (isCorrect) {
              cls += ' bg-green-100 border-green-500 dark:bg-green-900/40';
            } else if (isSelected && !isCorrect) {
              cls += ' bg-red-100 border-red-500 dark:bg-red-900/40';
            }
          } else if (isSelected) {
            cls += ' bg-camunda/10 border-camunda';
          }
          return (
            <li key={opt.id}>
              <button className={cls} onClick={() => handleSelect(opt.id)} disabled={mode === 'review'}>
                <span className="mr-2 font-mono font-bold uppercase">{opt.id}.</span>
                {opt.text}
              </button>
              {perOptionCode && (
                <pre className="mt-1 ml-6 overflow-x-auto rounded bg-slate-900 p-2 text-xs leading-relaxed text-slate-100 dark:bg-slate-950">
                  <code>{perOptionCode}</code>
                </pre>
              )}
              {reveal && optExp && (optExp.text || optExp.score !== undefined) && (
                <div
                  className={`mt-1 ml-2 rounded border-l-2 pl-3 py-1.5 text-xs leading-relaxed ${
                    isCorrect
                      ? 'border-green-500 text-green-900 dark:text-green-200'
                      : isSelected
                      ? 'border-red-400 text-red-900 dark:text-red-200'
                      : 'border-slate-400 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {optExp.score !== undefined && (
                    <span
                      className={`mr-2 inline-block min-w-[3rem] rounded px-1.5 py-0.5 font-mono font-bold ${
                        isCorrect
                          ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : optExp.score >= 7
                          ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {optExp.score}/10
                    </span>
                  )}
                  {optExp.verdict && <strong>{optExp.verdict}.</strong>} {optExp.text}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {reveal && (
        <div className="rounded border border-slate-300 bg-slate-50 p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
          {!question.optionExplanations && (
            <p className="mb-2">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          )}
          {question.docs.length > 0 && (
            <p>
              <strong>Docs:</strong>{' '}
              {question.docs.map((d, i) => (
                <span key={d.url}>
                  {i > 0 && ', '}
                  <a
                    className="text-camunda underline"
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {d.title}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
