import { vi } from 'vitest';

const store = {};

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { for (const key in store) delete store[key]; }
  },
  writable: true
});

beforeEach(() => {
  globalThis.localStorage.clear();
});
