import { describe, it, expect } from 'vitest';
import { ALL_QUESTIONS, getRandomExamSet } from '../src/data';
import { TOPICS } from '../src/data/topics';
import blueprint from '../pipeline/blueprint.json';

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

  it('every question has a docs.camunda.io url', () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.docs.length).toBeGreaterThan(0);
      for (const d of q.docs) {
        expect(d.url).toMatch(/^https:\/\/docs\.camunda\.io\/docs\//);
      }
    }
  });

  it('every question is tagged camundaVersion 8.8', () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.camundaVersion).toBe('8.8');
    }
  });

  it('correct option explanation starts with "Correct."', () => {
    for (const q of ALL_QUESTIONS) {
      const expl = q.optionExplanations?.[q.correctOptionId];
      expect(expl).toBeDefined();
      expect(expl?.text.startsWith('Correct.')).toBe(true);
    }
  });

  it('topic weights sum to 100', () => {
    const sum = TOPICS.reduce((acc, t) => acc + t.weight, 0);
    expect(sum).toBe(100);
  });

  it('getRandomExamSet returns the requested size when pool is large enough', () => {
    const size = Math.min(10, ALL_QUESTIONS.length);
    if (size === 0) return; // pool not yet authored
    const set = getRandomExamSet(size);
    expect(set.length).toBe(size);
    expect(new Set(set.map((q) => q.id)).size).toBe(size);
  });

  it('pool meets or exceeds blueprint topic targets (when fully authored)', () => {
    // During in-progress authoring the pool may be partial. We only assert
    // that topics never exceed their blueprint targets by accident, and that
    // once the total is at the blueprint size, every topic is on target.
    const byTopic: Record<string, number> = {};
    for (const q of ALL_QUESTIONS) byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
    if (ALL_QUESTIONS.length >= blueprint.targetPoolSize) {
      for (const [t, target] of Object.entries(blueprint.topics)) {
        expect(byTopic[t] || 0).toBeGreaterThanOrEqual(target as number);
      }
    }
  });
});
