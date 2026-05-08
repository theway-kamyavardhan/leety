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

        const { model, context, prompt } = JSON.parse(body || '{}');
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
            messages: [
              {
                role: 'system',
                content: 'You are a concise execution coach for a CS student. Give practical, time-aware plans. Avoid fluff. Use the tracker context and return clear bullets.'
              },
              {
                role: 'user',
                content: `Tracker context:\n${JSON.stringify(context || {}, null, 2)}\n\nUser request:\n${prompt || ''}`
              }
            ],
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
