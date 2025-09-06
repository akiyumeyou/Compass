import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, gender = 'female' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // OpenAI TTS API呼び出し
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: gender === 'female' ? 'alloy' : 'onyx', // 性別に基づいて音声を選択（女性:alloy, 男性:onyx）
        response_format: 'mp3',
        speed: 1.1 // 少し早めの話し方（子供らしく）
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS error:', response.status, errorText);
      return res.status(500).json({ error: `OpenAI TTS failed: ${response.status}` });
    }

    // 音声データを取得してクライアントに返す
    const audioBuffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('TTS API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}