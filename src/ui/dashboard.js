import { byId, fmt, countBy, badge } from '../utils.js';
import { state, jobs, charts } from '../state.js';
import { sheetProblems } from '../data/sheets.js';
import { getFollowUpJobs, getHealthSignal } from './planner.js';

export function renderDashboard() {
  const total = state.problems.length;
  const diff = countBy(state.problems, 'difficulty');
  const topic = countBy(state.problems, 'topic');
  byId('totalSolved').textContent = total;
  byId('difficultyText').textContent = `Easy ${diff.Easy || 0} / Medium ${diff.Medium || 0} / Hard ${diff.Hard || 0}`;
  const goal = Number(state.settings.goal) || 300;
  const pct = Math.min(100, Math.round((total / goal) * 100));
  byId('goalBar').style.width = `${pct}%`;
  byId('goalText').textContent = `${pct}% complete (${total}/${goal})`;
  const deadline = new Date('2026-08-31T00:00:00');
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((deadline - now) / 86400000));
  const remaining = Math.max(0, goal - total);
  byId('paceText').textContent = daysLeft ? `${(remaining / daysLeft).toFixed(2)}/day` : `${remaining} left`;
  byId('daysText').textContent = `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining until Aug 31, 2026`;
  const followUps = getFollowUpJobs();
  const health = getHealthSignal();
  const sheetDone = Object.values(state.sheetProgress || {}).filter(Boolean).length;
  byId('jobCountDash').textContent = jobs.length;
  byId('jobFollowDash').textContent = `${followUps.length} follow-up${followUps.length === 1 ? '' : 's'} due`;
  byId('referralDash').textContent = state.planner.referrals.length;
  byId('mockDash').textContent = state.planner.mocks.length;
  byId('healthDash').textContent = health.label;
  byId('healthDetailDash').textContent = `${health.detail} Sheets: ${sheetDone}/${sheetProblems.length}`;
  renderCharts({ diff, topic });
}

export function renderCharts(precomputed = {}) {
  const diff = precomputed.diff || countBy(state.problems, 'difficulty');
  const topic = precomputed.topic || countBy(state.problems, 'topic');
  drawChart('difficultyChart', 'doughnut', {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [{ data: [diff.Easy || 0, diff.Medium || 0, diff.Hard || 0], backgroundColor: ['#2ea043', '#d29922', '#f85149'] }]
  });
  drawChart('topicChart', 'bar', {
    labels: Object.keys(topic).length ? Object.keys(topic) : ['Arrays', 'Strings', 'Hashing', 'Two Pointers', 'Sliding Window', 'Trees', 'Graphs', 'DP', 'Heaps', 'Binary Search', 'Other'],
    datasets: [{ label: 'Solved', data: (Object.keys(topic).length ? Object.keys(topic) : ['Arrays', 'Strings', 'Hashing', 'Two Pointers', 'Sliding Window', 'Trees', 'Graphs', 'DP', 'Heaps', 'Binary Search', 'Other']).map(t => topic[t] || 0), backgroundColor: '#2f81f7' }]
  });
  const sortedContests = [...state.contests].sort((a, b) => a.date.localeCompare(b.date));
  drawChart('contestChart', 'line', {
    labels: sortedContests.map(c => fmt(c.date)),
    datasets: [{ label: 'Problems solved', data: sortedContests.map(c => c.solved), borderColor: '#2ea043', backgroundColor: 'rgba(46,160,67,.18)', fill: true, tension: .35 }]
  }, { scales: { y: { min: 0, max: 4, ticks: { stepSize: 1 } } } });
  const stats = state.leetcodeStats;
  const activity = stats?.activity || mockActivity();
  drawChart('leetcodeChart', 'line', {
    labels: activity.map(a => a.date),
    datasets: [{ label: 'Recent solves', data: activity.map(a => a.count), borderColor: '#2f81f7', backgroundColor: 'rgba(47,129,247,.18)', fill: true, tension: .35 }]
  });
}

export function drawChart(id, type, data, extra = {}) {
  const canvas = byId(id);
  if (!canvas || !canvas.offsetParent) return;
  if (charts[id]) charts[id].destroy();
  const grid = state.settings.theme === 'light' ? '#e2e8f0' : '#30363d';
  const ticks = state.settings.theme === 'light' ? '#475569' : '#cbd5e1';
  charts[id] = new Chart(canvas, {
    type,
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: ticks } } },
      scales: type === 'doughnut' || type === 'pie' ? {} : { x: { ticks: { color: ticks }, grid: { color: grid } }, y: { ticks: { color: ticks }, grid: { color: grid }, beginAtZero: true }, ...(extra.scales || {}) },
      ...extra
    }
  });
}

function mockActivity(seed = 0) {
  return Array.from({ length: 10 }, (_, i) => ({ date: `Day ${i + 1}`, count: Math.max(0, ((seed + i * 3) % 7) - 1) }));
}
