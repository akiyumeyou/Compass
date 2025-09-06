
import React, { useState, useCallback } from 'react';
import { AppState, Screen, ChatMessage } from './types';
import PhoneFrame from './components/PhoneFrame';
import UploadScreen from './components/UploadScreen';
import ConnectingScreen from './components/ConnectingScreen';
import ChatScreen from './components/ChatScreen';
import { IncomingCallScreen } from './components/IncomingCallScreen';
import { VideoChatScreen } from './components/VideoChatScreen';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({ screen: Screen.UPLOAD });
  const [childhoodPhoto, setChildhoodPhoto] = useState<string | null>(null);
  const [convertedPhoto, setConvertedPhoto] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handlePhotoUpload = useCallback((photoDataUrl: string) => {
    setChildhoodPhoto(photoDataUrl);
    setConvertedPhoto(null);
    setAppState({ screen: Screen.CONNECTING });
  }, []);

  const handleConnected = useCallback(() => {
    setAppState({ screen: Screen.CHAT });
  }, []);

  const handleConverted = useCallback((transformed: string) => {
    setConvertedPhoto(transformed);
  }, []);

  const handleEndCall = useCallback(() => {
    setChildhoodPhoto(null);
    setConvertedPhoto(null);
    setChatHistory([]);
    setAppState({ screen: Screen.UPLOAD });
  }, []);

  const handleFirstChatComplete = useCallback((history: ChatMessage[]) => {
    setChatHistory(history);
    setAppState({ screen: Screen.INCOMING_CALL });
  }, []);

  const handleAnswerCall = useCallback(() => {
    setAppState({ screen: Screen.VIDEO_CHAT });
  }, []);

  const handleRejectCall = useCallback(() => {
    setChildhoodPhoto(null);
    setConvertedPhoto(null);
    setChatHistory([]);
    setAppState({ screen: Screen.UPLOAD });
  }, []);

  const renderScreen = () => {
    switch (appState.screen) {
      case Screen.UPLOAD:
        return <UploadScreen onPhotoUpload={handlePhotoUpload} />;
      case Screen.CONNECTING:
        return <ConnectingScreen onConnected={handleConnected} onConverted={handleConverted} photo={childhoodPhoto} />;
      case Screen.CHAT:
        if (!childhoodPhoto) {
            // Should not happen, but as a fallback
            setAppState({ screen: Screen.UPLOAD });
            return <UploadScreen onPhotoUpload={handlePhotoUpload} />;
        }
        return <ChatScreen 
          photo={convertedPhoto || childhoodPhoto} 
          onEndCall={handleEndCall}
          onFirstChatComplete={handleFirstChatComplete}
        />;
      case Screen.INCOMING_CALL:
        if (!childhoodPhoto) {
          setAppState({ screen: Screen.UPLOAD });
          return <UploadScreen onPhotoUpload={handlePhotoUpload} />;
        }
        return <IncomingCallScreen 
          photo={convertedPhoto || childhoodPhoto}
          onAnswer={handleAnswerCall}
          onReject={handleRejectCall}
        />;
      case Screen.VIDEO_CHAT:
        if (!childhoodPhoto) {
          setAppState({ screen: Screen.UPLOAD });
          return <UploadScreen onPhotoUpload={handlePhotoUpload} />;
        }
        return <VideoChatScreen
          photo={convertedPhoto || childhoodPhoto}
          onEndCall={handleEndCall}
          initialHistory={chatHistory}
        />;
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
