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

interface ChatScreenProps {
  photo: string;
  onEndCall: () => void;
  onFirstChatComplete?: (history: ChatMessage[]) => void; // 1ターン完了時のコールバック
}

const ChatScreen: React.FC<ChatScreenProps> = ({ photo, onEndCall, onFirstChatComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoSrc = `${import.meta.env.BASE_URL}child_result.mp4`;

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

  // 1.5ターン完了後の遷移処理
  useEffect(() => {
    // AI初回メッセージ + ユーザー返信 + AI2回目メッセージ = 3メッセージで着信画面へ遷移
    if (messages.length >= 3 && onFirstChatComplete) {
      const timer = setTimeout(() => {
        onFirstChatComplete(messages);
      }, 3000); // 3秒後に遷移
      return () => clearTimeout(timer);
    }
  }, [messages, onFirstChatComplete]);


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


  useEffect(() => {
    // 既に初期化済みの場合はスキップ（React StrictMode対策）
    if (initRef.current) return;
    initRef.current = true;
    
    // 応答ボタンを押すまではAI応答時の自動再生を無効
    try {
      if (window.localStorage.getItem('playOnAnswer') !== 'true') {
        window.localStorage.removeItem('autoPlayAfterReply');
      }
    } catch {}

    const initializeChat = async () => {
      setIsLoading(true);
      
      try {
        // 開発環境かどうかを判定
        const isDevelopment = import.meta.env.DEV;
        
        if (isDevelopment) {
          // 開発環境: 直接OpenAI APIを呼び出し
          console.log('Development mode: Using direct OpenAI API');
          const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
          console.log('API Key exists:', !!apiKey);
          
          if (!apiKey) {
            throw new Error('API key not found');
          }

          const openai = new OpenAI({ 
            apiKey: apiKey,
            dangerouslyAllowBrowser: true
          });

          console.log('Selecting random initial message...');
          
          // ランダムな初回メッセージを選択
          const randomInitialMessage = getRandomInitialMessage();
          
          // GPT-4にランダムメッセージを少しパーソナライズさせる（オプション）
          const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              { 
                role: 'system', 
                content: systemInstruction + '\n\n次のメッセージを参考に、同じ感情とトーンを保ちながら、少しだけ自分の言葉で言い換えてください: ' + randomInitialMessage 
              }
            ],
            max_tokens: 400,  // 日本語200文字に対応（1文字≈2トークン）
            temperature: 0.7  // 少し低めの温度で一貫性を保つ
          });
          
          const responseText = response.choices[0]?.message?.content || randomInitialMessage;
          console.log('Initial greeting from childhood self:', responseText);
          
          const aiMessageId = `ai-${Date.now()}`;
          console.log('Setting initial message to state:', { id: aiMessageId, sender: MessageSender.AI, text: responseText });
          setMessages([{ id: aiMessageId, sender: MessageSender.AI, text: responseText }]);
          // 着信後のみ自動再生
          try {
            const enabled = window.localStorage.getItem('autoPlayAfterReply') === 'true';
            if (enabled) {
              setVideoError(null);
              setIsVideoOpen(true);
            }
          } catch {}
          setIsLoading(false);
        } else {
          // 本番環境: APIエンドポイント経由
          console.log('Production mode: Using API endpoint');
          console.log('Current URL:', window.location.href);
          console.log('API endpoint URL:', '/api/chat');
          
          // ランダムな初回メッセージを選択
          const randomInitialMessage = getRandomInitialMessage();
          
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: "", 
              isInitial: true,
              systemPrompt: systemInstruction + '\n\n次のメッセージを参考に、同じ感情とトーンを保ちながら、少しだけ自分の言葉で言い換えてください: ' + randomInitialMessage
            })
          });

          console.log('API response status:', response.status);
          console.log('API response headers:', Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API error response:', errorData);
            throw new Error(`API request failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
          }

          const data = await response.json();
          console.log('API response data:', data);
          const aiMessageId = `ai-${Date.now()}`;
          console.log('Setting initial message to state (production):', { id: aiMessageId, sender: MessageSender.AI, text: data.response });
          setMessages([{ id: aiMessageId, sender: MessageSender.AI, text: data.response }]);
          // 着信後のみ自動再生
          try {
            const enabled = window.localStorage.getItem('autoPlayAfterReply') === 'true';
            if (enabled) {
              setVideoError(null);
              setIsVideoOpen(true);
            }
          } catch {}
          setIsLoading(false);
        }

      } catch (error) {
        console.error("Chat initialization failed:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace',
          name: error instanceof Error ? error.name : 'Unknown error type'
        });
        setMessages([{ 
          id: 'error-1', 
          sender: MessageSender.AI, 
          text: `おっと！今うまく接続できないみたい。タイムマシンが壊れちゃったのかな？\n\nエラー詳細: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }]);
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, []);

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
      if (detectPositiveKeywords(userMessage.text)) {
        const recommendedCourse = getUdemyCourseWithThumbnail(userMessage.text);
        if (recommendedCourse) {
          const suggestion = generateUdemySuggestion(userMessage.text, [recommendedCourse]);
          if (suggestion) {
            responseText += `\n\n${suggestion}`;
            udemyCourseData = {
              id: recommendedCourse.id,
              title: recommendedCourse.title,
              url: recommendedCourse.url,
              thumbnail: recommendedCourse.thumbnail
            };
          }
        }
      }
      
      const aiMessageId = `ai-${Date.now()}`;
      const messageData: ChatMessage = {
        id: aiMessageId,
        sender: MessageSender.AI,
        text: responseText,
        ...(udemyCourseData && { udemyCourse: udemyCourseData })
      };
      
      setMessages(prev => [...prev, messageData]);
      // 着信後のみ自動再生（ただし、最初にカメラ押下で再生されるまで無効）
      try {
        const enabled = window.localStorage.getItem('autoPlayAfterReply') === 'true';
        if (enabled) {
          setVideoError(null);
          setIsVideoOpen(true);
        }
      } catch {}

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
  
  return (
    <div className="absolute inset-0 flex flex-col bg-black bg-opacity-80 rounded-[2rem] overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-700 bg-gray-900">
        <img src={photo} alt="幼い頃の自分" className="w-10 h-10 rounded-full object-cover" />
        <div className="ml-3 flex-1">
          <p className="font-bold text-white">幼い頃のあなた</p>
          <p className="text-xs text-green-400">オンライン</p>
        </div>
        {/* 再生ボタン削除 */}
      </div>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 初期化中のローディング表示 */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-end gap-2 justify-start">
            <img src={photo} alt="AI" className="w-6 h-6 rounded-full object-cover self-start" />
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
              <img src={photo} alt="AI" className="w-6 h-6 rounded-full object-cover self-start" />
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
            placeholder="メッセージを入力..."
            className="flex-1 bg-gray-700 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-blue-600 rounded-full p-3 text-white disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
            <SendIcon />
          </button>
        </form>
         <button onClick={onEndCall} className="w-full text-center text-red-500 text-sm mt-3 hover:text-red-400">通話を終了</button>
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

export default ChatScreen;