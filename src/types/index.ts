
export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  bio: string;
  images: string[];
  interests: string[];
  location: string;
  preferredLanguage: string;
  matches?: string[];
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  originalText: string;
  translatedText?: string;
  originalLanguage: string;
  timestamp: Date;
  read: boolean;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  timestamp: Date;
  lastMessageAt?: Date;
}

export interface Chat {
  matchId: string;
  userId: string;
  userName: string;
  userImage: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

export type Language = {
  code: string;
  name: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' }
];
