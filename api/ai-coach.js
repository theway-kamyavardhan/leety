module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const defaultModel = process.env.OPENROUTER_MODEL || 'openrouter/auto';

  if (!apiKey) {
    return res.status(500).json({
      message: 'OPENROUTER_API_KEY is not configured in Vercel Environment Variables.'
    });
  }

  try {
    const { model, context, prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'Prompt is required.' });
    }

    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.origin || 'https://vercel.app',
        'X-Title': 'DSA Grind Tracker'
      },
      body: JSON.stringify({
        model: model || defaultModel,
        messages: [
          {
            role: 'system',
            content: 'You are a concise execution coach for a CS student. Give practical, time-aware plans. Avoid fluff. Use the tracker context and return clear bullets.'
          },
          {
            role: 'user',
            content: `Tracker context:\n${JSON.stringify(context || {}, null, 2)}\n\nUser request:\n${prompt}`
          }
        ],
        temperature: 0.4
      })
    });

    const data = await openrouterResponse.json();
    if (!openrouterResponse.ok) {
      return res.status(openrouterResponse.status).json({
        message: data?.error?.message || data?.message || 'OpenRouter request failed.'
      });
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || '',
      raw: data
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'AI request failed.' });
  }
};
