import { byId, uid, fmt, badge, escapeHtml, escapeAttr, clean, notify } from '../utils.js';
import { state, save } from '../state.js';

export async function importResumeFile(file) {
  if (!file) return;
  try {
    const text = await extractPdfText(file);
    byId('resumeText').value = text || '';
    state.resume.text = text || '';
    save();
    byId('resumeUploadStatus').textContent = `Parsed ${file.name}. Total characters: ${(text || '').length}`;
    notify('Resume parsed from PDF.');
  } catch (err) {
    byId('resumeUploadStatus').textContent = 'PDF parsing not available in this browser. Paste text manually.';
    notify('PDF parsing failed.', 'warn');
  }
}

export function saveResumeSource() {
  state.resume.text = byId('resumeText').value.trim();
  save();
  notify('Resume saved.');
}

export function clearResumeSource() {
  byId('resumeText').value = '';
  state.resume.text = '';
  save();
  notify('Resume cleared.');
}

export function updateResumeStatus() {
  const text = byId('resumeText').value.trim();
  const hasDraft = byId('resumeDraft').value.trim().length > 0;
  byId('resumeStatus').textContent = `Characters: ${text.length} ${hasDraft ? '• Draft ready' : ''} ${state.resume.lastScore ? `• ATS score: ${state.resume.lastScore}` : ''}`;
}

export function cleanResumeText(text) {
  return text
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\b[A-Z]{2,}\b/g, match => match.toLowerCase())
    .replace(/\d{10,}/g, 'PHONE')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'EMAIL')
    .replace(/[^a-zA-Z0-9.,;:!?\s()&/-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function tailorResume(e) {
  e.preventDefault();
  const source = cleanResumeText(byId('resumeText').value.trim());
  const jd = cleanResumeText(byId('jobDescription').value.trim());
  if (!source || !jd) { notify('Provide both a resume and a job description.', 'warn'); return; }
  byId('resumeDraft').value = 'Tailoring resume...';
  byId('resumeUploadStatus').textContent = 'Tailoring with AI...';
  try {
    const draft = await callAiForResume(source, jd, true);
    byId('resumeDraft').value = draft;
    byId('resumeUploadStatus').textContent = 'Draft generated. Review bullet specificity and keywords.';
    notify('Tailored draft generated.');
    scoreResumeAgainstJob(source, jd);
  } catch (err) {
    byId('resumeDraft').value = `Error: ${err.message}. Paste an OpenRouter key or use the Vercel deployment.`;
    notify('Tailor failed.', 'error');
  }
}

export async function callAiForResume(resumeText, jobDescription, fullRewrite = false) {
  const apiKey = localStorage.getItem('openrouterApiKey');
  const model = state.settings.openrouterModel || 'openrouter/auto';
  if (!apiKey) throw new Error('No OpenRouter key found. Add one in the AI Coach tab or use the Vercel deployment.');
  const instruction = fullRewrite
    ? 'Rewrite the resume as a tailored version. Preserve the structure, but rewrite bullets to include keywords and accomplishments relevant to the job. Keep it ATS-friendly, quantified, and concise.'
    : 'Analyze the resume against the job description. Give an ATS score (0-100), missing keywords, and specific rewrites for 3 bullets to improve fit. Keep it brief.';
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': location.origin, 'X-Title': 'DSA Grind Tracker' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: `You are an elite resume optimizer. ${instruction}\n\nRules:\n- Do not invent degrees, companies, or numbers.\n- Keep formatting scannable.\n- Prefer short, impact-oriented bullets.\n- Output plain text (no markdown headings).` },
        { role: 'user', content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}` }
      ],
      temperature: 0.4
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'OpenRouter request failed');
  return data.choices?.[0]?.message?.content || '';
}

export function scoreResumeAgainstJob(resumeText, jd) {
  const skills = [...new Set([...jd.match(/\b[a-zA-Z+#]+\b/g) || [], ...jd.match(/\b[A-Z]{2,}(?:\s[A-Z]{2,})?\b/g) || []])].filter(s => s.length > 2 && !['THE', 'AND', 'FOR', 'WITH', 'YOU', 'JOB', 'WORK', 'TEAM', 'ROLE', 'SKILL', 'EXPERIENCE'].includes(s.toUpperCase()));
  const found = skills.filter(s => new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(resumeText));
  const score = skills.length ? Math.round((found.length / skills.length) * 100) : 0;
  state.resume.lastScore = score;
  state.resume.lastJobDescription = jd.slice(0, 2000);
  save();
  renderAtsScore(score, found, skills);
}

export function renderAtsScore(score, found, skills) {
  const color = score >= 70 ? 'text-mint' : score >= 50 ? 'text-warn' : 'text-danger';
  const label = score >= 70 ? 'Strong' : score >= 50 ? 'Okay' : 'Needs work';
  byId('atsScore').innerHTML = `<p class="text-3xl font-bold ${color}">${score} <span class="text-sm text-slate-500">${label}</span></p><p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Keyword coverage</p><div class="mt-2 space-x-1">${skills.slice(0, 14).map(s => `<span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold ${found.includes(s) ? 'bg-mint/20 text-mint' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">${escapeHtml(s)}</span>`).join('')}</div>`;
}

export function copyResumeDraft() {
  const text = byId('resumeDraft').value.trim();
  if (!text) { notify('No draft to copy.', 'warn'); return; }
  navigator.clipboard.writeText(text).then(() => notify('Draft copied.')).catch(() => notify('Copy failed.', 'error'));
}

export function downloadResumeDraft() {
  const text = byId('resumeDraft').value.trim();
  if (!text) { notify('No draft to download.', 'warn'); return; }
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resume-tailored-${today()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  notify('Draft downloaded.');
}

async function extractPdfText(file) {
  if (window.pdfjsLib) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const texts = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      texts.push(content.items.map(item => item.str).join(' '));
    }
    return cleanResumeText(texts.join('\n\n'));
  }
  throw new Error('PDF.js not available. Use a manual parser or paste the resume text.');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
