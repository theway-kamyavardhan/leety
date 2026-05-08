module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const devpost = await fetchDevpost();
    return res.status(200).json({
      source: devpost.length ? 'devpost-rss' : 'fallback',
      note: 'Devfolio and Unstop do not provide stable public CORS-safe APIs; use this Vercel function as the place to add provider-specific scraping/API integration.',
      hackathons: devpost.length ? devpost : fallbackHackathons()
    });
  } catch (error) {
    return res.status(200).json({
      source: 'fallback',
      note: error.message,
      hackathons: fallbackHackathons()
    });
  }
};

async function fetchDevpost() {
  const response = await fetch('https://devpost.com/events/upcoming.rss');
  if (!response.ok) throw new Error(`Devpost RSS failed with ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?(?:<pubDate>(.*?)<\/pubDate>)?[\s\S]*?<\/item>/g)]
    .slice(0, 9)
    .map((match, index) => ({
      id: `devpost-${index}-${Date.now()}`,
      name: decodeXml(match[1] || 'Upcoming hackathon'),
      platform: 'Devpost',
      date: match[3] ? new Date(match[3]).toISOString().slice(0, 10) : new Date(Date.now() + index * 86400000 * 5).toISOString().slice(0, 10),
      mode: 'Online/Hybrid',
      prize: 'See listing',
      link: match[2] || 'https://devpost.com/hackathons'
    }));
}

function fallbackHackathons() {
  return ['AI Agents Build Week', 'FinTech Innovation Sprint', 'Campus Code Clash', 'Climate Tech Challenge', 'Web3 Builder Weekend', 'Product Engineering Hack'].map((name, index) => {
    const date = new Date();
    date.setDate(date.getDate() + 5 + index * 4);
    return {
      id: `fallback-${index}`,
      name,
      platform: index % 3 === 0 ? 'Devpost' : index % 3 === 1 ? 'Devfolio' : 'Unstop',
      date: date.toISOString().slice(0, 10),
      mode: index % 2 ? 'Hybrid' : 'Online',
      prize: index % 2 ? 'INR 5,00,000' : '$10,000',
      link: index % 3 === 0 ? 'https://devpost.com/hackathons' : index % 3 === 1 ? 'https://devfolio.co/hackathons' : 'https://unstop.com/hackathons'
    };
  });
}

function decodeXml(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
