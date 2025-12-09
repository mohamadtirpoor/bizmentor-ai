export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  isThinking?: boolean;
  groundingMetadata?: any; // For search results
}

export enum ChatMode {
  CONSULTANT = 'consultant', // Gemini 3 Pro (Thinking)
  RESEARCH = 'research'      // Gemini 2.5 Flash (Search)
}

export interface LiveConnectionState {
  isConnected: boolean;
  isSpeaking: boolean;
  volume: number;
}