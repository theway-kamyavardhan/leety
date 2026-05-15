import { byId, escapeHtml, notify } from '../utils.js';
import { state } from '../state.js';
import { weeklyRoadmap } from '../data/roadmap.js';
import { getNextDue } from './revisions.js';
import { normalizeProblemName } from '../utils.js';

export function getCurrentRoadmapWeek() {
  const now = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
  return weeklyRoadmap.find(w => new Date(w.start + 'T00:00:00') <= now && now <= new Date(w.end + 'T23:59:59')) || weeklyRoadmap.find(w => now < new Date(w.start + 'T00:00:00')) || weeklyRoadmap[weeklyRoadmap.length - 1];
}

export function isProblemSolvedName(name) {
  const norm = normalizeProblemName(name);
  return state.problems.some(p => normalizeProblemName(p.name) === norm);
}

export function getWeekProblems(week) {
  if (!week.revision) return week.problems;
  const flagged = state.problems.filter(p => p.flag > 1 || getNextDue(p) <= new Date().toISOString().slice(0, 10)).map(p => p.name);
  return [...new Set([...flagged, ...week.problems])].slice(0, week.week === 16 ? 30 : 15);
}

export function getCarryover(currentWeek) {
  return weeklyRoadmap
    .filter(w => w.week < currentWeek.week)
    .flatMap(w => getWeekProblems(w).map(name => ({ name, fromWeek: w.week, topic: w.topics })))
    .filter(item => !isProblemSolvedName(item.name));
}

export function renderWeeklyPlan() {
  const current = getCurrentRoadmapWeek();
  const carryover = getCarryover(current);
  const currentProblems = getWeekProblems(current).filter(name => !isProblemSolvedName(name));
  const combined = [...carryover.map(c => c.name), ...currentProblems];
  const solvedCurrent = getWeekProblems(current).filter(isProblemSolvedName).length;
  const totalCurrent = Math.max(1, getWeekProblems(current).length);
  byId('currentWeekPlan').innerHTML = `
    <p class="text-sm text-slate-500 dark:text-slate-400">Week ${current.week} • ${current.dates}</p>
    <h3 class="mt-1 text-2xl font-bold">${escapeHtml(current.topics)}</h3>
    <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">${escapeHtml(current.notes)}</p>
    <div class="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div class="h-full bg-mint" style="width:${Math.round((solvedCurrent / totalCurrent) * 100)}%"></div></div>
    <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">${solvedCurrent}/${totalCurrent} current-week problems solved. ${carryover.length} carryover item${carryover.length === 1 ? '' : 's'}.</p>
    <div class="mt-4 grid gap-2">${combined.slice(0, 18).map(name => roadmapProblemRow(name)).join('')}</div>`;
  byId('carryoverList').innerHTML = carryover.length ? carryover.slice(0, 20).map(c => roadmapProblemRow(c.name, `Week ${c.fromWeek}`)).join('') : '<p class="text-sm text-slate-500">No carryover. You are current.</p>';
  byId('weeklyPlanTable').innerHTML = weeklyRoadmap.map(w => {
    const problems = getWeekProblems(w);
    const solved = problems.filter(isProblemSolvedName).length;
    const pct = problems.length ? Math.round((solved / problems.length) * 100) : 0;
    return `<tr class="border-t border-slate-200 dark:border-line ${w.week === current.week ? 'bg-blue-50 dark:bg-blue-950/30' : ''}">
      <td class="py-3 font-semibold">Week ${w.week}</td><td>${w.dates}</td><td>${escapeHtml(w.topics)}</td><td>${w.target}</td>
      <td><div class="h-2 w-28 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div class="h-full bg-brand" style="width:${pct}%"></div></div><span class="text-xs text-slate-500">${solved}/${problems.length}</span></td>
      <td>${escapeHtml(w.notes)}</td>
      <td><button class="text-brand" onclick="window.openWeekProblems(${w.week})">View</button></td>
    </tr>`;
  }).join('');
}

export function roadmapProblemRow(name, meta = '') {
  const solved = isProblemSolvedName(name);
  return `<div class="flex items-center justify-between gap-3 rounded-md border border-slate-300 p-2 text-sm dark:border-line">
    <div><span class="${solved ? 'line-through text-slate-500' : 'font-semibold'}">${escapeHtml(name)}</span>${meta ? `<span class="ml-2 text-xs text-slate-500">${escapeHtml(meta)}</span>` : ''}</div>
    <button class="text-brand" onclick="window.addRoadmapProblem(decodeURIComponent('${encodeURIComponent(name)}'))">${solved ? 'Logged' : 'Add'}</button>
  </div>`;
}

window.openWeekProblems = (weekNum) => {
  const week = weeklyRoadmap.find(w => w.week === weekNum);
  if (!week) return;
  byId('carryoverList').innerHTML = getWeekProblems(week).map(name => roadmapProblemRow(name, `Week ${week.week}`)).join('');
  notify(`Week ${week.week} problems loaded in carryover panel.`);
  openTab('weekly');
};

window.addRoadmapProblem = (name) => {
  import('../data/sheets.js').then(({ sheetProblems }) => {
    const sheet = sheetProblems.find(p => normalizeProblemName(p.name) === normalizeProblemName(name));
    if (sheet) {
      window.addSheetToProblem(sheet.id);
      return;
    }
    byId('problemId').value = '';
    byId('problemName').value = name;
    byId('problemNumber').value = '';
    byId('problemDifficulty').value = 'Medium';
    byId('problemTopic').value = 'Other';
    byId('problemDate').value = new Date().toISOString().slice(0, 10);
    byId('problemNotes').value = 'From weekly roadmap.';
    openTab('problems');
    notify('Roadmap problem copied into the entry form.');
  });
};

function openTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === tab));
}
