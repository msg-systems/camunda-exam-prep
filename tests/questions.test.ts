import { describe, it, expect } from 'vitest';
import { ALL_QUESTIONS, getRandomExamSet } from '../src/data';
import { TOPICS } from '../src/data/topics';

describe('Question pool', () => {
  it('has unique question ids', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions reference a known topic', () => {
    const topicIds = new Set(TOPICS.map((t) => t.id));
    for (const q of ALL_QUESTIONS) {
      expect(topicIds.has(q.topic)).toBe(true);
    }
  });

  it('every question has 4 options with id a-d', () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.options).toHaveLength(4);
      const ids = q.options.map((o) => o.id).sort().join(',');
      expect(ids).toBe('a,b,c,d');
    }
  });

  it('correctOptionId resolves to one of the options', () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.options.find((o) => o.id === q.correctOptionId)).toBeDefined();
    }
  });

  it('every question has at least one doc link with https url', () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.docs.length).toBeGreaterThan(0);
      for (const d of q.docs) {
        expect(d.url).toMatch(/^https?:\/\//);
      }
    }
  });

  it('topic weights sum to 100', () => {
    const sum = TOPICS.reduce((acc, t) => acc + t.weight, 0);
    expect(sum).toBe(100);
  });

  it('getRandomExamSet returns the requested size when pool is large enough', () => {
    const size = Math.min(10, ALL_QUESTIONS.length);
    const set = getRandomExamSet(size);
    expect(set.length).toBe(size);
    expect(new Set(set.map((q) => q.id)).size).toBe(size);
  });
});
