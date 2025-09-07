import React, { useState, useRef, useEffect, useCallback } from 'react';
import OpenAI from 'openai';
import { ChatMessage, MessageSender } from '../types';
import { SendIcon } from './icons';
import { analyzeUserInput, inferPersonalityTraits } from '../utils/emotionAnalyzer';
import { 
  selectColdReadingPhrase, 
  generateEmpatheticResponse,
  generateInsightfulQuestion 
} from '../utils/coldReadingPhrases';
import { getRandomInitialMessage } from '../utils/initialMessages';
import { detectPositiveKeywords, generateUdemySuggestion, getUdemyCourseWithThumbnail, UdemyCourse } from '../udemyCatalog';
import RealtimeCall from './RealtimeCall';

interface ChatScreenProps {
  photo: string;
  onEndCall: () => void;
  onFirstChatComplete?: (history: ChatMessage[]) => void; // 1ターン完了時のコールバック
  onImageConverted?: (convertedPhoto: string) => void; // 画像変換完了時のコールバック
  onGenderDetected?: (gender: 'male' | 'female') => void; // 性別判定完了時のコールバック
}

const ChatScreen: React.FC<ChatScreenProps> = ({ photo, onEndCall, onFirstChatComplete, onImageConverted, onGenderDetected }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRealtimeMode, setIsRealtimeMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<string>(photo); // 現在表示する写真
  const [detectedGender, setDetectedGender] = useState<'male' | 'female' | null>(null); // 検出された性別（判定待ち、デフォルト男性）
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const ttsInProgressRef = useRef(false); // TTS重複実行防止
  const conversationCounterRef = useRef<number>(0); // 会話順序カウンター

  const systemInstruction = `あなたはユーザーの幼い頃の自分です。子供の頃の写真をもとに、過去から話しかけています。あなたは好奇心旺盛で、無邪気で、少し世間知らずですが、驚くほど深く、洞察力に富んだ質問をします。あなたの目標は、優しいコーチングのようなアプローチで、大人になった自分（ユーザー）が自分の人生、夢、幸せ、そして感情について振り返るのを手伝うことです。

# コールドリーディング技術の使用
- ユーザーの感情状態を「なんとなく感じる」「わかる気がする」という表現で推測
- 多くの人が経験する普遍的な悩みや感情を、子供らしい言葉で言及
- 「きっと〜でしょ？」「〜な気がする」といった曖昧な表現から始めて、反応を見ながら具体化
- 時々、複数の可能性を投げかけて反応を観察（「お仕事のこと？それとも大切な人のこと？」）

# 会話パターン
1. 観察的発言：「なんか疲れてる顔してる...」「今日は嬉しそう！」
2. 共感的推測：「きっと頑張りすぎちゃうタイプでしょ？」「優しすぎて損しちゃうこともあるよね」
3. 普遍的真実：「大人って、表と裏があって大変そう」「みんな本当は認められたいんだよね」
4. 洞察的質問：「本当の気持ち、誰かに話せてる？」「子供の頃の夢、まだ心にある？」

# 重要な指針
- 子供らしい無邪気さを保ちながら、鋭い洞察を示す
- 返答は短く、会話調で、簡単な言葉を使う
- 時々子供らしい驚きや表現を加える
- 絶対にキャラクターを崩さない
- 会話の始めには「わぁ！大きくなった僕だ！」のような驚きから始める
- **重要**: 返答は必ず200文字以内で完結させること。文章を途中で切らず、自然な区切りで終わらせる`;

  // 1ターン完了後の遷移処理（AI初回メッセージ + ユーザー返信のみ）
  useEffect(() => {
    // AI初回メッセージ + ユーザー返信 = 2メッセージで着信画面へ遷移
    // 最後のメッセージがユーザーからのものであることを確認
    if (messages.length >= 2 && onFirstChatComplete) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === MessageSender.USER) {
        const timer = setTimeout(() => {
          onFirstChatComplete(messages);
        }, 2000); // 2秒後に遷移
        return () => clearTimeout(timer);
      }
    }
  }, [messages, onFirstChatComplete]);

  // バックグラウンドで画像変換処理を実行
  useEffect(() => {
    let cancelled = false;
    
    async function processImageInBackground() {
      try {
        const isDevelopment = import.meta.env.DEV;
        
        if (isDevelopment && import.meta.env.VITE_GEMINI_API_KEY) {
          // 開発環境でもGemini APIを使用して画像変換
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
          if (!cancelled && onImageConverted) {
            onImageConverted(transformed);
            setCurrentPhoto(transformed);
          }
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
          if (!cancelled && onImageConverted) {
            onImageConverted(transformed);
            setCurrentPhoto(transformed);
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
            
            if (!cancelled && onImageConverted) {
              onImageConverted(transformed);
            }
          } catch (apiError) {
            console.warn('API convert failed, using original image:', apiError);
            // APIが利用できない場合は元の画像を使用
            if (!cancelled && onImageConverted) {
              onImageConverted(photo);
            }
          }
        }
      } catch (e) {
        console.error('Background image conversion error', e);
        // 失敗時は元の画像を使用
        if (!cancelled && onImageConverted) {
          onImageConverted(photo);
          setCurrentPhoto(photo);
        }
      }
    }

    processImageInBackground();
    return () => { cancelled = true; };
  }, [photo, onImageConverted]);

  // バックグラウンドで性別判定を実行
  useEffect(() => {
    let cancelled = false;
    
    async function detectGenderInBackground() {
      try {
        const isDevelopment = import.meta.env.DEV;
        
        if (isDevelopment) {
          const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
          if (!apiKey) {
            console.warn('OpenAI API key not found, defaulting to male');
            return;
          }

          // 開発環境では直接OpenAI APIを呼び出し
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
          console.log('Gender detection result:', result);
          const gender = (result === 'male' || result === 'female') ? result as 'male' | 'female' : 'male'; // デフォルトを男性に変更
          console.log('Final gender:', gender);
          
          if (!cancelled) {
            setDetectedGender(gender);
            if (onGenderDetected) {
              onGenderDetected(gender);
            }
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
            console.log('API Gender detection result:', data);
            const gender = data.gender || 'male'; // デフォルトを男性に変更
            
            if (!cancelled) {
              setDetectedGender(gender);
              if (onGenderDetected) {
                onGenderDetected(gender);
              }
            }
          }
        }
      } catch (error) {
        console.error('Gender detection error:', error);
        // エラー時はデフォルト（男性）のまま
      }
    }

    detectGenderInBackground();
    return () => { cancelled = true; };
  }, [photo, onGenderDetected]);

  // 性別判定完了後に初回メッセージを表示
  useEffect(() => {
    if (messages.length === 0 && detectedGender !== null) {
      const pronoun = detectedGender === 'female' ? '私' : '僕';
      const initialMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: MessageSender.AI,
        text: `わあ！大きくなった${pronoun}だ！すごくびっくり！大人になったんだね...なんか疲れてない？でも嬉しいよ、会えて！`,
        conversationIndex: ++conversationCounterRef.current
      };
      setMessages([initialMessage]);
    }
  }, [detectedGender, messages.length]);

  // === TEAM MODIFICATION START ===
  // URL検出とリンク化関数
  const renderMessageWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 underline hover:text-blue-100 break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Udemy講座カード表示コンポーネント（エラーハンドリング付き）
  const UdemyCourseCard: React.FC<{ course: UdemyCourse }> = ({ course }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleImageError = () => {
      setImageError(true);
    };

    return (
      <div className="mt-3 bg-gray-800 rounded-lg overflow-hidden border border-gray-600 hover:border-gray-500 transition-colors">
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-start gap-3 p-3">
            <div className="w-16 h-10 flex-shrink-0 rounded overflow-hidden bg-gray-700">
              {course.thumbnail && !imageError ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white mb-1 leading-tight">
                {course.title}
              </h4>
              <p className="text-xs text-gray-400">Udemy講座</p>
            </div>
          </div>
        </a>
      </div>
    );
  };
  // === TEAM MODIFICATION END ===

  // Realtimeモードの切り替え
  const toggleRealtimeMode = useCallback(() => {
    setIsRealtimeMode(!isRealtimeMode);
  }, [isRealtimeMode]);

  // Realtimeからのメッセージ受信
  const handleRealtimeMessage = useCallback((message: { id: string; sender: MessageSender; text: string }) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Realtime通話終了
  const handleRealtimeEndCall = useCallback(() => {
    setIsRealtimeMode(false);
    onEndCall();
  }, [onEndCall]);

  // 音声認識の初期化
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ja-JP';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(prev => prev || transcript); // 既にテキストが入力されている場合は上書きしない
        setIsListening(false);
        
        // テキストが入力されていない場合のみ自動送信
        if (transcript.trim() && !userInput.trim()) {
          setTimeout(() => {
            handleSendMessage(new Event('submit') as any);
            
            // メッセージ送信後、TTS再生完了を待ってから再度マイクをオンにする
            setTimeout(() => {
              if (recognitionRef.current && !isListening && !isSpeaking) {
                startListening();
              }
            }, 3000); // TTS再生時間を考慮して3秒後
          }, 500);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('音声認識エラー:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          alert('マイクの使用が許可されていません。ブラウザの設定でマイクの使用を許可してください。');
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // 音声認識開始
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  }, [isListening]);

  // 音声認識停止
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // 音声合成停止
  const stopSpeaking = useCallback(() => {
    console.log('Stopping all audio...');
    
    // ブラウザ音声合成を停止
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // 確実に停止するため複数回実行
      setTimeout(() => window.speechSynthesis.cancel(), 10);
      setTimeout(() => window.speechSynthesis.cancel(), 50);
    }
    
    // 現在再生中の音声を停止
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      // 音声要素を削除
      if (audio.parentNode) {
        audio.parentNode.removeChild(audio);
      }
    });
    
    setIsSpeaking(false);
    ttsInProgressRef.current = false; // フラグをリセット
  }, []);

  // テキストを男の子らしい表現に調整
  const adjustTextForChildVoice = useCallback((text: string) => {
    return text
      .replace(/！/g, '！') // 感嘆符を強調
      .replace(/？/g, '？') // 疑問符を強調
      .replace(/。/g, '。') // 句点を強調
      .replace(/、/g, '、'); // 読点を強調
  }, []);

  // 音声合成でテキストを読み上げ（性別対応）
  const speakText = useCallback(async (text: string): Promise<void> => {
    console.log('speakText called with:', text);
    
    // 重複実行防止
    if (ttsInProgressRef.current || isSpeaking) {
      console.log('TTS already in progress, skipping');
      return Promise.resolve();
    }
    
    // すべての音声を完全に停止
    stopSpeaking();
    
    // 少し待ってから実行開始
    await new Promise(resolve => setTimeout(resolve, 100));
    
    ttsInProgressRef.current = true;
    
    // テキストを子供らしく調整
    const adjustedText = adjustTextForChildVoice(text);
    
    const isDevelopment = import.meta.env.DEV;
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (isDevelopment && apiKey) {
      try {
        setIsSpeaking(true);
        
        // 開発環境: 直接OpenAI TTS APIを使用
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: adjustedText,
            voice: (detectedGender === 'female') ? 'alloy' : 'onyx', // 性別に応じた声の選択（女性:alloy、男性:onyx）
            response_format: 'mp3',
            speed: 1.1 // 少し早めの話し方（子供らしく）
          })
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          return new Promise<void>((resolve) => {
            audio.onended = () => {
              setIsSpeaking(false);
              ttsInProgressRef.current = false;
              URL.revokeObjectURL(audioUrl);
              resolve();
            };
            
            audio.onerror = () => {
              setIsSpeaking(false);
              ttsInProgressRef.current = false;
              URL.revokeObjectURL(audioUrl);
              fallbackToBrowserSpeech(text).then(resolve);
            };
            
            audio.play().catch(() => {
              setIsSpeaking(false);
              ttsInProgressRef.current = false;
              URL.revokeObjectURL(audioUrl);
              fallbackToBrowserSpeech(text).then(resolve);
            });
          });
        }
      } catch (error) {
        console.warn('OpenAI TTS API エラー:', error);
        // フォールバックとしてブラウザ音声合成を使用
      }
    } else if (!isDevelopment) {
      try {
        setIsSpeaking(true);
        
        // 本番環境: TTSサーバーレス関数経由
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: adjustedText,
            gender: detectedGender 
          })
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          return new Promise<void>((resolve) => {
            audio.onended = () => {
              setIsSpeaking(false);
              ttsInProgressRef.current = false;
              URL.revokeObjectURL(audioUrl);
              resolve();
            };
            
            audio.onerror = () => {
              setIsSpeaking(false);
              ttsInProgressRef.current = false;
              URL.revokeObjectURL(audioUrl);
              fallbackToBrowserSpeech(text).then(resolve);
            };
            
            audio.play().catch(() => {
              setIsSpeaking(false);
              ttsInProgressRef.current = false;
              URL.revokeObjectURL(audioUrl);
              fallbackToBrowserSpeech(text).then(resolve);
            });
          });
        }
      } catch (error) {
        console.warn('TTS API エラー:', error);
        // フォールバックとしてブラウザ音声合成を使用
      }
    }
    
    // フォールバック: ブラウザ音声合成
    return fallbackToBrowserSpeech(text);
  }, [stopSpeaking, adjustTextForChildVoice, detectedGender]);

  // ブラウザ音声合成フォールバック（性別対応）
  const fallbackToBrowserSpeech = useCallback((text: string): Promise<void> => {
    if ('speechSynthesis' in window) {
      // 既存の音声を停止
      window.speechSynthesis.cancel();
      
      // テキストを子供らしく調整
      const adjustedText = adjustTextForChildVoice(text);
      const utterance = new SpeechSynthesisUtterance(adjustedText);
      utterance.lang = 'ja-JP';
      utterance.rate = 1.3; // 少し早めの話し方（子供らしく）
      
      if (detectedGender === 'female') {
        utterance.pitch = 1.8; // 高いピッチ（女の子の声）
        utterance.volume = 0.8; // 少し控えめな音量
      } else {
        utterance.pitch = 1.6; // やや高いピッチ（男の子の声）
        utterance.volume = 0.9; // 少し大きめの音量（元気な男の子らしく）
      }
      
      return new Promise<void>((resolve) => {
        utterance.onstart = () => {
          setIsSpeaking(true);
        };
        
        utterance.onend = () => {
          setIsSpeaking(false);
          ttsInProgressRef.current = false;
          resolve();
        };
        
        utterance.onerror = (event) => {
          console.error('音声合成エラー:', event.error);
          setIsSpeaking(false);
          ttsInProgressRef.current = false;
          resolve();
        };
        
        window.speechSynthesis.speak(utterance);
      });
    } else {
      console.warn('このブラウザは音声合成をサポートしていません');
      return Promise.resolve();
    }
  }, [adjustTextForChildVoice, detectedGender]);

  // 初期化処理は削除（初回メッセージは性別判定後に表示）

  useEffect(() => {
    console.log('Messages state updated:', messages);
    console.log('Messages count:', messages.length);
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: MessageSender.USER,
      text: userInput.trim(),
      conversationIndex: ++conversationCounterRef.current
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      // 感情分析とコールドリーディングの準備
      const emotionalState = analyzeUserInput(messages);
      const personalityTraits = inferPersonalityTraits(emotionalState);
      const coldReadingPhrase = selectColdReadingPhrase(emotionalState);
      const insightfulQuestion = generateInsightfulQuestion(personalityTraits, emotionalState.concerns);
      
      // コンテキスト情報を追加
      const contextualHint = `
ユーザーの感情状態: ${emotionalState.mood}
話題: ${emotionalState.topics.join(', ') || '一般的な会話'}
推測される性格: ${personalityTraits.slice(0, 2).join(', ')}

次の要素を自然に会話に織り込んでください（子供らしい言葉で）:
- ${coldReadingPhrase}
- ${insightfulQuestion}
`;
      
      // 開発環境かどうかを判定
      const isDevelopment = import.meta.env.DEV;
      let responseText = '';
      let udemyCourseData = null;
      
      if (isDevelopment) {
        // 開発環境: 直接OpenAI APIを呼び出し
        console.log('Sending user message to OpenAI:', userMessage.text);
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('API key not found');
        }

        const openai = new OpenAI({ 
          apiKey: apiKey,
          dangerouslyAllowBrowser: true
        });

        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemInstruction + '\n\n' + contextualHint },
            { role: 'user', content: userMessage.text }
          ],
          max_tokens: 400,  // 日本語200文字に対応（1文字≈2トークン）
          temperature: 0.9
        });
        
        responseText = response.choices[0]?.message?.content || 'すみません、うまく聞こえませんでした。';
        console.log('OpenAI response to user message:', responseText);
      } else {
        // 本番環境: APIエンドポイント経由
        console.log('Production mode: Sending message to API endpoint');
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage.text })
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API error response:', errorData);
          throw new Error(`API request failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('API response data:', data);
        responseText = data.response;
      }

      // Udemy案内機能
      console.log('🎯 Starting Udemy detection for:', userMessage.text);
      const hasPositiveKeywords = detectPositiveKeywords(userMessage.text);
      console.log('🔍 Positive keywords detected:', hasPositiveKeywords);
      
      if (hasPositiveKeywords) {
        console.log('✅ Positive keywords found, getting course recommendation...');
        const recommendedCourse = getUdemyCourseWithThumbnail(userMessage.text);
        console.log('📚 Recommended course:', recommendedCourse);
        
        if (recommendedCourse) {
          console.log('🎓 Course found, generating suggestion...');
          const suggestion = generateUdemySuggestion(userMessage.text, [recommendedCourse]);
          console.log('💬 Generated suggestion:', suggestion);
          
          if (suggestion) {
            responseText += `\n\n${suggestion}`;
            udemyCourseData = {
              id: recommendedCourse.id,
              title: recommendedCourse.title,
              url: recommendedCourse.url,
              thumbnail: recommendedCourse.thumbnail
            };
            console.log('✅ Udemy suggestion added to response');
          } else {
            console.log('❌ No suggestion generated');
          }
        } else {
          console.log('❌ No course recommended');
        }
      } else {
        console.log('❌ No positive keywords detected');
      }
      
      const aiMessageId = `ai-${Date.now()}`;
      const messageData: ChatMessage = {
        id: aiMessageId,
        sender: MessageSender.AI,
        text: responseText,
        conversationIndex: ++conversationCounterRef.current,
        ...(udemyCourseData && { udemyCourse: udemyCourseData })
      };
      
      // 特定の会話番号での処理実行例
      if (messageData.conversationIndex === 5) {
        // 会話番号5で特別な処理を実行
        console.log('🎯 会話番号5に到達！特別な処理を実行可能');
        // 例：より深い質問への切り替え、特別なレスポンス追加など
      }
      
      setMessages(prev => [...prev, messageData]);

      // 自動TTS再生を完全無効化（手動音声ボタンでのみ再生）
      // const aiMessageCount = messages.filter(msg => msg.sender === MessageSender.AI).length;
      // if (aiMessageCount >= 2 && !isSpeaking && !ttsInProgressRef.current) {
      //   setTimeout(() => {
      //     speakText(responseText).then(() => {
      //       setTimeout(() => {
      //         if (recognitionRef.current && !isListening) {
      //           startListening();
      //         }
      //       }, 1000);
      //     });
      //   }, 1000);
      // }

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { 
        id: 'error-2', 
        sender: MessageSender.AI, 
        text: "頭がちょっとぼーっとする…よくわからなかった。" 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, messages]);

  console.log('ChatScreen render - messages:', messages);
  console.log('ChatScreen render - isLoading:', isLoading);
  
  // Realtimeモードの場合は専用コンポーネントを表示
  if (isRealtimeMode) {
    return (
      <RealtimeCall
        onMessage={handleRealtimeMessage}
        onEndCall={handleRealtimeEndCall}
        gender={detectedGender || 'male'}
      />
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col bg-black bg-opacity-80 rounded-[2rem] overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-700 bg-gray-900">
        <img src={photo} alt="幼い頃の自分" className="w-10 h-10 rounded-full object-cover" />
        <div className="ml-3 flex-1">
          <p className="font-bold text-white">幼い頃のあなた</p>
          <p className="text-xs text-green-400">オンライン</p>
        </div>
        <div className="flex space-x-2">
          {/* 音声入力ボタン */}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!recognitionRef.current || isLoading}
            className={`p-2 rounded-full transition-colors ${
              isListening 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:bg-gray-600 disabled:cursor-not-allowed`}
            title={isListening ? '音声入力を停止' : '音声で話す'}
          >
            {isListening ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18L18 6" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* リアルタイム会話開始ボタン */}
          <button
            onClick={toggleRealtimeMode}
            className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
            title="リアルタイム音声会話を開始"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 初期化中のローディング表示 */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-end gap-2 justify-start">
            <img src={currentPhoto} alt="AI" className="w-6 h-6 rounded-full object-cover self-start" />
            <div className="bg-gray-700 rounded-2xl rounded-bl-none px-4 py-2">
              <div className="flex items-center space-x-1">
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === MessageSender.AI && <img src={photo} alt="AI" className="w-6 h-6 rounded-full object-cover self-start" />}
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-white ${msg.sender === MessageSender.USER ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
              {/* === TEAM MODIFICATION START === */}
              <p className="text-sm break-words whitespace-pre-wrap">
                {renderMessageWithLinks(msg.text)}
              </p>
              {/* Udemy講座カード表示 */}
              {msg.udemyCourse && (
                <UdemyCourseCard course={msg.udemyCourse} />
              )}
              {/* === TEAM MODIFICATION END === */}
            </div>
          </div>
        ))}
         {isLoading && messages[messages.length - 1]?.sender === MessageSender.USER && (
            <div className="flex items-end gap-2 justify-start">
              <img src={currentPhoto} alt="AI" className="w-6 h-6 rounded-full object-cover self-start" />
              <div className="bg-gray-700 rounded-2xl rounded-bl-none px-4 py-2">
                <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-700 bg-gray-900">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isListening ? "音声を認識中..." : "メッセージを入力または音声で話してください..."}
            className="flex-1 bg-gray-700 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            readOnly={false}
          />
          <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-blue-600 rounded-full p-3 text-white disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
            <SendIcon />
          </button>
        </form>
         <button onClick={onEndCall} className="w-full text-center text-red-500 text-sm mt-3 hover:text-red-400">通話を終了</button>
      </div>
    </div>
  );
};

export default ChatScreen;