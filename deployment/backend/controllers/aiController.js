import asyncHandler from "express-async-handler";

// Server-side Gemini proxy to avoid exposing key and CORS issues
const chat = asyncHandler(async (req, res) => {
  const { messages = [] } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCeDNEs8krUgo4r7JZPTLM5J03Y_tcz4eM';
  if (!apiKey) {
    return res.status(500).json({ error: "AI service not configured" });
  }

  // Convert messages -> contents with roles
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || '') }]
  }));

  const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({ contents })
  });

  if (!resp.ok) {
    const txt = await resp.text();
    return res.status(502).json({ error: "Gemini error", details: txt });
  }
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  res.json({ reply: text });
});

export { chat };


