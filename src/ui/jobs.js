import { byId, fmt, uid, badge, clean, escapeHtml, escapeAttr, escapeRegExp, notify } from '../utils.js';
import { state, jobs, save } from '../state.js';
import { renderAll } from '../dispatcher.js';

export function parseJobSummary() {
  const text = byId('jobSummary').value.trim();
  if (!text) { byId('parseMessage').textContent = 'Paste a job summary first.'; return; }
  const top = text.slice(0, 900);
  const titleMatch = text.match(/(?:job title|position|role)\s*[:\-]\s*([^\n]+)/i) || text.match(/\b(Software Engineer|Frontend Developer|Backend Developer|Full Stack Developer|Data Scientist|Machine Learning Engineer|DevOps Engineer|Product Engineer|SDE ?[1-3]?|QA Engineer)\b/i);
  const companyMatch = text.match(/(?:company|organization|employer)\s*[:\-]\s*([^\n]+)/i) || top.match(/\b(?:at|with)\s+([A-Z][A-Za-z0-9&.\- ]{2,40})/);
  const locationMatch = text.match(/(?:location|workplace)\s*[:\-]\s*([^\n]+)/i) || text.match(/\b(Remote|Hybrid|Bengaluru|Bangalore|Hyderabad|Pune|Mumbai|Delhi|Gurugram|Noida|Chennai|Kolkata|New York|San Francisco|London|Singapore)\b/i);
  const deadlineMatch = text.match(/(?:closing date|apply by|deadline)\s*[:\-]\s*([A-Za-z0-9,\/\-. ]{6,30})/i);
  const salaryMatch = text.match(/(?:salary|compensation|ctc)\s*[:\-]?\s*([$₹]?\s?\d[\d,]*(?:\s?-\s?[$₹]?\s?\d[\d,]*)?(?:\s?(?:LPA|lakhs|per year|\/yr|USD|INR))?)/i);
  const skillWords = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'SQL', 'HTML', 'CSS', 'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Tailwind', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST', 'Machine Learning', 'TensorFlow', 'PyTorch'];
  const skills = [...new Set(skillWords.filter(s => new RegExp(`\\b${escapeRegExp(s)}\\b`, 'i').test(text)))];
  byId('jobTitle').value = clean(titleMatch?.[1] || titleMatch?.[0] || '');
  byId('jobCompany').value = clean(companyMatch?.[1] || '');
  byId('jobLocation').value = clean(locationMatch?.[1] || locationMatch?.[0] || '');
  byId('jobSkills').value = skills.join(', ');
  byId('jobDeadline').value = clean(deadlineMatch?.[1] || '');
  byId('jobSalary').value = clean(salaryMatch?.[1] || '');
  byId('jobNotes').value = text.slice(0, 1000);
  byId('parseMessage').textContent = skills.length || titleMatch || companyMatch ? 'Parsed what I could. Review the form before saving.' : 'Could not confidently extract fields. You can still fill the form manually.';
  notify('Job summary parsed. Review before saving.');
}

export function saveJob(e) {
  e.preventDefault();
  const id = byId('jobId').value || uid();
  const job = {
    id,
    title: byId('jobTitle').value.trim(),
    company: byId('jobCompany').value.trim(),
    location: byId('jobLocation').value.trim(),
    applicationDate: byId('jobDate').value || today(),
    status: byId('jobStatus').value,
    link: byId('jobLink').value.trim(),
    skills: byId('jobSkills').value.split(',').map(s => s.trim()).filter(Boolean),
    deadline: byId('jobDeadline').value.trim(),
    salary: byId('jobSalary').value.trim(),
    notes: byId('jobNotes').value.trim()
  };
  const newJobs = jobs.some(j => j.id === id) ? jobs.map(j => j.id === id ? job : j) : [job, ...jobs];
  jobs.length = 0;
  jobs.push(...newJobs);
  save();
  notify(byId('jobId').value ? 'Job application updated.' : 'Job application saved.');
  resetJobForm();
  renderJobs();
  renderAll();
}

export function resetJobForm() {
  byId('jobForm').reset();
  byId('jobId').value = '';
  byId('jobDate').value = today();
}

export function renderJobs() {
  const filter = byId('jobStatusFilter')?.value || 'All';
  const rows = jobs.filter(j => filter === 'All' || j.status === filter).sort((a, b) => b.applicationDate.localeCompare(a.applicationDate));
  byId('jobTable').innerHTML = rows.map(j => `
    <tr class="border-t border-slate-200 dark:border-line">
      <td class="py-3 font-semibold">${j.link ? `<a class="text-brand" href="${escapeAttr(j.link)}" target="_blank" rel="noreferrer">${escapeHtml(j.title)}</a>` : escapeHtml(j.title)}</td>
      <td>${escapeHtml(j.company)}</td><td>${escapeHtml(j.location || '-')}</td><td>${badge(j.status)}</td><td>${fmt(j.applicationDate)}</td>
      <td>${(j.skills || []).slice(0, 3).map(badge).join(' ')}${(j.skills || []).length > 3 ? ` <span class="text-xs text-slate-500">+${j.skills.length - 3}</span>` : ''}</td>
      <td class="space-x-2"><button class="text-brand" onclick="window.editJob('${j.id}')"><i class="fa-solid fa-pen"></i></button><button class="text-danger" onclick="window.deleteJob('${j.id}')"><i class="fa-solid fa-trash"></i></button></td>
    </tr>`).join('');
  byId('jobEmpty').classList.toggle('hidden', rows.length > 0);
}

window.editJob = (id) => {
  const j = jobs.find(x => x.id === id);
  if (!j) return;
  byId('jobId').value = j.id;
  byId('jobTitle').value = j.title;
  byId('jobCompany').value = j.company;
  byId('jobLocation').value = j.location || '';
  byId('jobDate').value = j.applicationDate;
  byId('jobStatus').value = j.status;
  byId('jobLink').value = j.link || '';
  byId('jobSkills').value = (j.skills || []).join(', ');
  byId('jobDeadline').value = j.deadline || '';
  byId('jobSalary').value = j.salary || '';
  byId('jobNotes').value = j.notes || '';
  openTab('jobs');
};

window.deleteJob = (id) => {
  if (!confirm('Delete this job application?')) return;
  const idx = jobs.findIndex(j => j.id === id);
  if (idx >= 0) jobs.splice(idx, 1);
  save();
  notify('Job application deleted.');
  renderJobs();
  renderAll();
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function openTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === tab));
}
