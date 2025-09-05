import React, { useEffect } from 'react';

interface ConnectingScreenProps {
  onConnected: () => void;
  photo: string | null;
}

const ConnectingScreen: React.FC<ConnectingScreenProps> = ({ onConnected, photo }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onConnected();
    }, 3500); // Simulate connection time

    return () => clearTimeout(timer);
  }, [onConnected]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black text-white p-8">
      {photo && (
        <div className="relative mb-8">
          <img src={photo} alt="幼い頃のあなた" className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 shadow-lg"/>
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-60 flex items-center justify-center">
             <div className="animate-ping h-4 w-4 rounded-full bg-green-400 opacity-75"></div>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-2 animate-pulse">過去に接続中...</h2>
      <p className="text-gray-400">時間リンクを確立しています。しばらくお待ちください。</p>
    </div>
  );
};

export default ConnectingScreen;