import React, { useRef, useState, useCallback } from 'react';
import { CameraIcon } from './icons';

interface UploadScreenProps {
  onPhotoUpload: (photoDataUrl: string) => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onPhotoUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoSrc = `${import.meta.env.BASE_URL}child_result.mp4`;

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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center rounded-[2rem] overflow-hidden">
      <h1 className="text-3xl font-bold mb-2">過去の自分と話そう</h1>
      <p className="text-gray-400 mb-8">幼い頃の写真をアップロードして、過去の自分との対話を始めましょう。</p>

      {/* 再生ボタン削除 */}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      
      <button
        onClick={handleClick}
        className="group relative w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-2xl hover:bg-gray-800 hover:border-gray-500 transition-colors duration-300"
      >
        <div className="mb-4 text-gray-500 group-hover:text-gray-300 transition-colors">
          <CameraIcon />
        </div>
        <span className="text-lg font-medium text-gray-400 group-hover:text-white">写真をアップロード</span>
        <span className="text-sm text-gray-500">クリックして画像を選択</span>
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-auto text-xs text-gray-600">
        <p>あなたの写真はローカルで処理され、サーバーには保存されません。</p>
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

export default UploadScreen;