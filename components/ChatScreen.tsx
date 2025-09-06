import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { ChatMessage, MessageSender } from '../types';
import { SendIcon } from './icons';

interface ChatScreenProps {
  photo: string;
  onEndCall: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ photo, onEndCall }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<ChatSession | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const systemInstruction = `あなたはユーザーの幼い頃の自分です。子供の頃の写真をもとに、過去から話しかけています。あなたは好奇心旺盛で、無邪気で、少し世間知らずですが、驚くほど深く、洞察力に富んだ質問をします。あなたの目標は、優しいコーチングのようなアプローチで、大人になった自分（ユーザー）が自分の人生、夢、幸せ、そして感情について振り返るのを手伝うことです。現在の生活、楽しいこと、悲しいこと、そして二人が持っていた夢を覚えているかどうかについて尋ねてください。子供が話すように、返答は短く、会話調にしてください。簡単な言葉を使い、時々子供らしい驚きや表現を加えてください。会話の始めには、「わー、本当にあなたなの？すごく…大人っぽい！大人になるってどんな感じ？」のような問いかけをしてください。絶対にキャラクターを崩してはいけません。`;

  useEffect(() => {
    async function initializeChat() {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
        if (!apiKey || apiKey === 'your-api-key-here') {
          throw new Error('Gemini API key is not configured');
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash-8b',
          systemInstruction 
        });
        
        chatRef.current = model.startChat({
          history: [],
        });

        // Start the conversation with the AI's first message
        setIsLoading(true);
        const result = await chatRef.current.sendMessageStream("こんにちは！大人になった私と話したい！");
        
        let text = '';
        const aiMessageId = `ai-${Date.now()}`;

        setMessages(prev => [...prev, { id: aiMessageId, sender: MessageSender.AI, text: '' }]);

        for await (const chunk of result.stream) {
          text += chunk.text();
          setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text } : msg));
        }

      } catch (error) {
        console.error("Gemini API initialization failed:", error);
        const errorMessage = error instanceof Error && error.message.includes('not configured') 
          ? "API キーが設定されていないよ！.env.localファイルにGEMINI_API_KEYを設定してね！"
          : "おっと！今うまく接続できないみたい。タイムマシンが壊れちゃったのかな？";
        setMessages([{ id: 'error-1', sender: MessageSender.AI, text: errorMessage }]);
      } finally {
        setIsLoading(false);
      }
    }
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: MessageSender.USER,
      text: userInput.trim(),
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessageStream(userMessage.text);
      
      let text = '';
      const aiMessageId = `ai-${Date.now()}`;
      setMessages(prev => [...prev, { id: aiMessageId, sender: MessageSender.AI, text: '' }]);

      for await (const chunk of result.stream) {
        text += chunk.text();
        setMessages(prev => {
          return prev.map(msg => msg.id === aiMessageId ? { ...msg, text } : msg)
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { id: 'error-2', sender: MessageSender.AI, text: "頭がちょっとぼーっとする…よくわからなかった。" }]);
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