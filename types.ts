
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
  // === TEAM MODIFICATION START ===
  udemyCourse?: {
    id: string;
    title: string;
    url: string;
    thumbnail?: string;
  };
  // === TEAM MODIFICATION END ===
}
