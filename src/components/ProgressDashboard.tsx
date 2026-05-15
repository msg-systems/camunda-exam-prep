import { useProgressStore } from '@/store/progressStore';
import { ALL_QUESTIONS } from '@/data';
import { TOPICS } from '@/data/topics';

export function ProgressDashboard() {
  const progress = useProgressStore((s) => s.progress);
  const attempts = useProgressStore((s) => s.attempts);

  const seen = Object.keys(progress).length;
  const correctEver = Object.values(progress).filter((p) => p.lastAnswerCorrect).length;
  const bookmarks = Object.values(progress).filter((p) => p.bookmarked).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total questions" value={ALL_QUESTIONS.length} />
        <Stat label="Questions seen" value={seen} />
        <Stat label="Last answer correct" value={correctEver} />
        <Stat label="Bookmarked" value={bookmarks} />
      </div>

      <div className="card">
        <h3 className="mb-3 font-semibold">Per-topic coverage</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="pb-2">Topic</th>
              <th className="pb-2">Weight</th>
              <th className="pb-2">Pool</th>
              <th className="pb-2">Seen</th>
            </tr>
          </thead>
          <tbody>
            {TOPICS.map((t) => {
              const pool = ALL_QUESTIONS.filter((q) => q.topic === t.id);
              const seenCount = pool.filter((q) => progress[q.id]?.attempts).length;
              return (
                <tr key={t.id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="py-1.5">{t.name}</td>
                  <td>{t.weight}%</td>
                  <td>{pool.length}</td>
                  <td>{seenCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="mb-3 font-semibold">Recent exam attempts</h3>
        {attempts.length === 0 ? (
          <p className="text-sm text-slate-500">No exams completed yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="pb-2">Date</th>
                <th className="pb-2">Score</th>
                <th className="pb-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {attempts.slice(0, 10).map((a) => (
                <tr key={a.id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="py-1.5">{new Date(a.startedAt).toLocaleString()}</td>
                  <td>
                    {a.correctQuestions}/{a.totalQuestions} ({a.score.toFixed(1)}%)
                  </td>
                  <td className={a.passed ? 'text-green-600' : 'text-red-600'}>
                    {a.passed ? 'Pass' : 'Fail'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <div className="text-2xl font-bold text-camunda">{value}</div>
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}
