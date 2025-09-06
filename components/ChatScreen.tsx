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

interface ChatScreenProps {
  photo: string;
  onEndCall: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ photo, onEndCall }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

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
- 会話の始めには「わぁ！大きくなった僕だ！」のような驚きから始める`;

  useEffect(() => {
    // 既に初期化済みの場合はスキップ（React StrictMode対策）
    if (initRef.current) return;
    initRef.current = true;
    
    let cancelled = false;
    
    async function initializeChat() {
      if (cancelled) return;
      
      try {
        setIsLoading(true);
        
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
            max_tokens: 150,
            temperature: 0.7  // 少し低めの温度で一貫性を保つ
          });
          
          const responseText = response.choices[0]?.message?.content || randomInitialMessage;
          console.log('Initial greeting from childhood self:', responseText);
          
          const aiMessageId = `ai-${Date.now()}`;
          if (!cancelled) {
            setMessages([{ id: aiMessageId, sender: MessageSender.AI, text: responseText }]);
          }
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
          if (!cancelled) {
            setMessages([{ id: aiMessageId, sender: MessageSender.AI, text: data.response }]);
          }
        }

      } catch (error) {
        console.error("Chat initialization failed:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace',
          name: error instanceof Error ? error.name : 'Unknown error type'
        });
        if (!cancelled) {
          setMessages([{ 
            id: 'error-1', 
            sender: MessageSender.AI, 
            text: `おっと！今うまく接続できないみたい。タイムマシンが壊れちゃったのかな？\n\nエラー詳細: ${error instanceof Error ? error.message : 'Unknown error'}` 
          }]);
        }
      } finally {
        setIsLoading(false);
      }
    }
    initializeChat();
    
    // クリーンアップ関数
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
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
          max_tokens: 150,
          temperature: 0.9
        });
        
        const responseText = response.choices[0]?.message?.content || 'すみません、うまく聞こえませんでした。';
        console.log('OpenAI response to user message:', responseText);
        
        const aiMessageId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, { id: aiMessageId, sender: MessageSender.AI, text: responseText }]);
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
        const aiMessageId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, { id: aiMessageId, sender: MessageSender.AI, text: data.response }]);
      }

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
  }, [userInput, isLoading]);

  return (
    <div className="flex flex-col h-full bg-black bg-opacity-80">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-700 bg-gray-900">
        <img src={photo} alt="幼い頃の自分" className="w-10 h-10 rounded-full object-cover" />
        <div className="ml-3">
          <p className="font-bold text-white">幼い頃のあなた</p>
          <p className="text-xs text-green-400">オンライン</p>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === MessageSender.AI && <img src={photo} alt="AI" className="w-6 h-6 rounded-full object-cover self-start" />}
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-white ${msg.sender === MessageSender.USER ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
              <p className="text-sm break-words">{msg.text}</p>
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
    </div>
  );
};

export default ChatScreen;