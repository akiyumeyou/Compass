
export enum Screen {
  UPLOAD,
  CONNECTING,
  CHAT,           // 初回1ターンのみ
  INCOMING_CALL,  // 新規：着信画面
  VIDEO_CHAT      // 新規：ビデオ通話画面
}

export interface AppState {
  screen: Screen;
  chatHistory?: ChatMessage[];  // 新規：初回チャット履歴
}

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
}
