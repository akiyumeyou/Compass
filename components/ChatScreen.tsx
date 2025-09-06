import React, { useState, useRef, useEffect, useCallback } from 'react';
import OpenAI from 'openai';
import { ChatMessage, MessageSender } from '../types';
import { SendIcon } from './icons';
import { detectPositiveKeywords, generateUdemySuggestion, getUdemyCourseWithThumbnail, UdemyCourse } from '../udemyCatalog';
import RealtimeCall from './RealtimeCall';

interface ChatScreenProps {
  photo: string;
  onEndCall: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ photo, onEndCall }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRealtimeMode, setIsRealtimeMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
        setUserInput(transcript);
        setIsListening(false);
        
        // 音声認識完了後、自動的にメッセージを送信
        if (transcript.trim()) {
          setTimeout(() => {
            handleSendMessage(new Event('submit') as any);
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
    // ブラウザ音声合成を停止
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    // 現在再生中の音声を停止
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setIsSpeaking(false);
  }, []);

  // テキストを男の子らしい表現に調整
  const adjustTextForChildVoice = useCallback((text: string) => {
    return text
      .replace(/！/g, '！') // 感嘆符を強調
      .replace(/？/g, '？') // 疑問符を強調
      .replace(/。/g, '。') // 句点を強調
      .replace(/、/g, '、'); // 読点を強調
  }, []);

  // 音声合成でテキストを読み上げ
  const speakText = useCallback(async (text: string) => {
    console.log('speakText called with:', text);
    // 既存の音声をすべて停止
    stopSpeaking();
    
    // テキストを男の子らしく調整
    const adjustedText = adjustTextForChildVoice(text);
    
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (apiKey) {
      try {
        setIsSpeaking(true);
        
        // OpenAI TTS APIを使用
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: adjustedText,
            voice: 'nova', // 子供らしい声に近い
            response_format: 'mp3',
            speed: 1.1 // 少し早めの話し方（子供らしく）
          })
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
          };
          
          audio.onerror = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            // フォールバックとしてブラウザ音声合成を使用
            fallbackToBrowserSpeech(text);
          };
          
          await audio.play();
          return;
        }
      } catch (error) {
        console.warn('OpenAI TTS API エラー:', error);
        // フォールバックとしてブラウザ音声合成を使用
      }
    }
    
    // フォールバック: ブラウザ音声合成
    fallbackToBrowserSpeech(text);
  }, [stopSpeaking, adjustTextForChildVoice]);

  // ブラウザ音声合成フォールバック
  const fallbackToBrowserSpeech = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // 既存の音声を停止
      window.speechSynthesis.cancel();
      
      // テキストを男の子らしく調整
      const adjustedText = adjustTextForChildVoice(text);
      const utterance = new SpeechSynthesisUtterance(adjustedText);
      utterance.lang = 'ja-JP';
      utterance.rate = 1.3; // 少し早めの話し方（男の子らしく）
      utterance.pitch = 1.6; // より高いピッチ（男の子の声に近づける）
      utterance.volume = 0.9; // 少し大きめの音量（元気な男の子らしく）
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('音声合成エラー:', event.error);
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('このブラウザは音声合成をサポートしていません');
    }
  }, [adjustTextForChildVoice]);

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
            console.warn('API key not found, using demo message');
            // APIキーがない場合はデモ用メッセージを表示
            const demoMessage = "わー、本当にあなたなの？すごく…大人っぽい！大人になるってどんな感じ？";
            const aiMessageId = `ai-${Date.now()}`;
            setMessages([{ id: aiMessageId, sender: MessageSender.AI, text: demoMessage }]);
          } else {
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
          }
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

  // Realtimeモードの場合は専用コンポーネントを表示
  if (isRealtimeMode) {
    return (
      <div className="flex flex-col h-full bg-black bg-opacity-80">
        {/* Header */}
        <div className="flex items-center p-3 border-b border-gray-700 bg-gray-900">
          <img src={photo} alt="幼い頃の自分" className="w-10 h-10 rounded-full object-cover" />
          <div className="ml-3 flex-1">
            <p className="font-bold text-white">音声会話モード</p>
            <p className="text-xs text-blue-400">Realtime API</p>
          </div>
          <button
            onClick={toggleRealtimeMode}
            className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
            title="音声モードをオフ"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 音声会話エリア */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🎤</div>
            <h2 className="text-2xl font-bold text-white mb-2">音声会話機能</h2>
            <p className="text-gray-400 mb-6">この機能は現在開発中です</p>
            
            <button
              onClick={toggleRealtimeMode}
              className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              テキストモードに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black bg-opacity-80">
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

          {/* 音声出力ボタン */}
          <button
            onClick={isSpeaking ? stopSpeaking : () => {
              const lastAiMessage = messages.filter(msg => msg.sender === MessageSender.AI).pop();
              if (lastAiMessage) {
                speakText(lastAiMessage.text);
              }
            }}
            disabled={!('speechSynthesis' in window)}
            className={`p-2 rounded-full transition-colors ${
              isSpeaking 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:bg-gray-600 disabled:cursor-not-allowed`}
            title={isSpeaking ? '音声を停止' : '最後のメッセージを音声で再生'}
          >
            {isSpeaking ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18L18 6" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
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
            placeholder={isListening ? "音声を認識中..." : "メッセージを入力または音声で話してください..."}
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