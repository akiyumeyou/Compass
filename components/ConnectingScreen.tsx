import React, { useEffect, useState } from 'react';
import OpenAI from 'openai';

interface ConnectingScreenProps {
  onConnected: () => void;
  onConverted: (transformed: string) => void;
  onGenderDetected?: (gender: 'male' | 'female') => void;
  photo: string | null;
}

const ConnectingScreen: React.FC<ConnectingScreenProps> = ({ onConnected, onConverted, onGenderDetected, photo }) => {
  const [status, setStatus] = useState<'connecting' | 'converting' | 'done' | 'error'>('connecting');

  useEffect(() => {
    let cancelled = false;
    
    // 性別判定処理（並行実行）
    async function detectGender() {
      if (!photo || !onGenderDetected) return;
      
      try {
        const isDevelopment = import.meta.env.DEV;
        
        if (isDevelopment) {
          const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
          if (!apiKey) {
            console.warn('OpenAI API key not found, defaulting to male');
            onGenderDetected('male');
            return;
          }

          const openai = new OpenAI({ 
            apiKey: apiKey,
            dangerouslyAllowBrowser: true
          });

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
                    image_url: { url: photo }
                  }
                ]
              }
            ],
            max_tokens: 10,
            temperature: 0.1
          });

          const result = response.choices[0]?.message?.content?.toLowerCase().trim();
          const gender = (result === 'male' || result === 'female') ? result as 'male' | 'female' : 'male';
          
          if (!cancelled) {
            onGenderDetected(gender);
          }
        } else {
          // 本番環境
          const response = await fetch('/api/detect-gender', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageDataUrl: photo })
          });

          if (response.ok) {
            const data = await response.json();
            const gender = data.gender || 'male';
            
            if (!cancelled) {
              onGenderDetected(gender);
            }
          }
        }
      } catch (error) {
        console.error('Gender detection error:', error);
        if (!cancelled && onGenderDetected) {
          onGenderDetected('male'); // デフォルト
        }
      }
    }
    
    async function run() {
      if (!photo) return;
      try {
        setStatus('converting');

        const isDevelopment = import.meta.env.DEV;
        
        // 性別判定を並行実行
        detectGender();

        // 開発環境での処理
        if (isDevelopment && !import.meta.env.VITE_GEMINI_API_KEY) {
          // APIキーがない場合は擬似的な処理時間を設ける
          console.log('Development mode: Simulating image conversion');
          setStatus('converting');
          
          // 擬似的な画像生成時間（3-4秒）
          setTimeout(() => {
            if (!cancelled) {
              onConverted(photo);  // 元画像を使用
              setStatus('done');
              setTimeout(() => {
                if (!cancelled) {
                  onConnected();  // 画像生成完了後に遷移
                }
              }, 500);  // 完了表示を少し見せる
            }
          }, 3500);
        } else if (import.meta.env.VITE_GEMINI_API_KEY) {
          // Frontend direct call for dev only
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
          const match = photo.match(/^data:(.+);base64,(.*)$/);
          if (!match) throw new Error('Invalid image data URL');
          const mimeType = match[1];
          const base64Data = match[2];

          const prompt = 
            "Using the provided image, create a photorealistic portrait of this person as a 7-year-old child. " +
            "Preserve the original person's unique facial features, eye shape, and overall facial structure, " +
            "but naturally adjusted for a younger age. The result should be instantly recognizable as the same person. " +
            "Key requirements: " +
            "- Smooth, youthful skin with rounder cheeks and softer facial contours " +
            "- Proportionally larger eyes with an innocent, childlike gaze " +
            "- Simple elementary school outfit (white shirt or Japanese school uniform) " +
            "- Professional studio portrait style with soft natural lighting " +
            "- Ultra photorealistic quality, like a real photograph, not an illustration";

          const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent', {
            method: 'POST',
            headers: {
              'x-goog-api-key': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    { inlineData: { mimeType, data: base64Data } }
                  ]
                }
              ]
            })
          });

          if (!resp.ok) {
            throw new Error(`Gemini request failed: ${resp.status}`);
          }

          const data = await resp.json();
          let outData: string | null = null;
          let outMime: string = 'image/png';
          const candidates = data?.candidates || [];
          for (const c of candidates) {
            const parts = c?.content?.parts || [];
            for (const p of parts) {
              if (p?.inlineData?.data) {
                outData = p.inlineData.data;
                outMime = p.inlineData.mimeType || outMime;
                break;
              }
            }
            if (outData) break;
          }
          if (!outData) throw new Error('No image data in Gemini response');
          const transformed = `data:${outMime};base64,${outData}`;
          if (!cancelled) {
            onConverted(transformed);
            setStatus('done');
            onConnected();
          }
        } else {
          // Backend call (recommended for prod)
          try {
            const resp = await fetch('/api/convert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageDataUrl: photo })
            });
            
            if (!resp.ok) {
              const text = await resp.text();
              console.warn(`Convert API failed: ${resp.status} ${text}`);
              throw new Error(`Convert API failed: ${resp.status}`);
            }
            
            const json = await resp.json();
            const transformed = json?.transformedDataUrl as string;
            if (!transformed) {
              console.warn('Invalid convert API response, using original image');
              throw new Error('Invalid convert API response');
            }
            
            if (!cancelled) {
              onConverted(transformed);
              setStatus('done');
              onConnected();
            }
          } catch (apiError) {
            console.warn('API convert failed, using original image:', apiError);
            // APIが利用できない場合は元の画像を使用
            if (!cancelled) {
              onConverted(photo);
              setStatus('done');
              onConnected();
            }
          }
        }
      } catch (e) {
        console.error('Image conversion error', e);
        if (!cancelled) setStatus('error');
        // 失敗時でも一旦そのまま進める
        if (!cancelled) onConnected();
      }
    }
    run();
    return () => { cancelled = true; };
  }, [photo, onConverted, onConnected]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-8 rounded-[2rem] overflow-hidden">
      {photo && (
        <div className="relative mb-8">
          <img src={photo} alt="幼い頃のあなた" className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 shadow-lg"/>
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-60 flex items-center justify-center">
             <div className="animate-ping h-4 w-4 rounded-full bg-green-400 opacity-75"></div>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-2 animate-pulse">{status === 'converting' ? '現在過去にタイムスリップしています...' : '過去に接続中...'}</h2>
      <p className="text-gray-400">{status === 'converting' ? 'しばらくお待ちください。' : '時間リンクを確立しています。しばらくお待ちください。'}</p>
    </div>
  );
};

export default ConnectingScreen;