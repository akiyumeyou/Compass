import React, { useEffect, useState } from 'react';
import { PhoneOff, Mic, Video } from 'lucide-react';

interface IncomingCallScreenProps {
  photo: string;
  onAnswer: () => void;
  onReject: () => void;
}

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({ photo, onAnswer, onReject }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // 着信音やバイブレーションの代わりにアニメーションを開始
    const timer = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      {/* 背景: ぼかした子供の写真 */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${photo})`,
          filter: 'blur(20px)',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8">
        {/* 上部: PiP風の小さな写真 */}
        <div className="flex justify-start">
          <div 
            className={`w-24 h-32 rounded-lg overflow-hidden shadow-2xl transform transition-transform ${
              isAnimating ? 'scale-105' : 'scale-100'
            }`}
          >
            <img 
              src={photo} 
              alt="幼い頃のあなた" 
              className="w-full h-full object-cover"
            />
          </div>
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
        <div className="flex justify-around items-center pb-8">
          {/* マイクボタン（応答） */}
          <button
            onClick={onAnswer}
            className="w-16 h-16 rounded-full bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center hover:bg-opacity-30 transition-all transform hover:scale-110"
          >
            <Mic className="text-white" size={24} />
          </button>

          {/* 終了ボタン（拒否） */}
          <button
            onClick={onReject}
            className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-all transform hover:scale-110 shadow-lg"
          >
            <PhoneOff className="text-white" size={28} />
          </button>

          {/* ビデオボタン（応答） */}
          <button
            onClick={onAnswer}
            className="w-16 h-16 rounded-full bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center hover:bg-opacity-30 transition-all transform hover:scale-110"
          >
            <Video className="text-white" size={24} />
          </button>
        </div>
      </div>

      {/* カスタムアニメーション用のスタイル */}
      <style jsx>{`
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