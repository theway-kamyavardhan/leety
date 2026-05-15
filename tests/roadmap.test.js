import { describe, it, expect } from 'vitest';
import { generateWeeklyRoadmap, DEFAULT_START } from '../src/data/roadmap.js';

describe('generateWeeklyRoadmap', () => {
  it('produces 16 weeks', () => {
    const weeks = generateWeeklyRoadmap();
    expect(weeks).toHaveLength(16);
  });

  it('first week starts from the default start date', () => {
    const weeks = generateWeeklyRoadmap();
    expect(weeks[0].start).toBe(DEFAULT_START);
  });

  it('each week has correct start/end offset', () => {
    const weeks = generateWeeklyRoadmap('2026-05-01');
    expect(weeks[0].start).toBe('2026-05-01');
    expect(weeks[1].start).toBe('2026-05-08');
    expect(weeks[2].start).toBe('2026-05-15');
  });

  it('every week has required fields', () => {
    const weeks = generateWeeklyRoadmap();
    weeks.forEach((w, i) => {
      expect(w.week).toBe(i + 1);
      expect(w.topics).toBeTruthy();
      expect(w.target).toBeTruthy();
      expect(w.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(w.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
