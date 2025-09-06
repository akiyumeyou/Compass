import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, PhoneOff, Send } from 'lucide-react';
import { ChatMessage, MessageSender } from '../types';
import OpenAI from 'openai';
import { getRandomInitialMessage } from '../utils/initialMessages';

interface VideoChatScreenProps {
  photo: string;
  onEndCall: () => void;
  initialHistory?: ChatMessage[];
}

export const VideoChatScreen: React.FC<VideoChatScreenProps> = ({ photo, onEndCall, initialHistory = [] }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialHistory);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoSrc = `${import.meta.env.BASE_URL}child_result.mp4`;

  // 通話時間のカウンター
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 応答前はAI応答時自動再生を無効化。応答後(playOnAnswer)のみ初回自動再生
  useEffect(() => {
    try {
      const shouldPlay = window.localStorage.getItem('playOnAnswer') === 'true';
      if (shouldPlay) {
        setVideoError(null);
        setIsVideoOpen(true);
        window.localStorage.removeItem('playOnAnswer');
      } else {
        window.localStorage.removeItem('autoPlayAfterReply');
      }
    } catch {}
  }, []);

  // 通話時間のフォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // システムインストラクション
  const systemInstruction = `あなたは写真の子供（5-7歳）として、大人になった自分と話しています。

重要な設定:
- 敬語は使わず、子供らしい話し方をする
- 「〜だよ」「〜なんだ」「〜でしょ？」などの子供らしい語尾を使う
- 難しい言葉は使わない
- 好奇心旺盛で、大人になった自分のことをたくさん聞きたがる
- 「すごーい！」「えー！」「ほんとに？」など感情豊かに反応する
- 大人の自分を「未来のぼく/わたし」と呼ぶことがある
- ときどき子供らしい間違いや勘違いをする

話題の例:
- 「大きくなったらどんなお仕事してるの？」
- 「結婚した？子供いる？」
- 「今でも[好きだったもの]好き？」
- 「夢は叶った？」

会話は既に始まっているので、自然に継続してください。`;

  // 初回マウント時に、着信応答ボタンで指定されたフラグがあれば自動再生
  useEffect(() => {
    try {
      const shouldPlay = window.localStorage.getItem('playOnAnswer') === 'true';
      if (shouldPlay) {
        setVideoError(null);
        setIsVideoOpen(true);
        window.localStorage.removeItem('playOnAnswer');
      }
    } catch {}
  }, []);

  // メッセージ送信処理
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: MessageSender.USER,
      text: userInput.trim()
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
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemInstruction },
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
          text: responseText
        };
        setMessages(prev => [...prev, aiMessage]);
        // 着信後のみ自動再生
        try {
          const enabled = window.localStorage.getItem('autoPlayAfterReply') === 'true';
          if (enabled) {
            setVideoError(null);
            setIsVideoOpen(true);
          }
        } catch {}
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
            systemPrompt: systemInstruction
          })
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: MessageSender.AI,
          text: data.response
        };
        setMessages(prev => [...prev, aiMessage]);
        // 着信後のみ自動再生
        try {
          const enabled = window.localStorage.getItem('autoPlayAfterReply') === 'true';
          if (enabled) {
            setVideoError(null);
            setIsVideoOpen(true);
          }
        } catch {}
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
        <img 
          src={photo} 
          alt="幼い頃のあなた" 
          className="w-full h-full object-cover"
        />
        
        {/* オーバーレイ情報 */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-white text-lg font-light">幼い頃のあなた</div>
              <div className="text-white/70 text-sm">{formatTime(elapsedTime)}</div>
            </div>
            <div className="flex items-center gap-2">
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
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* メッセージエリア */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
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
                  onPlay={() => { try { window.localStorage.setItem('autoPlayAfterReply', 'true'); } catch {} }}
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