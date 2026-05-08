module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const username = String(req.query.username || '').trim();
  if (!username) return res.status(400).json({ message: 'username is required' });

  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: `https://leetcode.com/${encodeURIComponent(username)}/`,
        'User-Agent': 'DSA-Grind-Tracker/1.0'
      },
      body: JSON.stringify({
        query: `
          query userStats($username: String!) {
            matchedUser(username: $username) {
              username
              submitStats: submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
              profile {
                ranking
                reputation
              }
              contributions {
                points
              }
            }
            userContestRanking(username: $username) {
              attendedContestsCount
              rating
              globalRanking
              topPercentage
            }
          }
        `,
        variables: { username }
      })
    });

    const payload = await response.json();
    const user = payload?.data?.matchedUser;
    if (!response.ok || !user) {
      const message = payload?.errors?.[0]?.message || 'LeetCode user not found';
      return res.status(404).json({ message });
    }

    const counts = Object.fromEntries(
      user.submitStats.acSubmissionNum.map(item => [item.difficulty, item])
    );
    const totalSolved = counts.All?.count || 0;
    const totalSubmissions = counts.All?.submissions || 0;

    return res.status(200).json({
      username: user.username,
      totalSolved,
      easySolved: counts.Easy?.count || 0,
      mediumSolved: counts.Medium?.count || 0,
      hardSolved: counts.Hard?.count || 0,
      acceptanceRate: totalSubmissions ? Number(((totalSolved / totalSubmissions) * 100).toFixed(2)) : 'N/A',
      ranking: user.profile?.ranking || 'N/A',
      contributionPoints: user.contributions?.points || 0,
      reputation: user.profile?.reputation || 0,
      contest: payload.data.userContestRanking || null,
      source: 'leetcode-graphql'
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch LeetCode stats' });
  }
};
