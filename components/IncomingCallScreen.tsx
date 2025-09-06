import React, { useEffect, useState } from 'react';
import { PhoneOff, Mic, Video, Phone } from 'lucide-react';
import { ringtone } from '../utils/ringtone';

interface IncomingCallScreenProps {
  photo: string;
  onAnswer: () => void;
  onReject: () => void;
}

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({ photo, onAnswer, onReject }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // 着信音を開始
    ringtone.start();
    
    // 着信アニメーションを開始
    const timer = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 1000);

    return () => {
      clearInterval(timer);
      // 着信音を停止
      ringtone.stop();
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-black">
      {/* 背景: 子供の写真を全画面表示 */}
      <div 
        className="absolute inset-0 bg-cover bg-center rounded-[2rem] overflow-hidden"
        style={{
          backgroundImage: `url(${photo})`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8">
        {/* 上部: 空白エリア */}
        <div className="flex justify-start">
          {/* 空白 */}
        </div>

        {/* 中央: 着信情報 */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-white text-opacity-80 text-sm mb-2">着信中...</div>
          <div className="text-white text-3xl font-light mb-2">幼い頃のあなた</div>
          <div className="text-white text-opacity-60 text-sm flex items-center gap-2">
            <Video size={16} />
            ビデオ通話
          </div>

          {/* 波紋アニメーション */}
          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-32 h-32 rounded-full border-2 border-white border-opacity-30 ${
                isAnimating ? 'animate-ping' : ''
              }`} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-24 h-24 rounded-full border-2 border-white border-opacity-40 ${
                isAnimating ? 'animate-ping animation-delay-200' : ''
              }`} />
            </div>
            <div className="w-20 h-20" /> {/* スペーサー */}
          </div>
        </div>

        {/* 下部: コントロールボタン */}
        <div className="flex justify-center items-center gap-16 pb-8">
          {/* 緑の応答ボタン（メイン） */}
          <button
            onClick={() => {
              ringtone.stop();
              onAnswer();
            }}
            className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-all transform hover:scale-110 shadow-lg animate-pulse"
          >
            <Phone className="text-white" size={32} />
          </button>

          {/* 赤い終了ボタン（拒否） */}
          <button
            onClick={() => {
              ringtone.stop();
              onReject();
            }}
            className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-all transform hover:scale-110 shadow-lg"
          >
            <PhoneOff className="text-white" size={32} />
          </button>
        </div>
      </div>

      {/* カスタムアニメーション用のスタイル */}
      <style>{`
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};