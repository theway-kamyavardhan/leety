import { byId, fmt, uid, badge, notify, escapeHtml } from '../utils.js';
import { state, save } from '../state.js';
import { renderAll } from '../dispatcher.js';

export function saveProblem(e) {
  e.preventDefault();
  const id = byId('problemId').value || uid();
  const existing = state.problems.find(p => p.id === id);
  const problem = {
    id,
    name: byId('problemName').value.trim(),
    number: Number(byId('problemNumber').value),
    difficulty: byId('problemDifficulty').value,
    topic: byId('problemTopic').value,
    dateSolved: byId('problemDate').value || today(),
    timeTaken: byId('problemTime').value ? Number(byId('problemTime').value) : null,
    notes: byId('problemNotes').value.trim(),
    flag: Number(byId('problemFlag').value),
    lastRevised: existing?.lastRevised || null
  };
  if (existing) state.problems = state.problems.map(p => p.id === id ? problem : p);
  else state.problems.push(problem);
  save();
  notify(existing ? 'Problem updated.' : 'Problem saved.');
  resetProblemForm();
  renderAll();
  openTab('problems');
}

export function resetProblemForm() {
  byId('problemForm').reset();
  byId('problemId').value = '';
  byId('problemDate').value = today();
}

export function renderProblems() {
  const query = byId('problemSearch')?.value?.toLowerCase() || '';
  const rows = state.problems
    .filter(p => [p.name, p.topic, p.difficulty, String(p.number)].join(' ').toLowerCase().includes(query))
    .sort((a, b) => b.dateSolved.localeCompare(a.dateSolved) || b.number - a.number);
  byId('problemTable').innerHTML = rows.map(p => `
    <tr class="border-t border-slate-200 dark:border-line">
      <td class="py-3">${p.number}</td><td class="font-semibold">${escapeHtml(p.name)}</td>
      <td>${badge(p.difficulty)}</td><td>${escapeHtml(p.topic)}</td><td>${fmt(p.dateSolved)}</td>
      <td>${p.timeTaken ? `${p.timeTaken}m` : '-'}</td><td>${flagLabel(p.flag)}</td>
      <td class="space-x-2"><button class="text-brand" onclick="window.editProblem('${p.id}')"><i class="fa-solid fa-pen"></i></button><button class="text-danger" onclick="window.deleteProblem('${p.id}')"><i class="fa-solid fa-trash"></i></button></td>
    </tr>`).join('');
  byId('problemEmpty').classList.toggle('hidden', rows.length > 0);
}

window.editProblem = (id) => {
  const p = state.problems.find(x => x.id === id);
  if (!p) return;
  byId('problemId').value = p.id;
  byId('problemName').value = p.name;
  byId('problemNumber').value = p.number;
  byId('problemDifficulty').value = p.difficulty;
  byId('problemTopic').value = p.topic;
  byId('problemDate').value = p.dateSolved;
  byId('problemTime').value = p.timeTaken || '';
  byId('problemFlag').value = p.flag;
  byId('problemNotes').value = p.notes || '';
  openTab('problems');
};

window.deleteProblem = (id) => {
  if (!confirm('Delete this problem?')) return;
  state.problems = state.problems.filter(p => p.id !== id);
  save();
  notify('Problem deleted.');
  renderAll();
};

export function flagLabel(flag) {
  return flag === 1 ? 'Easy' : flag === 2 ? 'Struggled' : 'Could not solve';
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function openTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === tab));
  setTimeout(() => {
    const ev = new CustomEvent('tabopened', { detail: tab });
    document.dispatchEvent(ev);
  }, 0);
}
