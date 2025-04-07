import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Match, Chat, Message } from "@/types";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase, Tables } from "@/integrations/supabase/client";

interface UserContextType {
  users: User[];
  matches: Match[];
  chats: Chat[];
  messages: Record<string, Message[]>;
  discoverUsers: () => Promise<User[]>;
  getUser: (userId: string) => Promise<User | undefined>;
  matchUsers: (userId1: string, userId2: string) => Promise<Match>;
  getChatMessages: (matchId: string) => Promise<Message[]>;
  sendMessage: (matchId: string, text: string) => Promise<Message>;
  getUserChats: (userId: string) => Promise<Chat[]>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [chats, setChats] = useState<Chat[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadUsers();
      loadMatches();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('db-messages')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const newMessage = payload.new;
          handleNewMessage(newMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('db-matches')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'matches',
          filter: `user2_id=eq.${user.id}`
        },
        (payload) => {
          const newMatch = payload.new;
          handleNewMatch(newMatch);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleNewMessage = async (newMsg: any) => {
    const formattedMessage: Message = {
      id: newMsg.id,
      senderId: newMsg.sender_id,
      receiverId: newMsg.receiver_id,
      originalText: newMsg.original_text,
      originalLanguage: newMsg.original_language,
      translatedText: newMsg.translated_text,
      timestamp: new Date(newMsg.timestamp),
      read: newMsg.read
    };

    setMessages(prev => {
      const matchMessages = [...(prev[newMsg.match_id] || []), formattedMessage];
      return {
        ...prev,
        [newMsg.match_id]: matchMessages
      };
    });
    
    await loadUserChats(user!.id);
  };

  const handleNewMatch = async (newMatch: any) => {
    const formattedMatch: Match = {
      id: newMatch.id,
      user1Id: newMatch.user1_id,
      user2Id: newMatch.user2_id,
      timestamp: new Date(newMatch.created_at)
    };

    setMatches(prev => [...prev, formattedMatch]);
    
    await loadUserChats(user!.id);
    
    toast({
      title: "New match!",
      description: "You have a new match! Check your messages."
    });
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) throw error;
      
      if (data) {
        const loadedUsers: User[] = data.map(profile => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          age: profile.age || 0,
          gender: profile.gender || '',
          bio: profile.bio || '',
          images: profile.images?.length ? profile.images : ['/placeholder.svg'],
          interests: profile.interests || [],
          location: profile.location || '',
          preferredLanguage: profile.preferred_language || 'en',
          createdAt: new Date(profile.created_at)
        }));
        setUsers(loadedUsers);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadMatches = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        
      if (error) throw error;
      
      if (data) {
        const loadedMatches: Match[] = data.map(match => ({
          id: match.id,
          user1Id: match.user1_id,
          user2Id: match.user2_id,
          timestamp: new Date(match.created_at)
        }));
        setMatches(loadedMatches);
        
        loadedMatches.forEach(match => loadMatchMessages(match.id));
      }
    } catch (error) {
      console.error("Error loading matches:", error);
    }
  };

  const loadMatchMessages = async (matchId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('timestamp', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        const loadedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          originalText: msg.original_text,
          originalLanguage: msg.original_language,
          translatedText: msg.translated_text,
          timestamp: new Date(msg.timestamp),
          read: msg.read
        }));
        
        setMessages(prev => ({
          ...prev,
          [matchId]: loadedMessages
        }));
      }
    } catch (error) {
      console.error(`Error loading messages for match ${matchId}:`, error);
    }
  };

  const loadUserChats = async (userId: string) => {
    const userMatches = matches.filter(
      match => match.user1Id === userId || match.user2Id === userId
    );
    
    const newChats: Chat[] = [];
    
    for (const match of userMatches) {
      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
      const otherUser = users.find(u => u.id === otherUserId);
      
      if (!otherUser) continue;
      
      const matchMessages = messages[match.id] || [];
      const lastMsg = matchMessages.length > 0 
        ? matchMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
        : undefined;
      
      const unreadCount = matchMessages.filter(
        msg => msg.receiverId === userId && !msg.read
      ).length;
      
      newChats.push({
        matchId: match.id,
        userId: otherUser.id,
        userName: otherUser.name,
        userImage: otherUser.images[0],
        lastMessage: lastMsg?.originalText,
        lastMessageTime: lastMsg?.timestamp,
        unreadCount
      });
    }
    
    setChats(newChats);
    
    return newChats;
  };

  const discoverUsers = async () => {
    if (!user) return [];
    
    try {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        
      if (matchError) throw matchError;
      
      const matchedUserIds = matchData?.map(match => 
        match.user1_id === user.id ? match.user2_id : match.user1_id
      ) || [];
      
      const excludeIds = [user.id, ...matchedUserIds];
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${excludeIds.map(id => `"${id}"`).join(',')})`);
        
      if (userError) throw userError;
      
      if (!userData) return [];
      
      return userData.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        age: profile.age || 0,
        gender: profile.gender || '',
        bio: profile.bio || '',
        images: profile.images?.length ? profile.images : ['/placeholder.svg'],
        interests: profile.interests || [],
        location: profile.location || '',
        preferredLanguage: profile.preferred_language || 'en',
        createdAt: new Date(profile.created_at)
      }));
    } catch (error) {
      console.error("Error discovering users:", error);
      return [];
    }
  };

  const getUser = async (userId: string) => {
    const cachedUser = users.find(u => u.id === userId);
    if (cachedUser) return cachedUser;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        const user: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          age: data.age || 0,
          gender: data.gender || '',
          bio: data.bio || '',
          images: data.images?.length ? data.images : ['/placeholder.svg'],
          interests: data.interests || [],
          location: data.location || '',
          preferredLanguage: data.preferred_language || 'en',
          createdAt: new Date(data.created_at)
        };
        
        setUsers(prev => {
          const exists = prev.some(u => u.id === user.id);
          return exists ? prev : [...prev, user];
        });
        
        return user;
      }
      return undefined;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return undefined;
    }
  };

  const matchUsers = async (userId1: string, userId2: string) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert({
          user1_id: userId1,
          user2_id: userId2
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (!data) throw new Error("Failed to create match");
      
      const newMatch: Match = {
        id: data.id,
        user1Id: data.user1_id,
        user2Id: data.user2_id,
        timestamp: new Date(data.created_at || new Date())
      };
      
      setMatches(prev => [...prev, newMatch]);
      
      toast({
        title: "New match!",
        description: "You matched with someone new! Start chatting now."
      });
      
      return newMatch;
    } catch (error: any) {
      console.error("Error creating match:", error);
      toast({
        variant: "destructive",
        title: "Match failed",
        description: error.message || "Failed to create match"
      });
      throw error;
    }
  };

  const getChatMessages = async (matchId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('timestamp', { ascending: true });
        
      if (error) throw error;
      
      if (!data) return [];
      
      const loadedMessages: Message[] = data.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        originalText: msg.original_text,
        originalLanguage: msg.original_language,
        translatedText: msg.translated_text,
        timestamp: new Date(msg.timestamp || new Date()),
        read: msg.read || false
      }));
      
      setMessages(prev => ({
        ...prev,
        [matchId]: loadedMessages
      }));
      
      return loadedMessages;
    } catch (error) {
      console.error(`Error fetching messages for match ${matchId}:`, error);
      return [];
    }
  };

  const sendMessage = async (matchId: string, text: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) throw new Error("Match not found");
      
      const recipientId = match.user1Id === user.id ? match.user2Id : match.user1Id;
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          receiver_id: recipientId,
          original_text: text,
          original_language: user.preferredLanguage
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (!data) throw new Error("Failed to send message");
      
      const newMessage: Message = {
        id: data.id,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        originalText: data.original_text,
        originalLanguage: data.original_language,
        translatedText: data.translated_text,
        timestamp: new Date(data.timestamp || new Date()),
        read: data.read || false
      };
      
      setMessages(prev => {
        const matchMessages = [...(prev[matchId] || []), newMessage];
        return {
          ...prev,
          [matchId]: matchMessages
        };
      });
      
      await loadUserChats(user.id);
      
      return newMessage;
    } catch (error: any) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const getUserChats = async (userId: string) => {
    return loadUserChats(userId);
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
