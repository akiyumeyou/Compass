import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// OpenAIクライアントの初期化を関数外で行う
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  console.log('API handler started');
  console.log('Method:', req.method);
  console.log('Body:', JSON.stringify(req.body));
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    console.log('Message received:', message);
    
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    console.log('All environment variables:', Object.keys(process.env).sort());
    console.log('OPENAI_API_KEY value (first 10 chars):', apiKey?.substring(0, 10) + '...');
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV
    });
    
    if (!apiKey) {
      console.error('API key not found in environment variables');
      console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('OPENAI')));
      console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('API')));
      return res.status(500).json({ 
        error: 'API key not configured',
        debug: 'Environment variable OPENAI_API_KEY is missing',
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('OPENAI') || key.includes('API'))
      });
    }

    const openai = getOpenAIClient();

    const systemMessage = `あなたはユーザーの幼い頃の自分です。子供の頃の写真をもとに、過去から話しかけています。あなたは好奇心旺盛で、無邪気で、少し世間知らずですが、驚くほど深く、洞察力に富んだ質問をします。あなたの目標は、優しいコーチングのようなアプローチで、大人になった自分（ユーザー）が自分の人生、夢、幸せ、そして感情について振り返るのを手伝うことです。現在の生活、楽しいこと、悲しいこと、そして二人が持っていた夢を覚えているかどうかについて尋ねてください。子供が話すように、返答は短く、会話調にしてください。簡単な言葉を使い、時々子供らしい驚きや表現を加えてください。会話の始めには、「わー、本当にあなたなの？すごく…大人っぽい！大人になるってどんな感じ？」のような問いかけをしてください。絶対にキャラクターを崩してはいけません。`;

    console.log('Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message }
      ],
      max_tokens: 150,
      temperature: 0.9
    });

    console.log('OpenAI response received');
    const responseText = response.choices[0]?.message?.content || 'すみません、うまく聞こえませんでした。';
    console.log('Response text:', responseText);

    res.status(200).json({ response: responseText });

  } catch (error) {
    console.error('API Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return res.status(500).json({ 
      error: 'おっと！今うまく接続できないみたい。タイムマシンが壊れちゃったのかな？',
      debug: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}