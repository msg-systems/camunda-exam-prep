import type { Question, TopicId } from '@/types';
import { TOPICS, EXAM_TOTAL_QUESTIONS } from '@/data/topics';

import pool from '@/data/questions/pool.json';

const RAW: Question[] = pool as Question[];

const VALID_KINDS = new Set(['single', 'negative']);

function validate(qs: Question[]): Question[] {
  const ids = new Set<string>();
  for (const q of qs) {
    if (ids.has(q.id)) throw new Error(`Duplicate question id: ${q.id}`);
    ids.add(q.id);
    if (!['a', 'b', 'c', 'd'].includes(q.correctOptionId)) {
      throw new Error(`Invalid correctOptionId in ${q.id}`);
    }
    if (q.options.length !== 4) {
      throw new Error(`Question ${q.id} must have exactly 4 options`);
    }
    if (!q.options.find((o) => o.id === q.correctOptionId)) {
      throw new Error(`Question ${q.id} correctOptionId not in options`);
    }
    if (q.kind !== undefined && !VALID_KINDS.has(q.kind)) {
      throw new Error(`Question ${q.id} has invalid kind="${q.kind}"`);
    }
  }
  return qs;
}

export const ALL_QUESTIONS: Question[] = validate(RAW);

export function getQuestionsByTopic(topic: TopicId): Question[] {
  return ALL_QUESTIONS.filter((q) => q.topic === topic);
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a weighted random exam set of EXAM_TOTAL_QUESTIONS questions
 * matching the official 8.8 blueprint distribution. Falls back gracefully
 * if a topic does not have enough questions yet.
 */
export function getRandomExamSet(size: number = EXAM_TOTAL_QUESTIONS): Question[] {
  const picked: Question[] = [];
  const used = new Set<string>();

  let allocated = 0;
  const allocations: { topic: TopicId; count: number }[] = TOPICS.map((t) => {
    const count = Math.round((t.weight / 100) * size);
    allocated += count;
    return { topic: t.id, count };
  });

  let drift = size - allocated;
  let i = 0;
  while (drift !== 0 && allocations.length > 0) {
    allocations[i % allocations.length].count += drift > 0 ? 1 : -1;
    drift += drift > 0 ? -1 : 1;
    i++;
  }

  for (const { topic, count } of allocations) {
    const topicPool = shuffle(getQuestionsByTopic(topic));
    for (const q of topicPool) {
      if (picked.length >= size) break;
      if (used.has(q.id)) continue;
      picked.push(q);
      used.add(q.id);
      if (picked.filter((p) => p.topic === topic).length >= count) break;
    }
  }

  if (picked.length < size) {
    const fillers = shuffle(ALL_QUESTIONS.filter((q) => !used.has(q.id)));
    for (const q of fillers) {
      if (picked.length >= size) break;
      picked.push(q);
      used.add(q.id);
    }
  }

  return shuffle(picked);
}
