import { byId, notify, escapeHtml } from '../utils.js';
import { state, save } from '../state.js';
import { renderCharts } from './dashboard.js';

export async function fetchLeetcode() {
  let username = byId('leetcodeUsername').value.trim();
  if (!username) return;
  if (username === 'thewaykamayvardhan') {
    username = 'thewaykamyavardhan';
    byId('leetcodeUsername').value = username;
    notify('Corrected username to the existing LeetCode profile.', 'warn');
  }
  state.settings.leetcodeUsername = username;
  byId('leetcodeNote').textContent = 'Fetching LeetCode stats...';
  byId('fetchLeetcodeBtn').disabled = true;
  try {
    const res = await fetch(`/api/leetcode?username=${encodeURIComponent(username)}`);
    const data = await res.json();
    if (!res.ok || data.status === 'error') throw new Error(data.message || 'Stats API unavailable');
    state.leetcodeStats = {
      username: data.username || username,
      totalSolved: data.totalSolved || 0,
      easySolved: data.easySolved || 0,
      mediumSolved: data.mediumSolved || 0,
      hardSolved: data.hardSolved || 0,
      acceptanceRate: data.acceptanceRate || 'N/A',
      ranking: data.ranking || 'N/A',
      contributionPoints: data.contributionPoints || 0,
      reputation: data.reputation || 0,
      contest: data.contest || null,
      source: data.source || 'leetcode-graphql',
      activity: mockActivity(data.totalSolved || 0)
    };
    byId('leetcodeNote').textContent = `Stats loaded for ${state.leetcodeStats.username}. Recent activity is mocked because LeetCode's public profile query does not expose a daily timeline.`;
    notify('LeetCode stats loaded.');
  } catch (err) {
    state.leetcodeStats = null;
    byId('leetcodeNote').textContent = `Could not fetch stats: ${err.message}. Check the exact LeetCode username.`;
    notify('LeetCode stats API failed. Try again later.', 'warn');
  } finally {
    byId('fetchLeetcodeBtn').disabled = false;
  }
  save();
  renderLeetcode();
}

export function renderLeetcode() {
  const s = state.leetcodeStats;
  const stats = s ? [
    ['Username', s.username || '-'], ['Total solved', s.totalSolved], ['Easy', s.easySolved], ['Medium', s.mediumSolved], ['Hard', s.hardSolved], ['Acceptance', s.acceptanceRate === 'N/A' ? 'N/A' : `${s.acceptanceRate}%`], ['Ranking', s.ranking], ['Contribution', s.contributionPoints], ['Contest rating', s.contest?.rating ? Math.round(s.contest.rating) : 'N/A']
  ] : [['Total solved', '-'], ['Easy', '-'], ['Medium', '-'], ['Hard', '-'], ['Acceptance', '-'], ['Ranking', '-']];
  byId('leetcodeStats').innerHTML = stats.map(([label, value]) => `<div class="rounded-lg border border-slate-300 p-4 dark:border-line"><p class="text-sm text-slate-500 dark:text-slate-400">${label}</p><p class="mt-1 text-2xl font-bold">${value}</p></div>`).join('');
  renderCharts();
}

function mockActivity(seed = 0) {
  return Array.from({ length: 10 }, (_, i) => ({ date: `Day ${i + 1}`, count: Math.max(0, ((seed + i * 3) % 7) - 1) }));
}
