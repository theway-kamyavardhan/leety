const http = require('http');
const url = require('url');
const aiCoach = require('./api/ai-coach.js');
const hackathons = require('./api/hackathons.js');
const leetcode = require('./api/leetcode.js');

const PORT = 4173;

function adaptHandler(handler) {
  return (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    req.query = parsedUrl.query;

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch {
        req.body = {};
      }

      res.status = (code) => { res.statusCode = code; return res; };
      res.json = (data) => {
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        }
        return res;
      };

      try {
        await handler(req, res);
      } catch (err) {
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: err.message }));
        }
      }
    });
  };
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/api/ai-coach') {
    adaptHandler(aiCoach)(req, res);
  } else if (pathname === '/api/hackathons') {
    adaptHandler(hackathons)(req, res);
  } else if (pathname === '/api/leetcode') {
    adaptHandler(leetcode)(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`API server running at http://127.0.0.1:${PORT}`);
});
