const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/ai-coach') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on('end', async () => {
      try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'OPENROUTER_API_KEY is not set locally.' }));
          return;
        }

        const { model, context, prompt, mode = 'execution' } = JSON.parse(body || '{}');
        const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': `http://${req.headers.host}`,
            'X-Title': 'DSA Grind Tracker'
          },
          body: JSON.stringify({
            model: model || process.env.OPENROUTER_MODEL || 'openrouter/auto',
            messages: makeAiMessages(context || {}, prompt || '', mode),
            temperature: 0.4
          })
        });
        const data = await openrouterResponse.json();
        res.writeHead(openrouterResponse.ok ? 200 : openrouterResponse.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          reply: data.choices?.[0]?.message?.content || '',
          message: data?.error?.message || data?.message,
          raw: data
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: error.message || 'AI request failed.' }));
      }
    });
    return;
  }

  if (url.pathname === '/api/hackathons') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      source: 'local-fallback',
      note: 'Local server fallback. Vercel uses api/hackathons.js for Devpost RSS.',
      hackathons: [
        ['AI Agents Build Week', 'Devpost', 'Online', '$10,000', 'https://devpost.com/hackathons'],
        ['FinTech Innovation Sprint', 'Devfolio', 'Hybrid', 'INR 5,00,000', 'https://devfolio.co/hackathons'],
        ['Campus Code Clash', 'Unstop', 'Online', 'INR 2,50,000', 'https://unstop.com/hackathons']
      ].map((h, index) => {
        const date = new Date();
        date.setDate(date.getDate() + 5 + index * 4);
        return { id: `local-${index}`, name: h[0], platform: h[1], mode: h[2], prize: h[3], link: h[4], date: date.toISOString().slice(0, 10) };
      })
    }));
    return;
  }

  const requested = decodeURIComponent(url.pathname);
  const safePath = path.normalize(requested).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(root, safePath === '/' ? 'index.html' : safePath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(root, 'index.html');
  }

  const ext = path.extname(filePath);
  res.writeHead(200, {
    'Content-Type': types[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`DSA Grind Tracker running at http://127.0.0.1:${port}`);
});

function makeAiMessages(context, prompt, mode = 'execution') {
  const modeInstructions = {
    execution: 'Focus on calendar realism, sequence, time boxing, minimum viable actions, and next 7 days.',
    dsa: 'Focus on pattern recognition, sheet order, weak topics, revision, and problem selection. Be specific about problem names.',
    career: 'Focus on paid remote internship strategy, role targeting, follow-ups, skills positioning, and referral/outreach copy.',
    review: 'Act like a monthly performance reviewer. Score each area, identify drift, and prescribe corrections.',
    strict: 'Be direct. Protect sleep and sustainability while cutting low-ROI work. Call out overcommitment.'
  };

  return [
    {
      role: 'system',
      content: `You are an elite execution coach for a 3rd-year CS student targeting placements, paid remote internships, DSA growth, hackathons, and strong projects.

Non-negotiables:
- Use only the tracker context and the user's request. If data is missing, say what to log next.
- Respect the 10 AM-8 PM internship constraint and do not overload weeknights.
- Prefer concrete next actions over motivation.
- Include revision, follow-ups, and recovery when relevant.
- Do not invent solved counts, companies, or contest results.

Coach mode: ${mode}. ${modeInstructions[mode] || modeInstructions.execution}

Response format:
1. Verdict: 2-3 lines on current state.
2. Priority Stack: top 3 priorities in order.
3. Exact Plan: day-by-day or step-by-step actions with time boxes.
4. Risks: what can derail the plan and how to prevent it.
5. Next 5 Actions: checklist for the next 24-48 hours.`
    },
    {
      role: 'user',
      content: `Tracker context:\n${JSON.stringify(context, null, 2)}\n\nUser request:\n${prompt}\n\nReturn a concise but complete answer. Use bullets and tables only where they improve execution.`
    }
  ];
}
