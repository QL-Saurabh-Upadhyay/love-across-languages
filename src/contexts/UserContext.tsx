
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Match, Chat, Message } from "@/types";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UserContextType {
  users: User[];
  matches: Match[];
  chats: Chat[];
  messages: Record<string, Message[]>;
  discoverUsers: () => Promise<User[]>;
  getUser: (userId: string) => User | undefined;
  matchUsers: (userId1: string, userId2: string) => Promise<Match>;
  getChatMessages: (matchId: string) => Promise<Message[]>;
  sendMessage: (matchId: string, text: string) => Promise<Message>;
  getUserChats: (userId: string) => Promise<Chat[]>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Example users data for demonstration
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Emma Wilson",
    email: "emma@example.com",
    age: 28,
    gender: "female",
    bio: "Travel enthusiast, coffee lover, and bookworm. Looking for someone to share adventures with.",
    images: ["/placeholder.svg"],
    interests: ["Traveling", "Reading", "Hiking", "Photography"],
    location: "New York",
    preferredLanguage: "en",
    createdAt: new Date()
  },
  {
    id: "2",
    name: "Miguel Rodriguez",
    email: "miguel@example.com",
    age: 30,
    gender: "male",
    bio: "Soy un amante de la música y la buena comida. Busco a alguien que comparta mis pasiones.",
    images: ["/placeholder.svg"],
    interests: ["Music", "Cooking", "Dancing", "Movies"],
    location: "Madrid",
    preferredLanguage: "es",
    createdAt: new Date()
  },
  {
    id: "3",
    name: "Sophie Laurent",
    email: "sophie@example.com",
    age: 26,
    gender: "female",
    bio: "Artiste et voyageuse, toujours à la recherche de nouvelles expériences et rencontres.",
    images: ["/placeholder.svg"],
    interests: ["Art", "Travel", "Wine", "Culture"],
    location: "Paris",
    preferredLanguage: "fr",
    createdAt: new Date()
  },
  {
    id: "4",
    name: "Hiroshi Tanaka",
    email: "hiroshi@example.com",
    age: 32,
    gender: "male",
    bio: "テクノロジー愛好家、ハイキング好き、そして新しい人との出会いを楽しみにしています。",
    images: ["/placeholder.svg"],
    interests: ["Technology", "Hiking", "Food", "Languages"],
    location: "Tokyo",
    preferredLanguage: "ja",
    createdAt: new Date()
  },
  {
    id: "5",
    name: "Anna Schmidt",
    email: "anna@example.com",
    age: 27,
    gender: "female",
    bio: "Ich liebe die Natur und gutes Essen. Suche jemanden, der meine Leidenschaft für Reisen teilt.",
    images: ["/placeholder.svg"],
    interests: ["Nature", "Cooking", "Travel", "Yoga"],
    location: "Berlin",
    preferredLanguage: "de",
    createdAt: new Date()
  }
];

// Example matches data
const INITIAL_MATCHES: Match[] = [
  {
    id: "match1",
    user1Id: "1",
    user2Id: "2",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    id: "match2",
    user1Id: "1",
    user2Id: "3",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  }
];

// Example messages data
const INITIAL_MESSAGES: Record<string, Message[]> = {
  "match1": [
    {
      id: "msg1",
      senderId: "2",
      receiverId: "1",
      originalText: "Hola! ¿Cómo estás? Me alegro de que hayamos hecho match.",
      originalLanguage: "es",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true
    },
    {
      id: "msg2",
      senderId: "1",
      receiverId: "2",
      originalText: "Hello! I'm good, thanks. I'm happy we matched too!",
      originalLanguage: "en",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1000 * 60 * 30), // 30 minutes after previous message
      read: true
    }
  ],
  "match2": [
    {
      id: "msg3",
      senderId: "3",
      receiverId: "1",
      originalText: "Bonjour! J'adore ton profil. Tu aimes voyager?",
      originalLanguage: "fr",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      read: true
    }
  ]
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [chats, setChats] = useState<Chat[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      generateChats(user.id);
    }
  }, [user, matches, messages]);

  const generateChats = (userId: string) => {
    const userMatches = matches.filter(
      match => match.user1Id === userId || match.user2Id === userId
    );

    const newChats = userMatches.map(match => {
      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
      const otherUser = users.find(u => u.id === otherUserId);
      
      if (!otherUser) {
        return null;
      }

      const matchMessages = messages[match.id] || [];
      const lastMsg = matchMessages.length > 0 
        ? matchMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
        : undefined;
      
      const unreadCount = matchMessages.filter(
        msg => msg.receiverId === userId && !msg.read
      ).length;

      return {
        matchId: match.id,
        userId: otherUser.id,
        userName: otherUser.name,
        userImage: otherUser.images[0],
        lastMessage: lastMsg?.originalText,
        lastMessageTime: lastMsg?.timestamp,
        unreadCount
      };
    }).filter(Boolean) as Chat[];

    setChats(newChats);
  };

  const discoverUsers = async () => {
    // In a real app, this would fetch users from an API
    // Here we're simulating by filtering out the current user and already matched users
    if (!user) return [];
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userMatches = matches.filter(
      match => match.user1Id === user.id || match.user2Id === user.id
    );
    
    const matchedUserIds = userMatches.map(match => 
      match.user1Id === user.id ? match.user2Id : match.user1Id
    );
    
    return users.filter(u => 
      u.id !== user.id && !matchedUserIds.includes(u.id)
    );
  };

  const getUser = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  const matchUsers = async (userId1: string, userId2: string) => {
    // Create a new match
    const newMatch: Match = {
      id: `match-${Date.now()}`,
      user1Id: userId1,
      user2Id: userId2,
      timestamp: new Date()
    };
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setMatches(prev => [...prev, newMatch]);
    
    toast({
      title: "New match!",
      description: "You have a new match! Start chatting now."
    });
    
    return newMatch;
  };

  const getChatMessages = async (matchId: string) => {
    // In a real app, this would fetch messages from an API
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return messages[matchId] || [];
  };

  const sendMessage = async (matchId: string, text: string) => {
    if (!user) throw new Error("User not authenticated");
    
    // Get the match to determine the recipient
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error("Match not found");
    
    const recipientId = match.user1Id === user.id ? match.user2Id : match.user1Id;
    
    // Create a new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId: recipientId,
      originalText: text,
      originalLanguage: user.preferredLanguage,
      timestamp: new Date(),
      read: false
    };
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update messages state
    setMessages(prev => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), newMessage]
    }));
    
    return newMessage;
  };

  const getUserChats = async (userId: string) => {
    // In a real app, this would fetch chats from an API
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return chats;
  };

  return (
    <UserContext.Provider 
      value={{ 
        users, 
        matches, 
        chats,
        messages,
        discoverUsers, 
        getUser,
        matchUsers,
        getChatMessages,
        sendMessage,
        getUserChats
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
};
