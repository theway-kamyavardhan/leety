import { STORAGE_KEY, JOB_KEY } from './utils.js';

export let charts = {};

export function defaultState() {
  return {
    problems: [],
    contests: [],
    revisionHistory: [],
    planner: {
      checklist: {},
      referrals: [],
      mocks: [],
      health: []
    },
    sheetProgress: {},
    resume: {
      text: '',
      draft: '',
      lastScore: null,
      lastJobDescription: ''
    },
    aptitude: {
      tests: [],
      currentQuiz: [],
      dailyPlan: [],
      weakTopics: {}
    },
    settings: { goal: 300, theme: 'dark', leetcodeUsername: 'thewaykamyavardhan', openrouterModel: 'openrouter/auto', aiCoachMode: 'execution' },
    leetcodeStats: null,
    hackathons: null
  };
}

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const defaults = defaultState();
    return {
      ...defaults,
      ...(saved || {}),
      settings: { ...defaults.settings, ...(saved?.settings || {}) },
      planner: { ...defaults.planner, ...(saved?.planner || {}) },
      sheetProgress: { ...defaults.sheetProgress, ...(saved?.sheetProgress || {}) },
      resume: { ...defaults.resume, ...(saved?.resume || {}) },
      aptitude: { ...defaults.aptitude, ...(saved?.aptitude || {}) }
    };
  } catch { return defaultState(); }
}

export function loadJobs() {
  try { return JSON.parse(localStorage.getItem(JOB_KEY)) || []; } catch { return []; }
}

export let state = loadState();
export let jobs = loadJobs();

export function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(JOB_KEY, JSON.stringify(jobs));
}

export function resetState() {
  state = defaultState();
  jobs = [];
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(JOB_KEY);
}
