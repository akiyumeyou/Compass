import React, { useRef, useState, useCallback } from 'react';
import { CameraIcon } from './icons';

interface UploadScreenProps {
  onPhotoUpload: (photoDataUrl: string) => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onPhotoUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルを選択してください。');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onPhotoUpload(e.target.result as string);
        }
      };
      reader.onerror = () => {
        setError('ファイルの読み込みに失敗しました。');
      };
      reader.readAsDataURL(file);
    }
  }, [onPhotoUpload]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between bg-gray-900 text-white p-8 text-center rounded-[2rem] overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)'
          }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 flex flex-col items-center mt-12">
        {/* アプリアイコン */}
        <div className="w-32 h-32 mb-6 bg-white rounded-3xl flex items-center justify-center shadow-lg overflow-hidden">
          <img 
            src="/favicon.ico" 
            alt="Little My" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* アプリ名 */}
        <h1 
          className="text-5xl font-bold mb-8"
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Little My
        </h1>

        {/* キャッチコピー */}
        <h2 className="text-2xl font-semibold mb-3">過去の自分と話そう</h2>
        <p className="text-gray-400 text-sm px-4">
          今の自分の写真をアップロードして、<br/>
          過去の自分との対話を始めましょう。
        </p>
      </div>
      
      {/* アップロードボタン */}
      <div className="relative z-10 w-full mb-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        
        <button
          onClick={handleClick}
          className="group relative w-full flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))',
            border: '2px solid transparent',
            backgroundImage: `
              linear-gradient(rgba(17, 24, 39, 1), rgba(17, 24, 39, 1)),
              linear-gradient(135deg, #ec4899, #3b82f6)
            `,
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box'
          }}
        >
          <div className="mb-3 text-gray-400 group-hover:text-gray-300 transition-colors">
            <CameraIcon />
          </div>
          <span className="text-lg font-medium text-gray-300 group-hover:text-white">写真をアップロード</span>
          <span className="text-sm text-gray-500 mt-1">クリックして画像を選択</span>
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default UploadScreen;