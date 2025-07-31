const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const GROUP_ID = process.env.GROUP_ID;
const ROBLOSECURITY = process.env.ROBLOSECURITY;

async function getCsrfToken() {
  const response = await fetch(`https://groups.roblox.com/v1/groups/${GROUP_ID}/users/0`, {
    method: 'POST',
    headers: {
      'Cookie': `.ROBLOSECURITY=${ROBLOSECURITY}`,
    },
  });
  const token = response.headers.get('x-csrf-token');
  if (!token) throw new Error('Failed to get CSRF token');
  return token;
}

app.post('/setrank', async (req, res) => {
  const { userId, rankId } = req.body;
  if (!userId || !rankId) return res.status(400).json({ error: 'Missing userId or rankId' });

  try {
    const csrfToken = await getCsrfToken();

    const url = `https://groups.roblox.com/v1/groups/${GROUP_ID}/users/${userId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Cookie': `.ROBLOSECURITY=${ROBLOSECURITY}`,
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
      },
      body: JSON.stringify({ rankId }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ranking API server running on port ${PORT}`);
});
