
import React, { useState, useCallback } from 'react';
import { AppState, Screen } from './types';
import PhoneFrame from './components/PhoneFrame';
import UploadScreen from './components/UploadScreen';
import ConnectingScreen from './components/ConnectingScreen';
import ChatScreen from './components/ChatScreen';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({ screen: Screen.UPLOAD });
  const [childhoodPhoto, setChildhoodPhoto] = useState<string | null>(null);

  const handlePhotoUpload = useCallback((photoDataUrl: string) => {
    setChildhoodPhoto(photoDataUrl);
    setAppState({ screen: Screen.CONNECTING });
  }, []);

  const handleConnected = useCallback(() => {
    setAppState({ screen: Screen.CHAT });
  }, []);

  const handleEndCall = useCallback(() => {
    setChildhoodPhoto(null);
    setAppState({ screen: Screen.UPLOAD });
  }, []);

  const renderScreen = () => {
    switch (appState.screen) {
      case Screen.UPLOAD:
        return <UploadScreen onPhotoUpload={handlePhotoUpload} />;
      case Screen.CONNECTING:
        return <ConnectingScreen onConnected={handleConnected} photo={childhoodPhoto} />;
      case Screen.CHAT:
        if (!childhoodPhoto) {
            // Should not happen, but as a fallback
            setAppState({ screen: Screen.UPLOAD });
            return <UploadScreen onPhotoUpload={handlePhotoUpload} />;
        }
        return <ChatScreen photo={childhoodPhoto} onEndCall={handleEndCall} />;
      default:
        return <UploadScreen onPhotoUpload={handlePhotoUpload} />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 font-sans">
      <PhoneFrame>
        {renderScreen()}
      </PhoneFrame>
    </div>
  );
};

export default App;
