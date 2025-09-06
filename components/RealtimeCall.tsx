import React, { useRef, useState, useCallback, useEffect } from 'react';
import { MessageSender } from '../types';

interface RealtimeCallProps {
  onMessage: (message: { id: string; sender: MessageSender; text: string }) => void;
  onEndCall: () => void;
}

interface RealtimeSession {
  id: string;
  client_secret: {
    value: string;
  };
}

const RealtimeCall: React.FC<RealtimeCallProps> = ({ onMessage, onEndCall }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');

  // 接続開始
  const startCall = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // 1. マイク権限を取得
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      const localTrack = stream.getAudioTracks()[0];
      console.log('Microphone access granted');

      // 2. RTCPeerConnectionを作成
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      setPc(peer);

      // 3. 相手の音声を再生
      peer.ontrack = (event) => {
        console.log('Received remote audio track');
        if (audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
          audioRef.current.play().catch(console.error);
        }
      };

      // 4. DataChannelでイベントを送受信
      const dataChannel = peer.createDataChannel('oai-events');
      
      dataChannel.onopen = () => {
        console.log('DataChannel opened');
        // 最初の応答リクエスト
        dataChannel.send(JSON.stringify({
          type: 'response.create',
          response: { 
            modalities: ['audio', 'text'],
            instructions: '子供らしく、短く、会話調で話してください。'
          }
        }));
      };

      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received event:', data);
          
          if (data.type === 'conversation.item.transcript.committed') {
            const text = data.item?.content || '';
            if (text) {
              setTranscript(text);
              onMessage({
                id: `ai-${Date.now()}`,
                sender: MessageSender.AI,
                text: text
              });
            }
          }
        } catch (error) {
          console.error('Error parsing DataChannel message:', error);
        }
      };

      // 5. ローカルの音声トラックを追加
      peer.addTrack(localTrack, stream);

      // 6. セッショントークンを取得
      const sessionResponse = await fetch('/api/realtime-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to create Realtime session');
      }

      const session: RealtimeSession = await sessionResponse.json();
      console.log('Realtime session created:', session.id);

      // 7. SDP Offerを作成
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      // 8. OpenAIのRealtimeエンドポイントに接続
      const webrtcResponse = await fetch('https://api.openai.com/v1/realtime?protocol=webrtc', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.client_secret.value}`,
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp
      });

      if (!webrtcResponse.ok) {
        throw new Error('Failed to connect to OpenAI Realtime');
      }

      // 9. SDP Answerを設定
      const answerSDP = await webrtcResponse.text();
      await peer.setRemoteDescription({ type: 'answer', sdp: answerSDP });

      setIsConnected(true);
      console.log('Realtime call connected successfully');

    } catch (error) {
      console.error('Failed to start call:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsConnecting(false);
    }
  }, [onMessage]);

  // 接続終了
  const endCall = useCallback(() => {
    if (pc) {
      pc.getSenders().forEach(sender => {
        sender.track?.stop();
      });
      pc.close();
      setPc(null);
    }
    setIsConnected(false);
    setTranscript('');
    onEndCall();
  }, [pc, onEndCall]);

  // 音声送信の開始/停止
  const toggleMute = useCallback(() => {
    if (pc) {
      const senders = pc.getSenders();
      senders.forEach(sender => {
        if (sender.track) {
          sender.track.enabled = !sender.track.enabled;
        }
      });
    }
  }, [pc]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (pc) {
        pc.close();
      }
    };
  }, [pc]);

  return (
    <div className="flex flex-col h-full bg-black bg-opacity-80">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-900">
        <div>
          <p className="font-bold text-white">音声通話中</p>
          <p className="text-xs text-green-400">
            {isConnecting ? '接続中...' : isConnected ? '接続済み' : '未接続'}
          </p>
        </div>
        <button
          onClick={endCall}
          className="px-3 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700"
        >
          終了
        </button>
      </div>

      {/* Status Area */}
      <div className="flex-1 p-4 space-y-4">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
            <p className="font-bold">エラー</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {transcript && (
          <div className="bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded">
            <p className="text-sm font-bold mb-2">AIの応答:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {!isConnected && !isConnecting && (
          <div className="text-center">
            <button
              onClick={startCall}
              className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              音声通話を開始
            </button>
          </div>
        )}

        {isConnecting && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-white">接続中...</span>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="text-center space-y-4">
            <div className="text-green-400">
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">音声通話中</p>
            </div>
            
            <button
              onClick={toggleMute}
              className="px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
            >
              ミュート切り替え
            </button>
          </div>
        )}
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} autoPlay />
    </div>
  );
};

export default RealtimeCall;
