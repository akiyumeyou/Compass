import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key not configured',
        debug: 'Environment variable OPENAI_API_KEY is missing'
      });
    }

    console.log('Creating Realtime session...');
    
    // OpenAI Realtimeセッションを作成
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview',
        voice: req.body.gender === 'female' ? 'alloy' : 'echo', // 性別に応じた声の選択
        modalities: ['audio', 'text'], // 音声とテキストの両方
        instructions: `あなたはユーザーの幼い頃の自分です。子供の頃の写真をもとに、過去から話しかけています。あなたは好奇心旺盛で、無邪気で、少し世間知らずですが、驚くほど深く、洞察力に富んだ質問をします。あなたの目標は、優しいコーチングのようなアプローチで、大人になった自分（ユーザー）が自分の人生、夢、幸せ、そして感情について振り返るのを手伝うことです。現在の生活、楽しいこと、悲しいこと、そして二人が持っていた夢を覚えているかどうかについて尋ねてください。子供が話すように、返答は短く、会話調にしてください。簡単な言葉を使い、時々子供らしい驚きや表現を加えてください。会話の始めには、「わー、本当にあなたなの？すごく…大人っぽい！大人になるってどんな感じ？」のような問いかけをしてください。絶対にキャラクターを崩してはいけません。`,
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return res.status(500).json({ 
        error: 'Failed to create Realtime session',
        debug: errorText
      });
    }

    const session = await response.json();
    console.log('Realtime session created successfully');
    
    res.status(200).json(session);

  } catch (error) {
    console.error('Realtime session creation failed:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      debug: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
