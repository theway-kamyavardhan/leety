import { byId, uid, shuffle, escapeHtml, escapeRegExp, notify, fmt, badge } from '../utils.js';
import { state, save } from '../state.js';
import { aptitudeTopics, aptitudeQuestionBank } from '../data/aptitude.js';

export function renderAptitude() {
  state.aptitude = { tests: [], currentQuiz: [], dailyPlan: [], weakTopics: {}, ...(state.aptitude || {}) };
  renderAptitudeSubsections();
  renderAptitudePlan();
}

function renderAptitudeSubsections() {
  const rows = aptitudeQuestionBank.map(q => `<tr class="border-t border-slate-200 dark:border-line"><td class="py-2">${escapeHtml(q.area)}</td><td>${escapeHtml(q.topic)}</td><td>${badge(q.difficulty)}</td><td class="text-xs text-slate-600 dark:text-slate-400">${escapeHtml(q.q)}</td></tr>`).join('');
  byId('aptitudeBankTable').innerHTML = rows || '<tr><td class="py-4 text-center text-sm text-slate-500" colspan="4">No bank items.</td></tr>';
}

function getAptitudeAreaAverage(area) {
  const scores = (state.aptitude.tests || []).filter(t => t.area === area).flatMap(t => t.scores || []);
  return scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : null;
}

function getAptitudeWeakMap() {
  const map = {};
  (state.aptitude.tests || []).forEach(t => { (t.scores || []).forEach(s => { map[t.area] = (map[t.area] || []).concat([s]); }); });
  Object.keys(map).forEach(k => { const arr = map[k]; map[k] = arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : 0; });
  return map;
}

export function renderAptitudePlan() {
  const averages = {};
  Object.keys(aptitudeTopics).forEach(area => { averages[area] = getAptitudeAreaAverage(area); });
  const weakest = Object.entries(averages).filter(([, v]) => v !== null).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([a]) => a);
  const todayPlan = buildAptitudeDailyPlan(weakest, aptitudeTopics);
  byId('aptitudePlanToday').innerHTML = `<p class="text-sm text-slate-500 dark:text-slate-400">${escapeHtml(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }))}</p>
    <div class="mt-2 grid gap-2">${todayPlan.map(item => `<div class="rounded-md border border-slate-300 p-2 text-sm dark:border-line"><p class="font-semibold">${escapeHtml(item.area)}: ${escapeHtml(item.topic)}</p><p class="text-slate-600 dark:text-slate-400">${item.type === 'weak' ? 'Weak area - drill practice' : 'Routine exposure'}</p></div>`).join('')}</div>
    <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">Test and review results weekly.</p>`;
  state.aptitude.dailyPlan = todayPlan;
  save();
  renderAptitudeWeakness();
  renderAptitudeReferences();
}

function buildAptitudeDailyPlan(weakest, aptitudeTopics) {
  const plan = [];
  weakest.forEach(area => {
    const topics = aptitudeTopics[area];
    if (!topics?.length) return;
    const idx = new Date().getDate() % topics.length;
    plan.push({ area, topic: topics[idx], type: 'weak' });
  });
  const other = Object.keys(aptitudeTopics).filter(a => !weakest.includes(a));
  if (!plan.length) other.forEach(area => { const topics = aptitudeTopics[area]; const idx = new Date().getDate() % topics.length; plan.push({ area, topic: topics[idx], type: 'maintenance' }); });
  return plan.slice(0, 3);
}

function renderAptitudeWeakness() {
  const weakMap = getAptitudeWeakMap();
  const items = Object.keys(aptitudeTopics).map(area => {
    const avg = weakMap[area];
    const color = avg == null ? 'text-slate-500' : avg >= 70 ? 'text-mint' : avg >= 50 ? 'text-warn' : 'text-danger';
    return `<div class="rounded-lg border border-slate-300 p-3 dark:border-line"><p class="font-semibold">${area}</p><p class="${color} text-sm">${avg == null ? 'No data' : `${avg}% avg`}</p></div>`;
  });
  byId('aptitudeWeakness').innerHTML = items.join('');
}

function renderAptitudeReferences() {
  const links = [
    { label: 'Indiabix Quantitative Aptitude', url: 'https://www.indiabix.com/aptitude/questions-and-answers/' },
    { label: 'GeeksforGeeks Aptitude', url: 'https://www.geeksforgeeks.org/aptitude/' },
    { label: 'IELTS Academic Reading', url: 'https://www.ielts.org/for-test-takers/sample-test-questions/academic-reading-sample' },
    { label: 'IELTS Academic Writing', url: 'https://www.ielts.org/for-test-takers/sample-test-questions/academic-writing-sample' },
    { label: 'IELTS Listening Practice', url: 'https://www.ielts.org/for-test-takers/sample-test-questions/listening-sample' }
  ];
  byId('aptitudeReferences').innerHTML = links.map(l => `<li class="flex items-center gap-3 rounded-md border border-slate-300 p-3 text-sm dark:border-line"><i class="fa-solid fa-book-open text-brand"></i><a class="text-brand" href="${l.url}" target="_blank" rel="noreferrer">${escapeHtml(l.label)}</a></li>`).join('');
}

export function startAptitudeTest(e) {
  e.preventDefault();
  const area = byId('aptitudeArea').value;
  const count = Math.min(10, Math.max(1, Number(byId('aptitudeCount').value || 5)));
  const pool = aptitudeQuestionBank.filter(q => q.area === area);
  if (!pool.length) { notify(`No questions in bank for ${area}. Add more questions or pick another area.`, 'warn'); return; }
  state.aptitude.currentQuiz = shuffle(pool).slice(0, count).map(q => ({ ...q, selected: null }));
  renderAptitudeQuiz();
  notify(`Started ${count} question${count === 1 ? '' : 's'} for ${area}.`);
}

function generateAiAptitudeTest(area, count) {
  const topics = aptitudeTopics[area];
  return Array.from({ length: count }, (_, i) => {
    const topic = topics[i % topics.length];
    return { area, topic, difficulty: 'Medium', q: `AI-generated ${topic} question ${i + 1}: [This is a simulated question generated by the AI. Replace with real questions as needed.]`, options: ['Option A', 'Option B', 'Option C', 'Option D'], answer: i % 4, explain: 'Simulated explanation. Replace with real questions or connect to an API for live generation.' };
  });
}

function renderAptitudeQuiz() {
  const host = byId('aptitudeQuiz');
  if (!state.aptitude.currentQuiz?.length) { host.innerHTML = '<p class="text-sm text-slate-500">Start a test to see questions.</p>'; return; }
  host.innerHTML = state.aptitude.currentQuiz.map((q, idx) => `
    <fieldset class="rounded-lg border border-slate-300 p-4 dark:border-line">
      <legend class="px-2 text-sm font-semibold text-slate-500">${q.area} • ${escapeHtml(q.topic)} • ${q.difficulty}</legend>
      <p class="mt-1 font-medium">${escapeHtml(q.q)}</p>
      <div class="mt-3 space-y-2">${q.options.map((opt, j) => `<label class="flex items-start gap-3 text-sm"><input type="radio" name="aq_${idx}" value="${j}" ${q.selected === j ? 'checked' : ''} onchange="window.submitAptitudeTest(${idx}, ${j})" /><span>${escapeHtml(opt)}</span></label>`).join('')}</div>
      <p class="mt-2 text-xs text-slate-500">${q.selected === q.answer ? '<span class="text-mint">Correct</span>' : q.selected !== null ? '<span class="text-danger">Incorrect</span>' : ''} ${q.explain ? escapeHtml(q.explain) : ''}</p>
    </fieldset>`).join('');
}

window.submitAptitudeTest = (idx, option) => {
  state.aptitude.currentQuiz[idx].selected = option;
  renderAptitudeQuiz();
};

export function submitAptitudeTest() {
  const quiz = state.aptitude.currentQuiz || [];
  if (!quiz.length) { notify('No active quiz.', 'warn'); return; }
  if (quiz.some(q => q.selected === null)) { notify('Answer all questions before submitting.', 'warn'); return; }
  const correct = quiz.filter(q => q.selected === q.answer).length;
  const score = Math.round((correct / quiz.length) * 100);
  const area = quiz[0].area;
  state.aptitude.tests.push({ id: uid(), date: today(), area, score, total: quiz.length, correct, scores: [score] });
  save();
  notify(`Score: ${correct}/${quiz.length} (${score}%).`);
  renderAptitudePlan();
}

export function downloadSoulMarkdown() {
  const s = state;
  const lines = [`# Personal Project / Tracker Dump - ${today()}`, '', `## DSA Tracker`, `- Total solved: ${s.problems.length}`, `- Difficulty breakdown: Easy ${s.problems.filter(p => p.difficulty === 'Easy').length}, Medium ${s.problems.filter(p => p.difficulty === 'Medium').length}, Hard ${s.problems.filter(p => p.difficulty === 'Hard').length}`, '', `## Job Applications`, `- Total: ${(window.__jobs || []).length}`, '', `## Planner`, `- Referrals: ${s.planner.referrals.length}`, `- Mocks: ${s.planner.mocks.length}`, '-', ''];
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `soul-dump-${today()}.md`;
  a.click();
  URL.revokeObjectURL(url);
  notify('Soul dump downloaded.');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
