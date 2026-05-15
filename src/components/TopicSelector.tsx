import { Link } from 'react-router-dom';
import { TOPICS } from '@/data/topics';
import { getQuestionsByTopic } from '@/data';

export function TopicSelector() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {TOPICS.map((t) => {
        const count = getQuestionsByTopic(t.id).length;
        return (
          <Link
            key={t.id}
            to={`/practice/${t.id}`}
            className="card flex items-start justify-between hover:border-camunda"
          >
            <div>
              <h3 className="font-semibold">{t.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.description}</p>
            </div>
            <div className="ml-3 flex flex-col items-end text-sm">
              <span className="font-bold text-camunda">{t.weight}%</span>
              <span className="text-xs text-slate-400">{count} q</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
