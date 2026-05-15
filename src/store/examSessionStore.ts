import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExamSession } from '@/types';

interface ExamSessionState {
  session: ExamSession | null;
  start: (questionIds: string[], durationMs: number) => void;
  answer: (questionId: string, optionId: 'a' | 'b' | 'c' | 'd' | null) => void;
  flag: (questionId: string, flagged: boolean) => void;
  setIndex: (i: number) => void;
  finish: () => void;
  clear: () => void;
}

export const useExamSessionStore = create<ExamSessionState>()(
  persist(
    (set) => ({
      session: null,
      start: (questionIds, durationMs) =>
        set({
          session: {
            startedAt: Date.now(),
            durationMs,
            questionIds,
            answers: Object.fromEntries(questionIds.map((id) => [id, null])),
            flagged: {},
            currentIndex: 0,
            finished: false,
          },
        }),
      answer: (questionId, optionId) =>
        set((s) =>
          s.session
            ? { session: { ...s.session, answers: { ...s.session.answers, [questionId]: optionId } } }
            : s
        ),
      flag: (questionId, flagged) =>
        set((s) =>
          s.session
            ? { session: { ...s.session, flagged: { ...s.session.flagged, [questionId]: flagged } } }
            : s
        ),
      setIndex: (i) =>
        set((s) => (s.session ? { session: { ...s.session, currentIndex: i } } : s)),
      finish: () => set((s) => (s.session ? { session: { ...s.session, finished: true } } : s)),
      clear: () => set({ session: null }),
    }),
    { name: 'cep-exam-session-v1' }
  )
);
