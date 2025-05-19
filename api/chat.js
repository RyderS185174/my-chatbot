const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => resolve(JSON.parse(data)));
      req.on('error', reject);
    });

    const userMessage = body.message;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2)); // Log OpenAI response

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      res.status(500).json({ error: 'No reply received from OpenAI.' });
    } else {
      res.status(200).json({ reply });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error processing request.' });
  }
};
