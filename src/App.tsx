import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { PracticeMode } from '@/modes/PracticeMode';
import { ExamMode } from '@/modes/ExamMode';
import { ReviewMode } from '@/modes/ReviewMode';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { ALL_QUESTIONS } from '@/data';
import {
  EXAM_DURATION_MINUTES,
  EXAM_PASS_PERCENTAGE,
  EXAM_TOTAL_QUESTIONS,
} from '@/data/topics';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded text-sm font-medium ${
    isActive
      ? 'bg-camunda text-white'
      : 'text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-700'
  }`;

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="mr-auto text-lg font-bold">
            <span className="text-camunda">Camunda 8</span> Exam Prep
          </Link>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/practice" className={navClass}>
              Practice
            </NavLink>
            <NavLink to="/exam" className={navClass}>
              Mock exam
            </NavLink>
            <NavLink to="/review" className={navClass}>
              Review
            </NavLink>
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<PracticeMode />} />
          <Route path="/practice/:topicId" element={<PracticeMode />} />
          <Route path="/exam" element={<ExamMode />} />
          <Route path="/review" element={<ReviewMode />} />
          <Route path="/dashboard" element={<ProgressDashboard />} />
        </Routes>
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-slate-400">
        Internal study tool · {ALL_QUESTIONS.length} questions · Not affiliated with Camunda.
      </footer>
    </div>
  );
}

function Home() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Prepare for the Camunda 8 Certified Developer exam.{' '}
          {EXAM_TOTAL_QUESTIONS} questions · {EXAM_DURATION_MINUTES} minutes · pass at{' '}
          {EXAM_PASS_PERCENTAGE}%.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Link to="/practice" className="card hover:border-camunda">
          <h2 className="font-semibold">Practice</h2>
          <p className="text-sm text-slate-500">
            Topic-by-topic with instant feedback and doc links.
          </p>
        </Link>
        <Link to="/exam" className="card hover:border-camunda">
          <h2 className="font-semibold">Mock exam</h2>
          <p className="text-sm text-slate-500">
            Timed, weighted exactly like the real exam blueprint.
          </p>
        </Link>
        <Link to="/review" className="card hover:border-camunda">
          <h2 className="font-semibold">Review</h2>
          <p className="text-sm text-slate-500">
            Re-study questions you got wrong or bookmarked.
          </p>
        </Link>
      </div>
    </div>
  );
}
