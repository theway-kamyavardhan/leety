module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const sources = [];
  const errors = [];
  let all = [];

  try {
    const devpost = await fetchDevpost();
    if (devpost.length) { all = all.concat(devpost); sources.push('devpost'); }
  } catch (e) { errors.push(`devpost: ${e.message}`); }

  try {
    const mlh = await fetchMlh();
    if (mlh.length) { all = all.concat(mlh); sources.push('mlh'); }
  } catch (e) { errors.push(`mlh: ${e.message}`); }

  try {
    const devfolio = await fetchDevfolio();
    if (devfolio.length) { all = all.concat(devfolio); sources.push('devfolio'); }
  } catch (e) { errors.push(`devfolio: ${e.message}`); }

  try {
    const unstop = await fetchUnstop();
    if (unstop.length) { all = all.concat(unstop); sources.push('unstop'); }
  } catch (e) { errors.push(`unstop: ${e.message}`); }

  // Deduplicate by normalized name
  const seen = new Set();
  all = all.filter(h => {
    const key = h.name.toLowerCase().replace(/\s+/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  all = all.slice(0, 24);

  if (!all.length) {
    return res.status(200).json({
      source: 'fallback',
      note: `No live feeds succeeded. Errors: ${errors.join('; ')}`,
      hackathons: fallbackHackathons()
    });
  }

  return res.status(200).json({
    source: sources.join(', '),
    note: `Returned ${all.length} hackathon(s) from live feeds.${errors.length ? ' Errors: ' + errors.join('; ') : ''}`,
    hackathons: all
  });
};

async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

async function fetchDevpost() {
  const response = await fetchWithTimeout('https://devpost.com/events/upcoming.rss');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const xml = await response.text();

  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml)) !== null && items.length < 12) {
    const item = m[1];
    const title = extractXml(item, 'title');
    const link = extractXml(item, 'link');
    const pubDate = extractXml(item, 'pubDate');
    if (title) {
      items.push({
        id: `devpost-${items.length}-${Date.now()}`,
        name: decodeXml(title),
        platform: 'Devpost',
        date: pubDate ? normalizeDate(pubDate) : futureDate(items.length, 5),
        mode: 'Online/Hybrid',
        prize: 'See listing',
        link: link || 'https://devpost.com/hackathons'
      });
    }
  }
  return items;
}

async function fetchMlh() {
  const res = await fetchWithTimeout('https://mlh.io/api/v1/events?upcoming=true');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('Unexpected response format');
  return data.slice(0, 10).map((ev, i) => ({
    id: `mlh-${i}-${Date.now()}`,
    name: ev.name || 'MLH Hackathon',
    platform: 'MLH',
    date: ev.start_date || futureDate(i, 7),
    mode: modeFromLocation(ev.location),
    prize: ev.prize || 'See listing',
    link: ev.url || 'https://mlh.io'
  }));
}

async function fetchDevfolio() {
  const res = await fetchWithTimeout('https://devfolio.co/api/hackathons?limit=10', {
    headers: { 'Accept': 'application/json', 'User-Agent': 'DSA-Grind-Tracker/1.0' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const list = Array.isArray(data) ? data : data?.hackathons || data?.results || data?.data || [];
  return list.slice(0, 10).map((h, i) => ({
    id: `devfolio-${i}-${Date.now()}`,
    name: h.name || h.title || 'Devfolio Hackathon',
    platform: 'Devfolio',
    date: normalizeDate(h.starts_at || h.startDate || h.date || h.start_date),
    mode: capitalize(h.hackathon_mode || h.mode || 'Online'),
    prize: h.prizes || h.prize || 'See listing',
    link: h.url || h.link || h.website || 'https://devfolio.co/hackathons'
  }));
}

async function fetchUnstop() {
  const res = await fetchWithTimeout('https://unstop.com/api/public/opportunity/search?opportunity=hackathon&per_page=10', {
    headers: { 'Accept': 'application/json', 'User-Agent': 'DSA-Grind-Tracker/1.0' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const list = data?.data?.data || data?.data || data?.opportunities || [];
  if (!Array.isArray(list)) throw new Error('Unexpected response format');
  return list.slice(0, 10).map((h, i) => ({
    id: `unstop-${i}-${Date.now()}`,
    name: h.title || h.name || 'Unstop Hackathon',
    platform: 'Unstop',
    date: normalizeDate(h.regn_end_date || h.start_date || h.startDate || h.event_date),
    mode: capitalize(h.type || h.mode || 'Online'),
    prize: h.prizes || h.prize || 'See listing',
    link: h.seo_url || h.url || h.link || 'https://unstop.com/hackathons'
  }));
}

function extractXml(itemXml, tag) {
  const m = itemXml.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`));
  return m ? m[1].trim() : '';
}

function normalizeDate(d) {
  if (!d) return futureDate(0, 5);
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return futureDate(0, 5);
    return date.toISOString().slice(0, 10);
  } catch { return futureDate(0, 5); }
}

function futureDate(index, daysStep) {
  const d = new Date();
  d.setDate(d.getDate() + 5 + index * daysStep);
  return d.toISOString().slice(0, 10);
}

function modeFromLocation(loc) {
  if (!loc) return 'Online';
  const s = String(loc).toLowerCase();
  if (s.includes('virtual') || s.includes('online')) return 'Online';
  if (s.includes('hybrid')) return 'Hybrid';
  return 'Offline';
}

function capitalize(s) {
  if (!s) return 'Online';
  return String(s).charAt(0).toUpperCase() + String(s).slice(1).toLowerCase();
}

function fallbackHackathons() {
  const names = [
    ['Google Gen AI Hackathon', 'Devpost', 'Online', '$15,000', 'https://devpost.com/hackathons'],
    ['Microsoft Azure AI Hack', 'Devpost', 'Hybrid', '$25,000', 'https://devpost.com/hackathons'],
    ['ETHGlobal Online Hack', 'ETHGlobal', 'Online', '$50,000', 'https://ethglobal.com/events'],
    ['MLH Global Hack Week', 'MLH', 'Online', 'Swag + Prizes', 'https://mlh.io'],
    ['Devfolio Build for India', 'Devfolio', 'Online', 'INR 10,00,000', 'https://devfolio.co/hackathons'],
    ['Polygon BUIDL Hack', 'Devfolio', 'Online', '$30,000', 'https://devfolio.co/hackathons'],
    ['Smart India Hackathon', 'Unstop', 'Offline', 'INR 5,00,000', 'https://unstop.com/hackathons'],
    ['Campus Code Clash', 'Unstop', 'Hybrid', 'INR 2,50,000', 'https://unstop.com/hackathons'],
    ['NASA Space Apps Challenge', 'NASA', 'Online', 'Glory', 'https://www.spaceappschallenge.org'],
    ['GSOC Warm-up', 'Google', 'Online', 'Stipend', 'https://summerofcode.withgoogle.com']
  ];
  return names.map((h, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 5 + i * 5);
    return { id: `fallback-${i}`, name: h[0], platform: h[1], mode: h[2], prize: h[3], link: h[4], date: d.toISOString().slice(0, 10) };
  });
}

function decodeXml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}
