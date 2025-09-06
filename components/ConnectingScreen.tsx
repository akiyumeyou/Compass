import React, { useEffect, useState } from 'react';

interface ConnectingScreenProps {
  onConnected: () => void;
  onConverted: (transformed: string) => void;
  photo: string | null;
}

const ConnectingScreen: React.FC<ConnectingScreenProps> = ({ onConnected, onConverted, photo }) => {
  const [status, setStatus] = useState<'connecting' | 'converting' | 'done' | 'error'>('connecting');
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoSrc = `${import.meta.env.BASE_URL}child_result.mp4`;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!photo) return;
      try {
        setStatus('converting');

        const isDevelopment = import.meta.env.DEV;

        if (isDevelopment && import.meta.env.VITE_GEMINI_API_KEY) {
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
          const resp = await fetch('/api/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageDataUrl: photo })
          });
          if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Convert API failed: ${resp.status} ${text}`);
          }
          const json = await resp.json();
          const transformed = json?.transformedDataUrl as string;
          if (!transformed) throw new Error('Invalid convert API response');
          if (!cancelled) {
            onConverted(transformed);
            setStatus('done');
            onConnected();
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
      {/* 再生ボタン削除 */}
      <h2 className="text-2xl font-bold mb-2 animate-pulse">{status === 'converting' ? '現在過去にタイムスリップしています...' : '過去に接続中...'}</h2>
      <p className="text-gray-400">{status === 'converting' ? 'しばらくお待ちください。' : '時間リンクを確立しています。しばらくお待ちください。'}</p>

      {/* 動画モーダル */}
      {isVideoOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-[28rem] rounded-xl overflow-hidden bg-black">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-2 right-2 z-10 px-3 py-1 rounded-full bg-white/20 text-white text-sm hover:bg-white/30"
            >
              閉じる
            </button>
            <div className="w-full">
              {!videoError ? (
                <video
                  src={videoSrc}
                  controls
                  autoPlay
                  className="w-full h-auto"
                  onError={() => setVideoError('動画を読み込めませんでした。/public/child_result.mp4 を確認してください。')}
                />
              ) : (
                <div className="p-6 text-center text-white">
                  <p className="mb-4">{videoError}</p>
                  <button
                    onClick={() => { setVideoError(null); }}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                  >
                    再試行
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectingScreen;