import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, PhoneOff, Send } from 'lucide-react';
import { ChatMessage, MessageSender } from '../types';
import OpenAI from 'openai';
import { getRandomInitialMessage } from '../utils/initialMessages';
import { generateVideoCallStartMessage } from '../utils/videoCallMessages';
import { ThreeStepPersuasion, getConversationStage, analyzeConversationContext } from '../utils/conversationStrategy';

interface VideoChatScreenProps {
  photo: string;
  onEndCall: () => void;
  initialHistory?: ChatMessage[];
  gender?: 'male' | 'female';
}

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
  const initialMessageAddedRef = useRef<boolean>(false); // 初回メッセージ追加フラグ
  const conversationCounterRef = useRef<number>(initialHistory.length); // 会話順序カウンター（初期履歴を考慮）
  const persuasionManagerRef = useRef<ThreeStepPersuasion>(new ThreeStepPersuasion(initialHistory));

  // OpenAI TTS機能（重複防止）
  const speakText = async (text: string) => {
    try {
      // 同じテキストの重複読み上げを防止
      if (lastSpokenTextRef.current === text) {
        console.log('Duplicate text detected, skipping TTS:', text);
        return;
      }
      lastSpokenTextRef.current = text;

      // 既存の音声を停止
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }

      const isDevelopment = import.meta.env.DEV;
      
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
        const audio = new Audio(audioUrl);
        
        // 現在の音声として設定
        currentAudioRef.current = audio;
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          // 音声完了後は重複チェックをリセット
          lastSpokenTextRef.current = '';
          // 音声完了後に動画を再生
          playVideo();
        };
        
        await audio.play();
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
        const audio = new Audio(audioUrl);
        
        // 現在の音声として設定
        currentAudioRef.current = audio;
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          // 音声完了後は重複チェックをリセット
          lastSpokenTextRef.current = '';
          // 音声完了後に動画を再生
          playVideo();
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      // エラー時は音声出力をスキップ（フォールバック無し）
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
      }, 1000); // 1秒後に新メッセージ
    }
  }, [initialHistory, gender]);

  // 動画再生関数
  const playVideo = () => {
    console.log('playVideo called, isVideoPlaying:', isVideoPlaying);
    if (videoRef.current && !isVideoPlaying) {
      videoRef.current.currentTime = 0; // 動画を最初から再生
      videoRef.current.play().then(() => {
        console.log('動画再生開始');
        setIsVideoPlaying(true);
      }).catch(error => {
        console.error('動画再生エラー:', error);
      });
    }
  };

  // 動画終了時の処理
  const handleVideoEnded = () => {
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
    // 全メッセージ履歴を構築（初期履歴 + 現在のメッセージ）
    const fullHistory = [...initialHistory, ...messages.slice(initialHistory.length)];
    persuasionManagerRef.current.updateHistory(fullHistory[fullHistory.length - 1] || { 
      id: '', 
      sender: MessageSender.AI, 
      text: '', 
      conversationIndex: conversationCounterRef.current 
    });
    
    return persuasionManagerRef.current.getCurrentPrompt(gender);
  };

  // メッセージ送信処理
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

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
      
      if (isDevelopment) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('API key not found');
        }

        const openai = new OpenAI({ 
          apiKey: apiKey,
          dangerouslyAllowBrowser: true
        });

        const conversationHistory = messages.map(msg => ({
          role: msg.sender === MessageSender.AI ? 'assistant' as const : 'user' as const,
          content: msg.text
        }));

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: getSystemInstruction() },
            ...conversationHistory,
            { role: 'user', content: userInput.trim() }
          ],
          max_tokens: 150,
          temperature: 0.8
        });

        const responseText = response.choices[0]?.message?.content || 'ごめん、よく聞こえなかった！';
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: MessageSender.AI,
          text: responseText,
          conversationIndex: ++conversationCounterRef.current
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // 会話段階に応じたログとアクション（開発環境）
        const stage = getConversationStage(aiMessage.conversationIndex);
        if (aiMessage.conversationIndex === 7) {
          console.log('🎯 共感フェーズ完了！気づきフェーズへ移行');
        } else if (aiMessage.conversationIndex === 10) {
          console.log('💡 気づきフェーズ完了！行動変容フェーズへ');
        } else if (aiMessage.conversationIndex >= 11) {
          console.log('🚀 行動変容を促す段階 - ユーザーの約束を引き出す');
          // 行動変容の約束を検出
          if (responseText.includes('約束') || responseText.includes('指切り')) {
            console.log('✨ 子供から約束を求められています！');
          }
        }
        
        // AIメッセージを音声で読み上げる
        speakText(responseText).then(() => {
          console.log('TTS完了、動画再生を開始');
          playVideo();
        }).catch(error => {
          console.error('TTS error:', error);
          // TTSエラーでも動画は再生
          playVideo();
        });
      } else {
        // 本番環境
        const conversationHistory = messages.map(msg => ({
          role: msg.sender === MessageSender.AI ? 'assistant' : 'user',
          content: msg.text
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: userInput.trim(),
            history: conversationHistory,
            systemPrompt: getSystemInstruction()
          })
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: MessageSender.AI,
          text: data.response,
          conversationIndex: ++conversationCounterRef.current
        };
        
        // 会話段階に応じたログとアクション
        const stage = getConversationStage(aiMessage.conversationIndex);
        if (aiMessage.conversationIndex === 7) {
          console.log('🎯 共感フェーズ完了！気づきフェーズへ移行');
        } else if (aiMessage.conversationIndex === 10) {
          console.log('💡 気づきフェーズ完了！行動変容フェーズへ');
        } else if (aiMessage.conversationIndex >= 11) {
          console.log('🚀 行動変容を促す段階 - ユーザーの約束を引き出す');
          // 行動変容の約束を検出
          if (data.response.includes('約束') || data.response.includes('指切り')) {
            console.log('✨ 子供から約束を求められています！');
          }
        }
        
        setMessages(prev => [...prev, aiMessage]);
        
        // AIメッセージを音声で読み上げる
        speakText(data.response).then(() => {
          console.log('TTS完了、動画再生を開始');
          playVideo();
        }).catch(error => {
          console.error('TTS error:', error);
          // TTSエラーでも動画は再生
          playVideo();
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
              className={`flex ${message.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}
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