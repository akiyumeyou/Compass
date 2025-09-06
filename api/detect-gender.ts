import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageDataUrl } = req.body;

    if (!imageDataUrl) {
      return res.status(400).json({ error: 'Image data URL is required' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    // OpenAI Vision APIで性別判定
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "この人物の性別を判定してください。回答は「male」または「female」のみで答えてください。他の文字は一切含めないでください。"
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl
              }
            }
          ]
        }
      ],
      max_tokens: 10,
      temperature: 0.1
    });

    const result = response.choices[0]?.message?.content?.toLowerCase().trim();
    const gender = (result === 'male' || result === 'female') ? result : 'female'; // デフォルトは女性（ユーザーの要望に基づく）

    res.json({ gender });

  } catch (error) {
    console.error('Gender detection error:', error);
    // エラー時はデフォルトで女性を返す
    res.json({ gender: 'female' });
  }
}