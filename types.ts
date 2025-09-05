
export enum Screen {
  UPLOAD,
  CONNECTING,
  CHAT,
}

export interface AppState {
  screen: Screen;
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
