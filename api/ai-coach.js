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
    const { model, context, prompt, mode = 'execution' } = req.body || {};
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
        messages: makeAiMessages(context || {}, prompt, mode),
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
