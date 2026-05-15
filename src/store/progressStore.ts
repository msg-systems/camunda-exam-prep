import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExamAttempt, QuestionProgress } from '@/types';

interface ProgressState {
  progress: Record<string, QuestionProgress>;
  attempts: ExamAttempt[];
  recordAnswer: (questionId: string, correct: boolean) => void;
  toggleBookmark: (questionId: string) => void;
  recordAttempt: (attempt: ExamAttempt) => void;
  reset: () => void;
}

const empty: QuestionProgress = {
  attempts: 0,
  correctCount: 0,
  lastAnswerCorrect: null,
  lastSeen: 0,
  bookmarked: false,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      progress: {},
      attempts: [],
      recordAnswer: (questionId, correct) =>
        set((state) => {
          const prev = state.progress[questionId] ?? { ...empty };
          return {
            progress: {
              ...state.progress,
              [questionId]: {
                ...prev,
                attempts: prev.attempts + 1,
                correctCount: prev.correctCount + (correct ? 1 : 0),
                lastAnswerCorrect: correct,
                lastSeen: Date.now(),
              },
            },
          };
        }),
      toggleBookmark: (questionId) =>
        set((state) => {
          const prev = state.progress[questionId] ?? { ...empty };
          return {
            progress: {
              ...state.progress,
              [questionId]: { ...prev, bookmarked: !prev.bookmarked },
            },
          };
        }),
      recordAttempt: (attempt) =>
        set((state) => ({ attempts: [attempt, ...state.attempts].slice(0, 50) })),
      reset: () => set({ progress: {}, attempts: [] }),
    }),
    { name: 'cep-progress-v1' }
  )
);
