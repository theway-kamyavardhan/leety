import { byId, fmt, uid, badge, escapeHtml, notify } from '../utils.js';
import { state, save } from '../state.js';
import { renderAll } from '../dispatcher.js';

export function getNextDue(problem) {
  const base = problem.lastRevised || problem.dateSolved;
  const days = problem.flag === 1 ? (problem.lastRevised ? 30 : 7) : 1;
  const [y, m, d] = base.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function renderRevisions() {
  const due = state.problems.filter(p => getNextDue(p) <= today()).sort((a, b) => getNextDue(a).localeCompare(getNextDue(b)));
  byId('revisionList').innerHTML = due.map(p => `
    <div class="rounded-lg border border-slate-300 p-4 dark:border-line">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p class="font-bold">#${p.number} ${escapeHtml(p.name)}</p><p class="text-sm text-slate-600 dark:text-slate-400">${escapeHtml(p.topic)} • ${badge(p.difficulty)} • Due ${fmt(getNextDue(p))}</p></div>
        <button class="rounded-md bg-mint px-3 py-2 text-sm font-semibold text-white" onclick="window.markRevisionDone('${p.id}')"><i class="fa-solid fa-check mr-2"></i>Done</button>
      </div>
    </div>`).join('');
  byId('revisionEmpty').classList.toggle('hidden', due.length > 0);
}

window.markRevisionDone = (id) => {
  const p = state.problems.find(x => x.id === id);
  if (!p) return;
  p.lastRevised = today();
  state.revisionHistory.push({ id: uid(), problemId: id, date: today() });
  save();
  notify('Revision marked done. Next due date recalculated.');
  renderAll();
};

function today() {
  return new Date().toISOString().slice(0, 10);
}
