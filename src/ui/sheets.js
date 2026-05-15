import { byId, uid, badge, escapeHtml, escapeAttr, notify } from '../utils.js';
import { state, save } from '../state.js';
import { sheetProblems } from '../data/sheets.js';
import { renderAll } from '../dispatcher.js';

export function renderSheets() {
  const sheetFilter = byId('sheetFilter')?.value || 'All';
  const topicFilter = byId('sheetTopicFilter')?.value || 'All';
  const statusFilter = byId('sheetStatusFilter')?.value || 'All';
  const rows = sheetProblems.filter(p => {
    const done = Boolean(state.sheetProgress[p.id]);
    return (sheetFilter === 'All' || p.sheet === sheetFilter)
      && (topicFilter === 'All' || p.topic === topicFilter)
      && (statusFilter === 'All' || (statusFilter === 'Done' ? done : !done));
  });
  byId('sheetTable').innerHTML = rows.map(p => `
    <tr class="border-t border-slate-200 dark:border-line">
      <td class="py-3"><input type="checkbox" ${state.sheetProgress[p.id] ? 'checked' : ''} onchange="window.toggleSheetProblem('${p.id}', this.checked)" /></td>
      <td>${escapeHtml(p.sheet)}</td>
      <td class="font-semibold"><a class="text-brand" href="${escapeAttr(p.url)}" target="_blank" rel="noreferrer">${p.number ? `#${p.number} ` : ''}${escapeHtml(p.name)}</a></td>
      <td>${badge(p.difficulty)}</td>
      <td>${escapeHtml(p.topic)}</td>
      <td class="space-x-2">
        <button class="text-brand" onclick="window.addSheetToProblem('${p.id}')" title="Add to Problems"><i class="fa-solid fa-plus"></i></button>
        <a class="text-slate-500 dark:text-slate-400" href="${escapeAttr(p.url)}" target="_blank" rel="noreferrer" title="Open problem"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
      </td>
    </tr>`).join('');
  byId('sheetEmpty').classList.toggle('hidden', rows.length > 0);
  renderSheetSummary();
}

export function renderSheetSummary() {
  const names = ['NeetCode 150', 'Striver SDE Sheet'];
  byId('sheetSummary').innerHTML = names.map(name => {
    const list = sheetProblems.filter(p => p.sheet === name);
    const done = list.filter(p => state.sheetProgress[p.id]).length;
    const pct = list.length ? Math.round((done / list.length) * 100) : 0;
    return `
      <div class="rounded-lg border border-slate-300 p-3 dark:border-line">
        <div class="flex items-center justify-between gap-3"><p class="font-semibold">${name}</p><p class="text-sm text-slate-500">${done}/${list.length}</p></div>
        <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div class="h-full bg-brand" style="width:${pct}%"></div></div>
        <p class="mt-1 text-xs text-slate-500">${pct}% complete in built-in starter set</p>
      </div>`;
  }).join('');
}

window.toggleSheetProblem = (id, done) => {
  state.sheetProgress[id] = done;
  const p = sheetProblems.find(x => x.id === id);
  if (done && p && !state.problems.some(item => item.number === p.number)) {
    state.problems.push({
      id: uid(),
      name: p.name,
      number: p.number,
      difficulty: p.difficulty,
      topic: p.topic,
      dateSolved: new Date().toISOString().slice(0, 10),
      timeTaken: null,
      notes: `Marked done from ${p.sheet}.`,
      flag: 1,
      lastRevised: null
    });
  }
  save();
  notify(done ? 'Sheet problem marked done.' : 'Sheet problem marked pending.');
  renderAll();
};

window.addSheetToProblem = (id) => {
  const p = sheetProblems.find(x => x.id === id);
  if (!p) return;
  byId('problemId').value = '';
  byId('problemName').value = p.name;
  byId('problemNumber').value = p.number || '';
  byId('problemDifficulty').value = p.difficulty;
  byId('problemTopic').value = p.topic;
  byId('problemDate').value = new Date().toISOString().slice(0, 10);
  byId('problemTime').value = '';
  byId('problemFlag').value = '1';
  byId('problemNotes').value = `From ${p.sheet}: ${p.url}`;
  openTab('problems');
  notify('Problem copied into the entry form.');
};

function openTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === tab));
}
