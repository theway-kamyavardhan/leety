import { byId, notify, escapeHtml } from '../utils.js';
import { state, save } from '../state.js';
import { countBy } from '../utils.js';
import { getFollowUpJobs, getHealthSignal } from './planner.js';
import { sheetProblems } from '../data/sheets.js';
import { topics } from '../utils.js';

export function saveOpenrouterSettings() {
  const key = byId('openrouterKey').value.trim();
  const model = byId('openrouterModel').value.trim() || 'openrouter/auto';
  if (key) localStorage.setItem('openrouterApiKey', key);
  state.settings.openrouterModel = model;
  byId('openrouterKey').value = '';
  byId('openrouterStatus').textContent = localStorage.getItem('openrouterApiKey') ? `OpenRouter enabled with model: ${model}` : `Model saved: ${model}. Add a key to enable AI.`;
  save();
  notify('OpenRouter settings saved locally.');
}

export function clearOpenrouterSettings() {
  localStorage.removeItem('openrouterApiKey');
  byId('openrouterKey').value = '';
  byId('openrouterStatus').textContent = 'OpenRouter key cleared from this browser.';
  notify('OpenRouter key cleared.');
}

window.fillAiPrompt = (type) => {
  const prompts = {
    weekly: 'Create my next 7-day execution plan. Respect my 10 AM-8 PM internship, Mon-Sat. Give exact daily blocks, minimum viable tasks for low-energy days, and a Sunday deep-work plan.',
    dsa: 'Analyze my DSA and sheet progress. Pick the next 10 problems/topics I should do, explain why, and give a 7-day schedule with revision built in.',
    jobs: 'Analyze my job applications and skills. Build a paid remote internship application sprint: target roles, follow-ups due, resume positioning, and exact outreach priorities.',
    review: 'Run a monthly review. Score DSA, jobs, sheets, contests, mocks, referrals, projects, and health. Tell me what is behind and the top 5 corrections for next week.',
    mock: 'Prepare me for a mock interview this Sunday. Pick likely DSA patterns from my weak areas, give a 90-minute practice plan, and include 5 behavioural questions in STAR format.',
    burnout: 'Audit my workload and burnout risk. Keep the plan ambitious but sustainable. Tell me what to cut, what to protect, and the minimum plan for a bad week.'
  };
  const modeByPrompt = { weekly: 'execution', dsa: 'dsa', jobs: 'career', review: 'review', mock: 'dsa', burnout: 'strict' };
  byId('aiCoachMode').value = modeByPrompt[type] || 'execution';
  state.settings.aiCoachMode = byId('aiCoachMode').value;
  save();
  byId('aiPrompt').value = prompts[type] || prompts.weekly;
  openTab('ai');
};

export function buildAiContext() {
  const diff = countBy(state.problems, 'difficulty');
  const topic = countBy(state.problems, 'topic');
  const jobStatus = countBy(window.__jobs || [], 'status');
  const dueRevisionItems = state.problems.filter(p => getNextDue(p) <= new Date().toISOString().slice(0, 10)).slice(0, 12).map(p => ({ number: p.number, name: p.name, topic: p.topic, difficulty: p.difficulty, flag: p.flag }));
  const followUpItems = getFollowUpJobs().slice(0, 10).map(j => ({ title: j.title, company: j.company, status: j.status, applicationDate: j.applicationDate, skills: j.skills || [] }));
  const health = getHealthSignal();
  const sheetDoneIds = Object.entries(state.sheetProgress || {}).filter(([, done]) => done).map(([id]) => id);
  const sheetStats = ['NeetCode 150', 'Striver SDE Sheet'].reduce((acc, sheet) => {
    const list = sheetProblems.filter(p => p.sheet === sheet);
    const done = list.filter(p => state.sheetProgress[p.id]).length;
    acc[sheet] = { done, totalInApp: list.length, percent: list.length ? Math.round((done / list.length) * 100) : 0 };
    return acc;
  }, {});
  const weakTopics = topics.map(t => ({ topic: t, solved: topic[t] || 0, sheetPending: sheetProblems.filter(p => p.topic === t && !state.sheetProgress[p.id]).length })).sort((a, b) => (a.solved - b.solved) || (b.sheetPending - a.sheetPending)).slice(0, 6);
  const recentProblems = [...state.problems].sort((a, b) => b.dateSolved.localeCompare(a.dateSolved)).slice(0, 10).map(p => ({ number: p.number, name: p.name, topic: p.topic, difficulty: p.difficulty, flag: p.flag, dateSolved: p.dateSolved }));
  const deadline = new Date('2026-08-31T00:00:00');
  const daysLeft = Math.max(0, Math.ceil((deadline - new Date()) / 86400000));
  const goal = Number(state.settings.goal) || 300;
  return {
    date: new Date().toISOString().slice(0, 10),
    coachMode: byId('aiCoachMode')?.value || state.settings.aiCoachMode || 'execution',
    dsa: { totalSolved: state.problems.length, goal, daysLeft, requiredPerDay: daysLeft ? Number((Math.max(0, goal - state.problems.length) / daysLeft).toFixed(2)) : 0, difficulty: diff, topics: topic, weakTopics, recentProblems, dueRevisions: dueRevisionItems.length, dueRevisionItems },
    sheets: { stats: sheetStats, doneCount: sheetDoneIds.length, totalInApp: sheetProblems.length, nextPending: sheetProblems.filter(p => !state.sheetProgress[p.id]).slice(0, 12).map(p => ({ sheet: p.sheet, number: p.number, name: p.name, topic: p.topic, difficulty: p.difficulty })) },
    jobs: { total: (window.__jobs || []).length, status: jobStatus, followUpsDue: followUpItems.length, followUpItems, recentSkills: [...new Set((window.__jobs || []).flatMap(j => j.skills || []))].slice(0, 20) },
    planner: { referrals: state.planner.referrals.length, recentReferrals: state.planner.referrals.slice(0, 6).map(r => ({ name: r.name, company: r.company, status: r.status, date: r.date })), mocks: state.planner.mocks.length, recentMocks: state.planner.mocks.slice(0, 4).map(m => ({ date: m.date, type: m.type, score: m.score, improve: m.improve })), healthSignal: health },
    constraints: { internship: '10 AM to 8 PM, Monday to Saturday', availableWeeknights: '60-90 minutes after 8 PM', sundayCapacity: '6-7 hours in focused blocks', deadline: 'August 31, 2026', goals: ['300-400 DSA problems', 'paid remote internships', 'hackathons', 'project improvements', 'placements'] }
  };
}

function getNextDue(problem) {
  const base = problem.lastRevised || problem.dateSolved;
  const days = problem.flag === 1 ? (problem.lastRevised ? 30 : 7) : 1;
  const date = new Date(base + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function runAiCoach() {
  const apiKey = localStorage.getItem('openrouterApiKey');
  const model = byId('openrouterModel').value.trim() || state.settings.openrouterModel || 'openrouter/auto';
  const mode = byId('aiCoachMode').value || 'execution';
  const prompt = byId('aiPrompt').value.trim();
  if (!prompt) { notify('Write a prompt or choose a quick prompt.', 'warn'); return; }
  state.settings.openrouterModel = model;
  state.settings.aiCoachMode = mode;
  save();
  byId('aiOutput').textContent = 'Thinking...';
  byId('runAiBtn').disabled = true;
  try {
    const context = buildAiContext();
    const res = apiKey
      ? await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': location.origin, 'X-Title': 'DSA Grind Tracker' }, body: JSON.stringify({ model, messages: makeAiMessages(context, prompt, mode), temperature: 0.4 }) })
      : await fetch('/api/ai-coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, context, prompt, mode }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || data?.message || 'OpenRouter request failed');
    byId('aiOutput').textContent = data.reply || data.choices?.[0]?.message?.content || 'No response returned.';
    notify('AI coach response generated.');
  } catch (err) {
    byId('aiOutput').textContent = `AI request failed: ${err.message}\n\nFor Vercel, set OPENROUTER_API_KEY in Project Settings > Environment Variables. For local testing, paste a key in OpenRouter Setup or run the server with OPENROUTER_API_KEY set.`;
    notify('AI request failed.', 'error');
  } finally {
    byId('runAiBtn').disabled = false;
  }
}

function makeAiMessages(context, prompt, mode = 'execution') {
  const modeInstructions = { execution: 'Focus on calendar realism, sequence, time boxing, minimum viable actions, and next 7 days.', dsa: 'Focus on pattern recognition, sheet order, weak topics, revision, and problem selection. Be specific about problem names.', career: 'Focus on paid remote internship strategy, role targeting, follow-ups, skills positioning, and referral/outreach copy.', review: 'Act like a monthly performance reviewer. Score each area, identify drift, and prescribe corrections.', strict: 'Be direct. Protect sleep and sustainability while cutting low-ROI work. Call out overcommitment.' };
  return [{ role: 'system', content: `You are an elite execution coach for a 3rd-year CS student targeting placements, paid remote internships, DSA growth, hackathons, and strong projects.\n\nNon-negotiables:\n- Use only the tracker context and the user's request. If data is missing, say what to log next.\n- Respect the 10 AM-8 PM internship constraint and do not overload weeknights.\n- Prefer concrete next actions over motivation.\n- Include revision, follow-ups, and recovery when relevant.\n- Do not invent solved counts, companies, or contest results.\n\nCoach mode: ${mode}. ${modeInstructions[mode] || modeInstructions.execution}\n\nResponse format:\n1. Verdict: 2-3 lines on current state.\n2. Priority Stack: top 3 priorities in order.\n3. Exact Plan: day-by-day or step-by-step actions with time boxes.\n4. Risks: what can derail the plan and how to prevent it.\n5. Next 5 Actions: checklist for the next 24-48 hours.` }, { role: 'user', content: `Tracker context:\n${JSON.stringify(context, null, 2)}\n\nUser request:\n${prompt}\n\nReturn a concise but complete answer. Use bullets and tables only where they improve execution.` }];
}

export async function copyAiResponse() {
  const text = byId('aiOutput').textContent.trim();
  if (!text || text === 'AI responses will appear here.') { notify('No AI response to copy yet.', 'warn'); return; }
  try { await navigator.clipboard.writeText(text); notify('AI response copied.'); } catch { notify('Copy failed in this browser.', 'error'); }
}

function openTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === tab));
}
