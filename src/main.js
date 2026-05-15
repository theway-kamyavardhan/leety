import './input.css';
import { byId, notify, downloadJson } from './utils.js';
import { state, jobs, save, loadState, loadJobs, resetState } from './state.js';
import { loadSheetDataset } from './data/sheets.js';
import { updateThemeButton, toggleTheme } from './ui/theme.js';
import { renderDashboard } from './ui/dashboard.js';
import { saveProblem, resetProblemForm, renderProblems } from './ui/problems.js';
import { renderRevisions } from './ui/revisions.js';
import { saveContest, renderContests } from './ui/contests.js';
import { refreshHackathons, renderHackathons } from './ui/hackathons.js';
import { fetchLeetcode, renderLeetcode } from './ui/leetcode.js';
import { parseJobSummary, saveJob, resetJobForm, renderJobs } from './ui/jobs.js';
import { renderSheets, renderSheetSummary } from './ui/sheets.js';
import { renderWeeklyPlan } from './ui/weekly.js';
import { renderFaangReview } from './ui/faang.js';
import { renderPlanner, saveReferral, saveMock, saveHealth } from './ui/planner.js';
import { saveOpenrouterSettings, clearOpenrouterSettings, runAiCoach, copyAiResponse } from './ui/ai-coach.js';
import { saveResumeSource, clearResumeSource, updateResumeStatus, tailorResume, copyResumeDraft, downloadResumeDraft, importResumeFile } from './ui/resume.js';
import { renderAptitude, startAptitudeTest, submitAptitudeTest, downloadSoulMarkdown } from './ui/aptitude.js';
import { setRenderAll } from './dispatcher.js';
import { DEFAULT_START } from './data/roadmap.js';
import { topics } from './utils.js';
import { aptitudeTopics } from './data/aptitude.js';
import { sheetProblems } from './data/sheets.js';

window.__jobs = jobs;

function renderAll() {
  renderDashboard();
  renderProblems();
  renderRevisions();
  renderContests();
  renderHackathons();
  renderLeetcode();
  renderJobs();
  renderSheets();
  renderSheetSummary();
  renderWeeklyPlan();
  renderFaangReview();
  renderPlanner();
  updateThemeButton();
}

setRenderAll(renderAll);

export function openTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === tab));
  if (tab === 'dashboard') renderDashboard();
  if (tab === 'ai') { byId('runAiBtn').disabled = false; }
  setTimeout(() => {
    const ev = new CustomEvent('tabopened', { detail: tab });
    document.dispatchEvent(ev);
  }, 0);
}

export function init() {
  document.documentElement.classList.toggle('dark', state.settings.theme !== 'light');
  document.documentElement.classList.toggle('light', state.settings.theme === 'light');
  byId('goalInput').value = state.settings.goal || 300;
  byId('leetcodeUsername').value = state.settings.leetcodeUsername || '';
  byId('openrouterModel').value = state.settings.openrouterModel || 'openrouter/auto';
  byId('openrouterStatus').textContent = localStorage.getItem('openrouterApiKey') ? `OpenRouter enabled with model: ${state.settings.openrouterModel}` : `Model: ${state.settings.openrouterModel}. Add a key to enable AI.`;
  byId('aiCoachMode').value = state.settings.aiCoachMode || 'execution';
  byId('problemTopic').innerHTML = topics.map(t => `<option>${t}</option>`).join('');
  const sheetTopics = [...new Set(sheetProblems.map(p => p.topic).filter(Boolean))].sort();
  byId('sheetTopicFilter').innerHTML = '<option value="All">All topics</option>' + sheetTopics.map(t => `<option>${t}</option>`).join('');
  byId('aptitudeTopic').innerHTML = Object.keys(aptitudeTopics).map(t => `<option value="${t}">${t}</option>`).join('');
  byId('problemDate').value = new Date().toISOString().slice(0, 10);
  byId('jobDate').value = new Date().toISOString().slice(0, 10);
  byId('referralDate').value = new Date().toISOString().slice(0, 10);
  byId('mockDate').value = new Date().toISOString().slice(0, 10);
  byId('healthDate').value = new Date().toISOString().slice(0, 10);
  byId('contestDate').value = new Date().toISOString().slice(0, 10);
  updateResumeStatus();
  byId('resumeText').value = state.resume.text || '';
  if (state.resume.lastScore) byId('atsScore').innerHTML = `<p class="text-3xl font-bold">${state.resume.lastScore} <span class="text-sm text-slate-500">Last score</span></p>`;
  loadSheetDataset().then(() => { renderAll(); });
  if (state.leetcodeStats) renderLeetcode();
  if (state.hackathons) renderHackathons();
  else refreshHackathons();
  bindEvents();
  openTab('dashboard');
  notify('Tracker loaded. Welcome back.');
}

function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => openTab(b.dataset.tab)));
  byId('themeToggle').addEventListener('click', toggleTheme);
  byId('problemForm').addEventListener('submit', saveProblem);
  byId('resetProblem').addEventListener('click', resetProblemForm);
  byId('problemSearch').addEventListener('input', renderProblems);
  byId('contestForm').addEventListener('submit', saveContest);
  byId('refreshHackathons').addEventListener('click', refreshHackathons);
  byId('hackathonModeFilter').addEventListener('change', renderHackathons);
  byId('fetchLeetcodeBtn').addEventListener('click', fetchLeetcode);
  byId('jobForm').addEventListener('submit', saveJob);
  byId('resetJob').addEventListener('click', resetJobForm);
  byId('parseJobBtn').addEventListener('click', parseJobSummary);
  byId('jobStatusFilter').addEventListener('change', renderJobs);
  byId('sheetFilter').addEventListener('change', renderSheets);
  byId('sheetTopicFilter').addEventListener('change', renderSheets);
  byId('sheetStatusFilter').addEventListener('change', renderSheets);
  byId('aiCoachMode').addEventListener('change', () => { state.settings.aiCoachMode = byId('aiCoachMode').value; save(); });
  byId('runAiBtn').addEventListener('click', runAiCoach);
  byId('copyAiBtn').addEventListener('click', copyAiResponse);
  byId('saveOpenrouterBtn').addEventListener('click', saveOpenrouterSettings);
  byId('clearOpenrouterBtn').addEventListener('click', clearOpenrouterSettings);
  byId('saveResumeBtn').addEventListener('click', saveResumeSource);
  byId('clearResumeBtn').addEventListener('click', clearResumeSource);
  byId('tailorResumeBtn').addEventListener('click', tailorResume);
  byId('copyDraftBtn').addEventListener('click', copyResumeDraft);
  byId('downloadDraftBtn').addEventListener('click', downloadResumeDraft);
  byId('resumeFile').addEventListener('change', e => { if (e.target.files[0]) importResumeFile(e.target.files[0]); });
  byId('aptitudeTestForm').addEventListener('submit', startAptitudeTest);
  byId('submitAptitudeBtn').addEventListener('click', submitAptitudeTest);
  byId('downloadSoulBtn').addEventListener('click', downloadSoulMarkdown);
  byId('goalInput').addEventListener('change', e => { state.settings.goal = Number(e.target.value) || 300; save(); renderAll(); });
  byId('exportAllBtn').addEventListener('click', () => downloadJson(`dsa-export-${today()}.json`, { ...state, jobs }));
  byId('importFile').addEventListener('change', importAll);
  byId('resetAllBtn').addEventListener('click', () => { if (confirm('Delete ALL local data? This cannot be undone.')) { resetState(); location.reload(); } });
}

function importAll(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.state) { Object.assign(state, data.state); }
      if (data.problems) state.problems = data.problems;
      if (data.contests) state.contests = data.contests;
      if (data.planner) state.planner = data.planner;
      if (data.sheetProgress) state.sheetProgress = data.sheetProgress;
      if (data.resume) state.resume = data.resume;
      if (data.aptitude) state.aptitude = data.aptitude;
      if (data.settings) state.settings = { ...state.settings, ...data.settings };
      if (Array.isArray(data.jobs)) { jobs.length = 0; jobs.push(...data.jobs); }
      save();
      notify('Import complete. Reloading...');
      setTimeout(() => location.reload(), 600);
    } catch (err) { notify('Import failed: invalid file.', 'error'); }
  };
  reader.readAsText(file);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

init();
