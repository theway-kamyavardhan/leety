import { byId, fmt, uid, notify, escapeHtml } from '../utils.js';
import { state, save } from '../state.js';
import { renderCharts } from './dashboard.js';

export function saveContest(e) {
  e.preventDefault();
  const contest = { id: uid(), date: byId('contestDate').value || today(), solved: Math.min(4, Math.max(0, Number(byId('contestSolved').value || 0))), rank: byId('contestRank').value || null };
  state.contests.push(contest);
  save();
  notify('Contest result saved.');
  byId('contestForm').reset();
  byId('contestDate').value = today();
  renderContests();
  renderCharts();
}

export function renderContests() {
  const rows = [...state.contests].sort((a, b) => b.date.localeCompare(a.date));
  byId('contestTable').innerHTML = rows.map(c => `<tr class="border-t border-slate-200 dark:border-line"><td class="py-3">${fmt(c.date)}</td><td>${c.solved}/4</td><td>${c.rank || '-'}</td><td><button class="text-danger" onclick="window.deleteContest('${c.id}')"><i class="fa-solid fa-trash"></i></button></td></tr>`).join('');
  renderCharts();
}

window.deleteContest = (id) => {
  if (!confirm('Delete this contest entry?')) return;
  state.contests = state.contests.filter(c => c.id !== id);
  save();
  notify('Contest entry deleted.');
  renderContests();
};

function today() {
  return new Date().toISOString().slice(0, 10);
}
