import { describe, it, expect, beforeEach } from 'vitest';
import { defaultState, loadState, loadJobs, save, resetState, state, jobs } from '../src/state.js';
import { STORAGE_KEY, JOB_KEY } from '../src/utils.js';

beforeEach(() => {
  localStorage.clear();
  resetState();
});

describe('defaultState', () => {
  it('returns the expected shape', () => {
    const s = defaultState();
    expect(s).toHaveProperty('problems');
    expect(s).toHaveProperty('contests');
    expect(s).toHaveProperty('revisionHistory');
    expect(s).toHaveProperty('planner');
    expect(s).toHaveProperty('sheetProgress');
    expect(s).toHaveProperty('resume');
    expect(s).toHaveProperty('aptitude');
    expect(s).toHaveProperty('settings');
    expect(s.settings).toHaveProperty('goal', 300);
    expect(s.settings).toHaveProperty('theme', 'dark');
  });
});

describe('loadState', () => {
  it('loads saved state', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ problems: [{ id: 'a' }], settings: { goal: 150 } }));
    const s = loadState();
    expect(s.problems).toEqual([{ id: 'a' }]);
    expect(s.settings.goal).toBe(150);
    expect(s.settings.theme).toBe('dark');
  });

  it('returns defaults when localStorage is empty', () => {
    const s = loadState();
    expect(s.problems).toEqual([]);
    expect(s.settings.goal).toBe(300);
  });
});

describe('loadJobs', () => {
  it('loads saved jobs', () => {
    localStorage.setItem(JOB_KEY, JSON.stringify([{ id: 'j1' }]));
    expect(loadJobs()).toEqual([{ id: 'j1' }]);
  });

  it('returns empty array when nothing saved', () => {
    expect(loadJobs()).toEqual([]);
  });
});

describe('save', () => {
  it('persists state and jobs to localStorage', () => {
    state.problems.push({ id: 'p1' });
    jobs.push({ id: 'j1' });
    save();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).problems).toEqual([{ id: 'p1' }]);
    expect(JSON.parse(localStorage.getItem(JOB_KEY))).toEqual([{ id: 'j1' }]);
  });
});

describe('resetState', () => {
  it('clears everything back to defaults', () => {
    state.problems.push({ id: 'p1' });
    jobs.push({ id: 'j1' });
    resetState();
    expect(state.problems).toEqual([]);
    expect(jobs).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(JOB_KEY)).toBeNull();
  });
});
