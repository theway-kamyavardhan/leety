import { byId, escapeHtml, notify } from '../utils.js';
import { state } from '../state.js';
import { getNextDue } from './revisions.js';
import { isProblemSolvedName } from './weekly.js';
import { flagLabel } from './problems.js';
import { fmt } from '../utils.js';

export function renderFaangReview() {
  const faangPatterns = [
    ['Arrays & Hashing', ['Two Sum', 'Product of Array Except Self', 'Subarray Sum Equals K', 'Longest Consecutive Sequence']],
    ['Sliding Window', ['Longest Substring Without Repeating Characters', 'Minimum Window Substring', 'Sliding Window Maximum']],
    ['Trees', ['Binary Tree Level Order Traversal', 'Lowest Common Ancestor of a Binary Search Tree', 'Binary Tree Maximum Path Sum']],
    ['Graphs', ['Number of Islands', 'Course Schedule', 'Clone Graph', 'Word Ladder']],
    ['DP', ['Climbing Stairs', 'House Robber', 'Coin Change', 'Longest Common Subsequence', 'Edit Distance']],
    ['Heaps', ['Top K Frequent Elements', 'Kth Largest Element in an Array', 'Merge k Sorted Lists']]
  ];
  const today = new Date().toISOString().slice(0, 10);
  const due = state.problems.filter(p => p.flag > 1 || getNextDue(p) <= today);
  byId('faangSummary').innerHTML = [
    ['Due/flagged revisions', `${due.length}`],
    ['Core patterns', `${faangPatterns.length}`],
    ['Advice', 'Prioritize flagged + FAANG frequent patterns before adding random hards.']
  ].map(([a, b]) => `<div class="rounded-lg border border-slate-300 p-3 dark:border-line"><p class="text-sm text-slate-500">${a}</p><p class="mt-1 font-bold">${b}</p></div>`).join('');
  const rows = [
    ...due.slice(0, 10).map(p => ({ title: `Revise flagged: #${p.number} ${p.name}`, detail: `${p.topic} • ${flagLabel(p.flag)} • due ${fmt(getNextDue(p))}`, action: p.name })),
    ...faangPatterns.flatMap(([pattern, names]) => names.filter(n => !isProblemSolvedName(n)).slice(0, 2).map(n => ({ title: `${pattern}: ${n}`, detail: 'High-frequency interview pattern', action: n })))
  ].slice(0, 24);
  byId('faangRevisionList').innerHTML = rows.length ? rows.map(r => `
    <div class="flex items-start justify-between gap-3 rounded-md border border-slate-300 p-3 dark:border-line">
      <div><p class="font-semibold">${escapeHtml(r.title)}</p><p class="text-sm text-slate-600 dark:text-slate-400">${escapeHtml(r.detail)}</p></div>
      <button class="text-brand" onclick="window.addRoadmapProblem(decodeURIComponent('${encodeURIComponent(r.action)}'))">Add</button>
    </div>`).join('') : '<p class="text-sm text-slate-500">No urgent revision items. Use this time for timed mocks.</p>';
}
