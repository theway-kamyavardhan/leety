export const STORAGE_KEY = 'dsaProgressState';
export const JOB_KEY = 'jobApplications';

export const topics = ['Arrays', 'Strings', 'Hashing', 'Two Pointers', 'Sliding Window', 'Trees', 'Graphs', 'DP', 'Heaps', 'Binary Search', 'Other'];

export function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

export function byId(id) {
  return document.getElementById(id);
}

export function fmt(date) {
  return date ? new Date(date + 'T00:00:00').toLocaleDateString() : '-';
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function countBy(items, key) {
  return items.reduce((acc, item) => { acc[item[key]] = (acc[item[key]] || 0) + 1; return acc; }, {});
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}

export function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

export function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').replace(/[.;,]+$/, '').trim();
}

export function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function normalizeProblemName(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function badge(text) {
  const map = {
    Easy: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
    Hard: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    Applied: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    Interviewing: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
    'Offer Received': 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    Wishlist: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
  };
  return `<span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold ${map[text] || 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'}">${escapeHtml(String(text))}</span>`;
}

export function notify(message, type = 'success') {
  const host = byId('toastHost');
  if (!host) return;
  const colors = {
    success: 'border-green-300 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100',
    warn: 'border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
    error: 'border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100'
  };
  const icons = { success: 'fa-circle-check', warn: 'fa-triangle-exclamation', error: 'fa-circle-xmark' };
  const toast = document.createElement('div');
  toast.className = `toast pointer-events-auto rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg ${colors[type] || colors.success}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.success} mr-2"></i>${escapeHtml(message)}`;
  host.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-6px)';
    setTimeout(() => toast.remove(), 180);
  }, 2600);
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  notify(`${filename} downloaded.`);
}
