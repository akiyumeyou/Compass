import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, PhoneOff, Send } from 'lucide-react';
import { ChatMessage, MessageSender } from '../types';
import OpenAI from 'openai';
import { getRandomInitialMessage } from '../utils/initialMessages';
import { generateVideoCallStartMessage } from '../utils/videoCallMessages';
import { ThreeStepPersuasion, getConversationStage, analyzeConversationContext } from '../utils/conversationStrategy';
import { selectCourseByCategory, UdemyCourse } from '../udemyCatalog';

interface VideoChatScreenProps {
  photo: string;
  onEndCall: () => void;
  initialHistory?: ChatMessage[];
  gender?: 'male' | 'female';
}

// Udemy講座カード表示コンポーネント
const UdemyCourseCard: React.FC<{ course: UdemyCourse }> = ({ course }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="mb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-400/30">
      <div className="flex items-start gap-3">
        {/* サムネイル画像 */}
        <div className="flex-shrink-0 w-24 h-16 bg-gray-700 rounded-lg overflow-hidden">
          {!imageError && course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-white text-xs font-bold">Udemy</span>
            </div>
          )}
        </div>
        
        {/* コース情報 */}
        <div className="flex-1">
          <p className="text-xs text-gray-400">Udemy講座</p>
          <h4 className="text-sm font-semibold text-white mb-1 line-clamp-2">
            {course.title}
          </h4>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-yellow-400">★ {course.rating}</span>
            <span className="text-gray-400">{course.duration}</span>
          </div>
          <div className="mt-2">
            <a 
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full transition-colors"
            >
              詳細を見る →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoChatScreen: React.FC<VideoChatScreenProps> = ({ photo, onEndCall, initialHistory = [], gender = 'male' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialHistory);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const initialSpokenRef = useRef<boolean>(false);
  const lastSpokenTextRef = useRef<string>('');
  const lastSpeakTimeRef = useRef<number>(0); // 最後に音声を再生した時刻
  const initialMessageAddedRef = useRef<boolean>(false); // 初回メッセージ追加フラグ
  const conversationCounterRef = useRef<number>(initialHistory.length); // 会話順序カウンター（初期履歴を考慮）
  const persuasionManagerRef = useRef<ThreeStepPersuasion | null>(null);
  
  // タイミング調整用の定数（ミリ秒）
  const VIDEO_LEAD_TIME = 20; // ビデオをわずかに先行させる（口の動きが自然に見える）
  const VIDEO_TRAIL_TIME = 300; // 音声終了後もビデオを継続する時間
  
  // ThreeStepPersuasionの初期化
  if (!persuasionManagerRef.current) {
    persuasionManagerRef.current = new ThreeStepPersuasion(initialHistory);
  }

  // OpenAI TTS機能（重複防止）
  const speakText = async (text: string) => {
    try {
      // 同じテキストの重複読み上げを防止
      if (lastSpokenTextRef.current === text) {
        console.log('Duplicate text detected, skipping TTS:', text);
        return;
      }
      lastSpokenTextRef.current = text;

      // 最後の発話時刻を記録
      lastSpeakTimeRef.current = Date.now();

      // 既存の音声を停止
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }
      
      console.log('🎤 TTS処理開始:', new Date().toISOString());
      
      // 動画の開始は音声準備完了後に移動（同期のため）

      const isDevelopment = import.meta.env.DEV;
      
      // 音声を先に準備
      let audio: HTMLAudioElement | null = null;
      
      if (isDevelopment) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          console.warn('OpenAI API key not found, skipping TTS');
          return;
        }

        // OpenAI TTS API呼び出し
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: gender === 'female' ? 'alloy' : 'nova', // 性別に基づいて音声を選択
            response_format: 'mp3',
            speed: 0.9
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI TTS failed: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audio = new Audio(audioUrl);
        
        console.log('🎵 音声データ準備完了:', new Date().toISOString());
        
        // 現在の音声として設定
        currentAudioRef.current = audio;
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          // 音声完了後は重複チェックをリセット
          lastSpokenTextRef.current = '';
          // 音声終了と同時に即座に動画を停止（遅延なし）
          console.log('Stopping video immediately after audio ended');
          stopVideo();
        };
      } else {
        // 本番環境: APIルート経由でTTS
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, gender }),
        });

        if (!response.ok) {
          throw new Error('TTS API request failed');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audio = new Audio(audioUrl);
        
        console.log('🎵 音声データ準備完了:', new Date().toISOString());
        
        // 現在の音声として設定
        currentAudioRef.current = audio;
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          // 音声完了後は重複チェックをリセット
          lastSpokenTextRef.current = '';
          // 音声終了と同時に即座に動画を停止（遅延なし）
          console.log('Stopping video immediately after audio ended');
          stopVideo();
        };
      }
      
      // 音声準備完了後、動画と音声を同時に開始
      if (audio) {
        console.log('🎵 音声と動画を同時に開始:', new Date().toISOString());
        playVideo();  // 音声と同時に動画を開始
        await audio.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      // エラー時はビデオを停止
      stopVideo();
    }
  };

  // 通話時間のカウンター
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // コンポーネント終了時のクリーンアップ
  useEffect(() => {
    return () => {
      // 音声を停止
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }
    };
  }, []);

  // ビデオ通話開始時に新しい会話4を生成
  useEffect(() => {
    if (initialHistory.length > 0 && !initialMessageAddedRef.current) {
      initialMessageAddedRef.current = true;
      
      // 新しい会話4を生成（電話してきた理由）
      const newMessage: ChatMessage = {
        id: `ai-video-${Date.now()}`,
        sender: MessageSender.AI,
        text: generateVideoCallStartMessage(gender),
        conversationIndex: initialHistory.length + 1 // 会話4として追加
      };
      
      // conversationCounterを会話4に設定
      conversationCounterRef.current = initialHistory.length + 1;
      
      // 遅延後にメッセージ追加と音声再生
      setTimeout(() => {
        setMessages(prev => [...prev, newMessage]);
        // 新しいメッセージを音声で読み上げる
        speakText(newMessage.text).catch(error => console.error('TTS error:', error));
      }, 500); // 0.5秒後に新メッセージ（高速化）
    }
  }, [initialHistory, gender]);

  // 動画再生関数
  const playVideo = () => {
    console.log('playVideo called, isVideoPlaying:', isVideoPlaying, 'gender:', gender);
    
    // 女性の場合は動画制御をスキップ（静止画表示のため）
    if (gender === 'female') {
      console.log('女性ユーザーのため動画制御をスキップ（静止画表示）');
      return;
    }
    
    if (videoRef.current) {
      // 動画を最初から再生（音声と同期）
      videoRef.current.currentTime = 0;
      // ループを有効化（音声再生中のみループ）
      videoRef.current.loop = true;
      
      if (!isVideoPlaying) {
        // 停止中の場合は再生開始
        videoRef.current.play().then(() => {
          console.log('動画再生開始（最初から）');
          setIsVideoPlaying(true);
        }).catch(error => {
          console.error('動画再生エラー:', error);
        });
      } else {
        // 既に再生中でも最初から再生し直す
        console.log('動画を最初から再生し直す');
        videoRef.current.play().catch(() => {
          // 既に再生中の場合はエラーになるが無視
        });
      }
    }
  };
  
  // 動画停止関数
  const stopVideo = () => {
    console.log('🛑 stopVideo called, gender:', gender);
    
    // 女性の場合は動画制御をスキップ（静止画表示のため）
    if (gender === 'female') {
      console.log('女性ユーザーのため動画制御をスキップ（静止画表示）');
      return;
    }
    
    if (videoRef.current) {
      // ループを即座に無効化
      videoRef.current.loop = false;
      
      // 状態に関わらず強制的に動画を停止
      videoRef.current.pause();
      // 動画を最初に戻す（次回再生時のため）
      videoRef.current.currentTime = 0;
      setIsVideoPlaying(false);
      console.log('✅ 動画を強制停止（位置をリセット）');
    }
  };

  // 動画終了時の処理（ループ再生では呼ばれない）
  const handleVideoEnded = () => {
    // ループ再生が有効なため、この関数は実際には呼ばれない
    console.log('動画終了（ループ再生では発生しない）');
    setIsVideoPlaying(false);
  };

  // 通話時間のフォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // システムインストラクション（会話段階に基づいて動的に生成）
  const getSystemInstruction = () => {
    if (!persuasionManagerRef.current) {
      return ''; // フォールバック
    }
    
    // 全メッセージ履歴を構築（初期履歴 + 現在のビデオ通話メッセージ）
    const fullHistory = [...initialHistory, ...messages];
    
    // 最新メッセージのみを追加（重複チェックはupdateHistory内で実施）
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      persuasionManagerRef.current.updateHistory(latestMessage);
    }
    
    const basePrompt = persuasionManagerRef.current.getCurrentPrompt(gender);
    
    // Udemy講座推薦システムを追加（会話の中盤以降で自然に提案）
    const udemyPrompt = conversationCounterRef.current >= 4 ? `

# 学習意欲への自然な応援【会話中盤以降】

会話が進んできた段階（4ターン目以降）で、ユーザーが明確な学習意欲を示した場合のみ、
自然な流れで応援し、関連する講座を紹介してください。

【明確な学習意欲の例】
- 「プログラミングを本格的に学びたい」
- 「転職のためにスキルアップしたい」
- 「新しいキャリアに挑戦したい」
- 「具体的な技術（Python、React等）を身につけたい」

【応答方針】
- 子供らしい純粋な応援の言葉で励ます
- 押し売りにならないよう、さりげなく提案する
- ユーザーが具体的に尋ねた場合のみタグを含める

【タグ形式（必要な場合のみ）】
[UDEMY_RECOMMEND: カテゴリ名]

カテゴリ：プログラミング、デザイン、ビジネス、キャリア、AI

【自然な応答例】
ユーザー：「Pythonでプログラミングを本格的に学びたいんだ」
応答：「わぁ！プログラミングかっこいい！大人の${gender === 'female' ? '私' : '僕'}がコード書けるようになるなんて、すごくワクワクする！きっとできるよ、応援してる！[UDEMY_RECOMMEND: プログラミング]」

【重要】一般的な話題や曖昧な興味には推薦タグを含めないでください。` : '';
    
    return basePrompt + udemyPrompt;
  };

  // メッセージ送信処理
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    // ユーザーが入力した時はビデオを停止（子供が聞いている状態）
    console.log('👤 ユーザー入力のためビデオ停止');
    stopVideo();

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: MessageSender.USER,
      text: userInput.trim(),
      conversationIndex: ++conversationCounterRef.current
    };

    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const isDevelopment = import.meta.env.DEV;
      let responseText = '';
      let udemyCourseData = null;
      
      if (isDevelopment) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('API key not found');
        }

        const openai = new OpenAI({ 
          apiKey: apiKey,
          dangerouslyAllowBrowser: true
        });

        // 完全な会話履歴を構築（初期履歴 + 現在のメッセージ）
        const fullHistory = [...initialHistory, ...messages];
        const conversationHistory = fullHistory.map(msg => ({
          role: msg.sender === MessageSender.AI ? 'assistant' as const : 'user' as const,
          content: msg.text
        }));

        const systemPrompt = getSystemInstruction();
        console.log('📝 System prompt for conversation index', conversationCounterRef.current + 1);
        console.log('Stage:', getConversationStage(conversationCounterRef.current + 1));
        
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: userInput.trim() }
          ],
          max_tokens: 150,
          temperature: 0.8
        });

        responseText = response.choices[0]?.message?.content || 'ごめん、よく聞こえなかった！';
        
        // Udemy推薦検出
        console.log('🎯 Checking AI response for Udemy recommendations');
        const udemyMatch = responseText.match(/\[UDEMY_RECOMMEND:\s*([^\]]+)\]/);
        
        if (udemyMatch) {
          const category = udemyMatch[1].trim();
          console.log(`📚 Udemy recommendation detected: ${category}`);
          
          // タグを削除
          responseText = responseText.replace(udemyMatch[0], '').trim();
          
          // カテゴリに基づいてコースを選択
          const recommendedCourse = selectCourseByCategory(category);
          
          if (recommendedCourse) {
            udemyCourseData = {
              ...recommendedCourse,
              thumbnail: recommendedCourse.thumbnail || undefined
            };
            console.log('✅ Udemy course selected:', recommendedCourse.title);
          }
        } else if (conversationCounterRef.current >= 4) {
          // 会話の中盤以降（4ターン目以降）でフォールバック検出を有効化
          console.log('⚠️ No UDEMY_RECOMMEND tag found, checking for fallback keywords (conversation turn:', conversationCounterRef.current, ')');
          
          // より具体的な学習意図を示すキーワードのみに反応
          const strongLearningKeywords = [
            'プログラミング学びたい', '勉強したい', '講座教えて', 'おすすめの講座',
            'スキルアップしたい', '新しいこと始めたい', 'キャリアチェンジ'
          ];
          
          const hasStrongLearningIntent = strongLearningKeywords.some(keyword => 
            userInput.includes(keyword)
          );
          
          // 明確な学習カテゴリが含まれている場合のみ
          const hasClearCategory = /プログラミング|Python|JavaScript|React|デザイン|AI|機械学習|起業|キャリア/.test(userInput);
          
          if (hasStrongLearningIntent && hasClearCategory) {
            console.log('💡 Strong learning intent detected via keywords, selecting course');
            const category = userInput.includes('プログラミング') || userInput.includes('Python') || userInput.includes('JavaScript') ? 'プログラミング' :
                           userInput.includes('デザイン') ? 'デザイン' :
                           userInput.includes('AI') || userInput.includes('機械学習') ? 'AI' :
                           userInput.includes('起業') || userInput.includes('ビジネス') ? 'ビジネス' :
                           userInput.includes('キャリア') ? 'キャリア' : null;
            
            if (category) {
              const recommendedCourse = selectCourseByCategory(category);
              
              if (recommendedCourse) {
                udemyCourseData = {
                  ...recommendedCourse,
                  thumbnail: recommendedCourse.thumbnail || undefined
                };
                console.log('✅ Udemy course selected via fallback:', recommendedCourse.title);
              }
            }
          }
        }
        
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: MessageSender.AI,
          text: responseText,
          conversationIndex: ++conversationCounterRef.current,
          ...(udemyCourseData && { udemyCourse: udemyCourseData })
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // 会話段階に応じたログとアクション（開発環境）【早期発動版】
        const stage = getConversationStage(aiMessage.conversationIndex);
        if (aiMessage.conversationIndex === 6) {
          console.log('🎯 共感フェーズ完了！気づきフェーズへ移行');
        } else if (aiMessage.conversationIndex === 8) {
          console.log('💡 気づきフェーズ完了！行動変容フェーズへ');
        } else if (aiMessage.conversationIndex >= 9) {
          console.log('🚀 行動変容を促す段階 - ユーザーの約束を引き出す（会話9で早期到達！）');
          // 行動変容の約束を検出
          if (responseText.includes('約束') || responseText.includes('指切り')) {
            console.log('✨ 子供から約束を求められています！');
          }
        }
        
        // AIメッセージを音声で読み上げる（ビデオは内部で先行開始される）
        speakText(responseText).catch(error => {
          console.error('TTS error:', error);
          // エラー時はビデオを停止
          stopVideo();
        });
      } else {
        // 本番環境
        // 完全な会話履歴を構築（初期履歴 + 現在のメッセージ）
        const fullHistory = [...initialHistory, ...messages];
        const conversationHistory = fullHistory.map(msg => ({
          role: msg.sender === MessageSender.AI ? 'assistant' : 'user',
          content: msg.text
        }));

        const systemPrompt = getSystemInstruction();
        console.log('📝 System prompt for conversation index', conversationCounterRef.current + 1);
        console.log('Stage:', getConversationStage(conversationCounterRef.current + 1));
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: userInput.trim(),
            history: conversationHistory,
            systemPrompt: systemPrompt
          })
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();
        responseText = data.response;
        
        // Udemy推薦検出（本番環境）
        console.log('🎯 Checking AI response for Udemy recommendations');
        const udemyMatch = responseText.match(/\[UDEMY_RECOMMEND:\s*([^\]]+)\]/);
        
        if (udemyMatch) {
          const category = udemyMatch[1].trim();
          console.log(`📚 Udemy recommendation detected: ${category}`);
          
          // タグを削除
          responseText = responseText.replace(udemyMatch[0], '').trim();
          
          // カテゴリに基づいてコースを選択
          const recommendedCourse = selectCourseByCategory(category);
          
          if (recommendedCourse) {
            udemyCourseData = {
              ...recommendedCourse,
              thumbnail: recommendedCourse.thumbnail || undefined
            };
            console.log('✅ Udemy course selected:', recommendedCourse.title);
          }
        }
        
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: MessageSender.AI,
          text: responseText,
          conversationIndex: ++conversationCounterRef.current,
          ...(udemyCourseData && { udemyCourse: udemyCourseData })
        };
        
        // 会話段階に応じたログとアクション【早期発動版】
        const stage = getConversationStage(aiMessage.conversationIndex);
        if (aiMessage.conversationIndex === 6) {
          console.log('🎯 共感フェーズ完了！気づきフェーズへ移行');
        } else if (aiMessage.conversationIndex === 8) {
          console.log('💡 気づきフェーズ完了！行動変容フェーズへ');
        } else if (aiMessage.conversationIndex >= 9) {
          console.log('🚀 行動変容を促す段階 - ユーザーの約束を引き出す（会話9で早期到達！）');
          // 行動変容の約束を検出
          if (responseText.includes('約束') || responseText.includes('指切り')) {
            console.log('✨ 子供から約束を求められています！');
          }
        }
        
        setMessages(prev => [...prev, aiMessage]);
        
        // AIメッセージを音声で読み上げる（ビデオは内部で先行開始される）
        speakText(responseText).catch(error => {
          console.error('TTS error:', error);
          // エラー時はビデオを停止
          stopVideo();
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: MessageSender.AI,
        text: 'あれ？ちょっと聞こえなかった。もう一回言って？'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // スクロール制御
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  return (
    <div className="absolute inset-0 flex flex-col bg-gray-900">
      {/* ビデオエリア（上部） */}
      <div className="relative flex-shrink-0 h-2/5 bg-black rounded-t-[2rem] overflow-hidden">
        {gender === 'male' ? (
          // 男性の場合: 動画を表示
          <video 
            ref={videoRef}
            src="/child_result.mp4"
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="auto"
            onEnded={handleVideoEnded}
            style={{ 
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 0
            }}
          />
        ) : (
          // 女性の場合: 静止画を表示
          <img 
            src={photo}
            alt="幼い頃のあなた"
            className="w-full h-full object-cover"
            style={{ 
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 0
            }}
          />
        )}
        
        {/* オーバーレイ情報 */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-white text-lg font-light">幼い頃のあなた</div>
              <div className="text-white/70 text-sm">{formatTime(elapsedTime)}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onEndCall}
                className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <PhoneOff className="text-white" size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* チャットエリア（下部） */}
      <div className="flex-1 flex flex-col bg-gray-900 min-h-0">
        {/* メッセージエリア */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${message.sender === MessageSender.USER ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.sender === MessageSender.USER
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
              {/* Udemy講座カード表示 */}
              {message.udemyCourse && (
                <div className="max-w-[80%] mt-2">
                  <UdemyCourseCard course={message.udemyCourse} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 入力エリア */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="メッセージを入力..."
              className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="text-white" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};