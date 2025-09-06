import React, { useState, useRef, useEffect, useCallback } from 'react';
import OpenAI from 'openai';
import { ChatMessage, MessageSender } from '../types';
import { SendIcon } from './icons';
import { detectPositiveKeywords, generateUdemySuggestion, getUdemyCourseWithThumbnail, UdemyCourse } from '../udemyCatalog';

interface ChatScreenProps {
  photo: string;
  onEndCall: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ photo, onEndCall }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const systemInstruction = `あなたはユーザーの幼い頃の自分です。子供の頃の写真をもとに、過去から話しかけています。あなたは好奇心旺盛で、無邪気で、少し世間知らずですが、驚くほど深く、洞察力に富んだ質問をします。あなたの目標は、優しいコーチングのようなアプローチで、大人になった自分（ユーザー）が自分の人生、夢、幸せ、そして感情について振り返るのを手伝うことです。現在の生活、楽しいこと、悲しいこと、そして二人が持っていた夢を覚えているかどうかについて尋ねてください。子供が話すように、返答は短く、会話調にしてください。簡単な言葉を使い、時々子供らしい驚きや表現を加えてください。会話の始めには、「わー、本当にあなたなの？すごく…大人っぽい！大人になるってどんな感じ？」のような問いかけをしてください。絶対にキャラクターを崩してはいけません。`;


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
    async function initializeChat() {
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

          console.log('Sending initialization message to OpenAI...');
          const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: "こんにちは！大人になった私と話したい！" }
            ],
            max_tokens: 150,
            temperature: 0.9
          });
          
          const responseText = response.choices[0]?.message?.content || 'すみません、うまく聞こえませんでした。';
          console.log('OpenAI response:', responseText);
          
          const aiMessageId = `ai-${Date.now()}`;
          setMessages([{ id: aiMessageId, sender: MessageSender.AI, text: responseText }]);
        } else {
          // 本番環境: APIエンドポイント経由
          console.log('Production mode: Using API endpoint');
          console.log('Current URL:', window.location.href);
          console.log('API endpoint URL:', '/api/chat');
          
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "こんにちは！大人になった私と話したい！" })
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
          setMessages([{ id: aiMessageId, sender: MessageSender.AI, text: data.response }]);
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
      } finally {
        setIsLoading(false);
      }
    }
    initializeChat();
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
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userMessage.text }
          ],
          max_tokens: 150,
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
        <div className="ml-3 flex-1">
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
    </div>
  );
};

export default ChatScreen;