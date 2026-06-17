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

/**
 * Item kind. The official C8-CP-DV v8.8.0 exam is single-correct only.
 * - 'single' (default): standard 1-of-4 question.
 * - 'negative': still 1-of-4, but the stem asks for the wrong / false one;
 *   the UI shows a banner and the lint requires NOT or FALSE in the stem.
 */
export type QuestionKind = 'single' | 'negative';

/**
 * Optional fenced-code blocks rendered as <pre><code> next to the stem and
 * each option. Keeps FEEL / snippets out of free-text option strings so the
 * UI can typeset them, and so lints don't trip on `backticks` or symbols.
 */
export interface QuestionCodeBlocks {
  stem?: string;
  perOption?: Partial<Record<'a' | 'b' | 'c' | 'd', string>>;
}

export interface Question {
  id: string;
  topic: TopicId;
  subtopic: string;
  difficulty: Difficulty;
  /** Defaults to 'single' when omitted. */
  kind?: QuestionKind;
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
  /** Optional pre-formatted code/FEEL snippets for stem and per-option. */
  codeBlocks?: QuestionCodeBlocks;
  /** Optional inline diagram (BPMN screenshot, etc.). */
  diagramUrl?: string;
  diagramAlt?: string;
  camundaVersion: '8.8';
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
