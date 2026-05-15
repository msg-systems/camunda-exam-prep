import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TopicSelector } from '@/components/TopicSelector';
import { QuestionCard } from '@/components/QuestionCard';
import { getQuestionsByTopic, ALL_QUESTIONS } from '@/data';
import { TOPICS_BY_ID } from '@/data/topics';
import type { TopicId } from '@/types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PracticeMode() {
  const { topicId } = useParams<{ topicId?: string }>();

  if (!topicId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Practice by topic</h1>
        <p className="text-sm text-slate-500">
          Choose a topic. You'll get instant feedback after each answer.
        </p>
        <TopicSelector />
        <div className="text-center">
          <Link to="/practice/all" className="btn btn-primary">
            Practice all topics (random)
          </Link>
        </div>
      </div>
    );
  }

  return <PracticeRunner topicId={topicId} />;
}

function PracticeRunner({ topicId }: { topicId: string }) {
  const questions = useMemo(() => {
    const base = topicId === 'all' ? ALL_QUESTIONS : getQuestionsByTopic(topicId as TopicId);
    return shuffle(base);
  }, [topicId]);

  const [index, setIndex] = useState(0);
  const q = questions[index];
  const topicName = topicId === 'all' ? 'All topics' : TOPICS_BY_ID[topicId as TopicId]?.name ?? topicId;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/practice" className="text-sm text-camunda hover:underline">
          ← Topics
        </Link>
        <span className="text-sm text-slate-500">{topicName}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">All scenarios · randomised</span>
        <span className="text-xs text-slate-400">{questions.length} question(s)</span>
      </div>

      {!q ? (
        <div className="card">
          <p>No questions available for this combination yet.</p>
          <Link to="/practice" className="btn btn-secondary mt-3 inline-block">
            ← Back
          </Link>
        </div>
      ) : (
        <>
          <QuestionCard key={q.id} question={q} number={index + 1} total={questions.length} mode="practice" />
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
