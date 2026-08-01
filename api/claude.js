// api/claude.js
// هاد الملف خاصو يتحط فمجلد "api" فجذر المشروع ديالك ف Vercel (جنب index.html أو أي ملف آخر).
// Vercel كيتعرف عليه أوتوماتيكياً ويحولو لـ endpoint: https://[الدومين ديالك]/api/claude

export default async function handler(req, res) {
  // CORS بسيط (اختياري، مفيد إلا كنت غادي تسول من دومين آخر)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, max_tokens } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages مفقودة أو غير صحيحة' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // هاد المفتاح كيبقى مخبي فالسيرفر، ما كيبانش للمستخدم
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5', // تقدر تبدلها بـ 'claude-haiku-4-5-20251001' إلا بغيتي تكلفة أقل وسرعة أكثر
        max_tokens: max_tokens || 800,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'وقع مشكل من Anthropic' });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
