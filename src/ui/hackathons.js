import { byId, fmt, uid, badge, escapeHtml, escapeAttr, notify } from '../utils.js';
import { state, save } from '../state.js';

export function generateMockHackathons() {
  const base = [
    ['AI Agents Build Week', 'Devpost', 'Online', '$15,000', 'https://devpost.com/hackathons'],
    ['FinTech Innovation Sprint', 'Devfolio', 'Hybrid', 'INR 8,00,000', 'https://devfolio.co/hackathons'],
    ['Campus Code Clash', 'Unstop', 'Offline', 'INR 2,50,000', 'https://unstop.com/hackathons'],
    ['Climate Tech Challenge', 'Devpost', 'Online', '$10,000', 'https://devpost.com/hackathons'],
    ['Web3 Builder Weekend', 'Devfolio', 'Online', 'INR 5,00,000', 'https://devfolio.co/hackathons'],
    ['Product Engineering Hack', 'Unstop', 'Hybrid', 'INR 3,00,000', 'https://unstop.com/hackathons']
  ];
  return base.map((h, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 5 + i * 4);
    return { id: uid(), name: h[0], platform: h[1], mode: h[2], prize: h[3], link: h[4], date: d.toISOString().slice(0, 10) };
  });
}

export async function refreshHackathons() {
  byId('hackathonStatus').textContent = 'Trying live hackathon feeds...';
  try {
    const res = await fetch('/api/hackathons');
    if (!res.ok) throw new Error('Feed unavailable');
    const data = await res.json();
    if (!Array.isArray(data.hackathons) || !data.hackathons.length) throw new Error('No feed items');
    state.hackathons = data.hackathons;
    byId('hackathonStatus').textContent = `Loaded ${data.source}. ${data.note || ''}`;
    notify('Hackathon feed refreshed.');
  } catch (err) {
    state.hackathons = generateMockHackathons();
    byId('hackathonStatus').textContent = `Live feed failed (${err.message}). Showing realistic mock data.`;
    notify('Live feed unavailable. Mock hackathons loaded.', 'warn');
  }
  save();
  renderHackathons();
}

export function renderHackathons() {
  const mode = byId('hackathonModeFilter')?.value || 'All';
  const rows = (state.hackathons || generateMockHackathons()).filter(h => mode === 'All' || String(h.mode || '').toLowerCase().includes(mode.toLowerCase()));
  byId('hackathonGrid').innerHTML = rows.map(h => `
    <article class="rounded-lg border border-slate-300 p-4 dark:border-line">
      <div class="flex items-start justify-between gap-3"><h3 class="font-bold">${escapeHtml(h.name)}</h3>${badge(h.platform)}</div>
      <dl class="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
        <div><dt class="inline font-semibold text-slate-800 dark:text-slate-200">Date:</dt> <dd class="inline">${fmt(h.date)}</dd></div>
        <div><dt class="inline font-semibold text-slate-800 dark:text-slate-200">Mode:</dt> <dd class="inline">${escapeHtml(h.mode)}</dd></div>
        <div><dt class="inline font-semibold text-slate-800 dark:text-slate-200">Prize:</dt> <dd class="inline">${escapeHtml(h.prize)}</dd></div>
      </dl>
      <a class="mt-4 inline-flex rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white" href="${escapeAttr(h.link)}" target="_blank" rel="noreferrer">Apply <i class="fa-solid fa-arrow-up-right-from-square ml-2"></i></a>
    </article>`).join('');
  if (!rows.length) byId('hackathonGrid').innerHTML = '<p class="text-sm text-slate-500">No hackathons match this mode filter.</p>';
}
