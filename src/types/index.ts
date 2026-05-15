export type TopicId =
  | 'modeling'
  | 'configuring-processes'
  | 'decisions-business-rules'
  | 'forms'
  | 'connectors'
  | 'extensions-integrations'
  | 'managing-development'
  | 'dev-environment';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DocLink {
  title: string;
  url: string;
}

export interface Option {
  id: 'a' | 'b' | 'c' | 'd';
  text: string;
}

export interface OptionExplanation {
  /** Short verdict like "Correct", "Wrong direction". */
  verdict?: string;
  /** Per-option explanation body. */
  text: string;
  /** 1-10 score from the source markdown. */
  score?: number;
}

export type QuestionStyle = 'recall' | 'scenario';

export interface Question {
  id: string;
  topic: TopicId;
  subtopic: string;
  difficulty: Difficulty;
  /** Long scenario context (Context / Action / Condition). Optional. */
  scenario?: string;
  /** Defaults to 'recall' when omitted. */
  style?: QuestionStyle;
  question: string;
  options: Option[];
  correctOptionId: 'a' | 'b' | 'c' | 'd';
  /** Aggregated explanation (legacy / fallback). */
  explanation: string;
  /** Per-option explanation, when source provides it. */
  optionExplanations?: Partial<Record<'a' | 'b' | 'c' | 'd', OptionExplanation>>;
  docs: DocLink[];
  tags?: string[];
  camundaVersion?: string;
}

export interface TopicMeta {
  id: TopicId;
  name: string;
  weight: number; // percentage of exam
  description: string;
}

export interface QuestionProgress {
  attempts: number;
  correctCount: number;
  lastAnswerCorrect: boolean | null;
  lastSeen: number; // epoch ms
  bookmarked: boolean;
}

export interface ExamAttempt {
  id: string;
  startedAt: number;
  finishedAt: number;
  score: number; // percentage 0-100
  passed: boolean;
  totalQuestions: number;
  correctQuestions: number;
  byTopic: Partial<Record<TopicId, { correct: number; total: number }>>;
  questionResults: { questionId: string; selectedOptionId: string | null; correct: boolean }[];
}

export interface ExamSession {
  startedAt: number;
  durationMs: number;
  questionIds: string[];
  answers: Record<string, 'a' | 'b' | 'c' | 'd' | null>;
  flagged: Record<string, boolean>;
  currentIndex: number;
  finished: boolean;
}
