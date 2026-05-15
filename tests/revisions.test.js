import { describe, it, expect, beforeEach } from 'vitest';
import { resetState, state } from '../src/state.js';
import { getNextDue } from '../src/ui/revisions.js';

describe('getNextDue', () => {
  beforeEach(() => {
    resetState();
  });

  it('returns 7 days after dateSolved for easy-flag first revision', () => {
    const p = { dateSolved: '2026-05-08', flag: 1, lastRevised: null };
    expect(getNextDue(p)).toBe('2026-05-15');
  });

  it('returns 30 days after lastRevised for easy-flag second revision', () => {
    const p = { dateSolved: '2026-05-08', flag: 1, lastRevised: '2026-05-15' };
    expect(getNextDue(p)).toBe('2026-06-14');
  });

  it('returns 1 day after dateSolved for flag > 1', () => {
    const p = { dateSolved: '2026-05-08', flag: 2, lastRevised: null };
    expect(getNextDue(p)).toBe('2026-05-09');
  });

  it('returns 1 day after lastRevised for flag > 1 with lastRevised set', () => {
    const p = { dateSolved: '2026-05-08', flag: 2, lastRevised: '2026-05-10' };
    expect(getNextDue(p)).toBe('2026-05-11');
  });
});
