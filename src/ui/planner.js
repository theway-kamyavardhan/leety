import { byId, uid, fmt, badge, escapeHtml, notify } from '../utils.js';
import { state, save } from '../state.js';
import { renderAll } from '../dispatcher.js';

const weeklyTasks = [
  ['dsa_weeknights', 'Mon-Thu: 1 hour DSA, 1 new Medium, 1 revision'],
  ['friday_review', 'Friday: review contest problems or backlog'],
  ['sunday_dsa', 'Sunday 9-11: DSA new topic block'],
  ['sunday_jobs', 'Sunday 11-1: apply to 10-15 remote internships'],
  ['sunday_project', 'Sunday 2-4: project or hackathon improvement'],
  ['sunday_mock', 'Sunday 4-6: mock interview or behavioural prep'],
  ['sunday_review', 'Sunday 6-7: update tracker and plan next week'],
  ['health_rules', 'Daily: 7+ hours sleep, no caffeine after 6 PM, 30 min movement']
];

export function renderPlanner() {
  state.planner = { checklist: {}, referrals: [], mocks: [], health: [], ...(state.planner || {}) };
  byId('weeklyChecklist').innerHTML = weeklyTasks.map(([key, label]) => `
    <label class="flex items-start gap-3 rounded-md border border-slate-300 p-3 text-sm dark:border-line">
      <input type="checkbox" class="mt-1" ${state.planner.checklist[key] ? 'checked' : ''} onchange="window.toggleWeeklyTask('${key}', this.checked)" />
      <span>${escapeHtml(label)}</span>
    </label>`).join('');
  renderMonthlyReview();
  renderReferralList();
  renderMockList();
  renderHealthList();
}

export function renderMonthlyReview() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const inMonth = (date) => date && new Date(date + 'T00:00:00') >= monthStart;
  const monthProblems = state.problems.filter(p => inMonth(p.dateSolved)).length;
  const monthJobs = (window.__jobs || []).filter(j => inMonth(j.applicationDate)).length;
  const monthMocks = state.planner.mocks.filter(m => inMonth(m.date)).length;
  const monthReferrals = state.planner.referrals.filter(r => inMonth(r.date)).length;
  const cards = [
    ['DSA this month', `${monthProblems} solved`, 'Target: roughly 75-100/month for 300-400 by deadline'],
    ['Applications this month', `${monthJobs} sent`, 'Target: 40+/month from Sunday batches'],
    ['Network outreach', `${monthReferrals} logged`, 'Target: 5 per weekend'],
    ['Mock interviews', `${monthMocks} done`, 'Target: weekly from August']
  ];
  byId('monthlyReview').innerHTML = cards.map(([title, value, hint]) => `
    <div class="rounded-lg border border-slate-300 p-4 dark:border-line">
      <p class="text-sm text-slate-500 dark:text-slate-400">${title}</p>
      <p class="mt-1 text-2xl font-bold">${value}</p>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">${hint}</p>
    </div>`).join('');
}

window.toggleWeeklyTask = (key, checked) => {
  state.planner.checklist[key] = checked;
  save();
  notify(checked ? 'Weekly task checked off.' : 'Weekly task reopened.');
};

export function saveReferral(e) {
  e.preventDefault();
  state.planner.referrals.unshift({
    id: uid(),
    name: byId('referralName').value.trim(),
    company: byId('referralCompany').value.trim(),
    date: byId('referralDate').value || today(),
    status: byId('referralStatus').value,
    notes: byId('referralNotes').value.trim()
  });
  save();
  byId('referralForm').reset();
  byId('referralDate').value = today();
  notify('Outreach saved.');
  renderPlanner();
  renderAll();
}

export function renderReferralList() {
  const rows = state.planner.referrals.slice(0, 8);
  byId('referralList').innerHTML = rows.length ? rows.map(r => `
    <div class="flex items-start justify-between gap-3 rounded-md border border-slate-300 p-3 text-sm dark:border-line">
      <div><p class="font-semibold">${escapeHtml(r.name)} ${r.company ? `- ${escapeHtml(r.company)}` : ''}</p><p class="text-slate-600 dark:text-slate-400">${fmt(r.date)} • ${badge(r.status)} ${r.notes ? `• ${escapeHtml(r.notes)}` : ''}</p></div>
      <button class="text-danger" onclick="window.deleteReferral('${r.id}')"><i class="fa-solid fa-trash"></i></button>
    </div>`).join('') : '<p class="text-sm text-slate-500">No outreach logged yet.</p>';
}

window.deleteReferral = (id) => {
  state.planner.referrals = state.planner.referrals.filter(r => r.id !== id);
  save();
  notify('Outreach deleted.');
  renderPlanner();
  renderAll();
};

export function saveMock(e) {
  e.preventDefault();
  state.planner.mocks.unshift({
    id: uid(),
    date: byId('mockDate').value || today(),
    platform: byId('mockPlatform').value.trim(),
    type: byId('mockType').value,
    score: byId('mockScore').value ? Number(byId('mockScore').value) : null,
    wentWell: byId('mockWentWell').value.trim(),
    improve: byId('mockImprove').value.trim()
  });
  save();
  byId('mockForm').reset();
  byId('mockDate').value = today();
  notify('Mock interview saved.');
  renderPlanner();
  renderAll();
}

export function renderMockList() {
  const rows = state.planner.mocks.slice(0, 8);
  byId('mockList').innerHTML = rows.length ? rows.map(m => `
    <div class="flex items-start justify-between gap-3 rounded-md border border-slate-300 p-3 text-sm dark:border-line">
      <div><p class="font-semibold">${fmt(m.date)} • ${escapeHtml(m.type)} ${m.score ? `• ${m.score}/10` : ''}</p><p class="text-slate-600 dark:text-slate-400">${escapeHtml(m.platform || 'Mock interview')} ${m.improve ? `• Improve: ${escapeHtml(m.improve)}` : ''}</p></div>
      <button class="text-danger" onclick="window.deleteMock('${m.id}')"><i class="fa-solid fa-trash"></i></button>
    </div>`).join('') : '<p class="text-sm text-slate-500">No mock interviews logged yet.</p>';
}

window.deleteMock = (id) => {
  state.planner.mocks = state.planner.mocks.filter(m => m.id !== id);
  save();
  notify('Mock deleted.');
  renderPlanner();
  renderAll();
};

export function saveHealth(e) {
  e.preventDefault();
  state.planner.health.unshift({
    id: uid(),
    date: byId('healthDate').value || today(),
    sleepHours: Number(byId('sleepHours').value || 0),
    prepHours: Number(byId('prepHours').value || 0),
    notes: byId('healthNotes').value.trim()
  });
  save();
  byId('healthForm').reset();
  byId('healthDate').value = today();
  notify('Health check-in saved.');
  renderPlanner();
  renderAll();
}

export function renderHealthList() {
  const rows = state.planner.health.slice(0, 8);
  byId('healthList').innerHTML = rows.length ? rows.map(h => `
    <div class="flex items-start justify-between gap-3 rounded-md border border-slate-300 p-3 text-sm dark:border-line">
      <div><p class="font-semibold">${fmt(h.date)} • Sleep ${h.sleepHours || 0}h • Prep ${h.prepHours || 0}h</p><p class="text-slate-600 dark:text-slate-400">${escapeHtml(h.notes || 'No notes')}</p></div>
      <button class="text-danger" onclick="window.deleteHealth('${h.id}')"><i class="fa-solid fa-trash"></i></button>
    </div>`).join('') : '<p class="text-sm text-slate-500">No health check-ins yet.</p>';
}

window.deleteHealth = (id) => {
  state.planner.health = state.planner.health.filter(h => h.id !== id);
  save();
  notify('Health check-in deleted.');
  renderPlanner();
  renderAll();
};

export function getFollowUpJobs() {
  const now = new Date(today() + 'T00:00:00');
  return (window.__jobs || []).filter(j => ['Applied', 'Interviewing'].includes(j.status)).filter(j => {
    const d = new Date((j.applicationDate || today()) + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    return d <= now;
  });
}

export function getHealthSignal() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const recent = (state.planner.health || []).filter(h => new Date(h.date + 'T00:00:00') >= cutoff);
  if (!recent.length) return { label: 'Good', detail: 'Log sleep and prep hours in Planner' };
  const avgSleep = recent.reduce((sum, h) => sum + (h.sleepHours || 0), 0) / recent.length;
  const prep = recent.reduce((sum, h) => sum + (h.prepHours || 0), 0);
  const internship = 60;
  const load = internship + prep;
  if (avgSleep && avgSleep < 6.5) return { label: 'Rest', detail: `Avg sleep ${avgSleep.toFixed(1)}h. Protect recovery.` };
  if (load > 50) return { label: 'High', detail: `${load.toFixed(1)}h estimated weekly load. Watch burnout.` };
  return { label: 'Good', detail: `Avg sleep ${avgSleep.toFixed(1)}h, prep ${prep.toFixed(1)}h/week.` };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
