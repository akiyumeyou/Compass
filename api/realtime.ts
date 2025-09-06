// OpenAI Realtime API を使用した音声会話機能
// このファイルは将来の実装用のテンプレートです

interface RealtimeMessage {
  type: 'conversation.item.input_audio_buffer.committed' | 'conversation.item.output_audio_buffer.committed' | 'conversation.item.transcript.committed';
  conversation_item_id: string;
  item: {
    type: 'message';
    role: 'user' | 'assistant';
    content: string;
    input_audio_buffer?: {
      format: 'pcm16';
      data: string; // base64 encoded audio data
    };
    output_audio_buffer?: {
      format: 'pcm16';
      data: string; // base64 encoded audio data
    };
  };
}

export class OpenAIRealtimeClient {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private onAudioReceived?: (audioData: ArrayBuffer) => void;
  private onTranscriptReceived?: (transcript: string) => void;

  constructor(
    private apiKey: string,
    private onAudioReceived?: (audioData: ArrayBuffer) => void,
    private onTranscriptReceived?: (transcript: string) => void
  ) {
    this.onAudioReceived = onAudioReceived;
    this.onTranscriptReceived = onTranscriptReceived;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01');
      
      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('Realtime API connected');
        resolve();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        console.log('Realtime API disconnected');
      };
    });
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'conversation.item.output_audio_buffer.committed':
        if (message.item.output_audio_buffer?.data) {
          // Base64デコードして音声データを取得
          const audioData = this.base64ToArrayBuffer(message.item.output_audio_buffer.data);
          this.onAudioReceived?.(audioData);
        }
        break;
      
      case 'conversation.item.transcript.committed':
        if (message.item.content) {
          this.onTranscriptReceived?.(message.item.content);
        }
        break;
    }
  }

  sendAudio(audioData: ArrayBuffer): void {
    if (!this.isConnected || !this.ws) {
      console.error('WebSocket not connected');
      return;
    }

    const base64Audio = this.arrayBufferToBase64(audioData);
    
    const message = {
      type: 'conversation.item.input_audio_buffer.append',
      item: {
        type: 'input_audio_buffer',
        input_audio_buffer: {
          format: 'pcm16',
          data: base64Audio
        }
      }
    };

    this.ws.send(JSON.stringify(message));
  }

  sendText(text: string): void {
    if (!this.isConnected || !this.ws) {
      console.error('WebSocket not connected');
      return;
    }

    const message = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(message));
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

// 使用例
export const createRealtimeClient = (apiKey: string) => {
  return new OpenAIRealtimeClient(
    apiKey,
    (audioData) => {
      // 音声データを受信した時の処理
      const audioBlob = new Blob([audioData], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    },
    (transcript) => {
      // テキストを受信した時の処理
      console.log('Transcript:', transcript);
    }
  );
};
