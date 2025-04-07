import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Chat } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/contexts/UserContext";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

const ChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { getUserChats } = useUsers();
  
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      
      try {
        const userChats = await getUserChats(user.id);
        setChats(userChats);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
  }, [user, getUserChats]);
  
  const formatTime = (date?: Date) => {
    if (!date) return "";
    
    const now = new Date();
    const chatDate = new Date(date);
    
    // If today
    if (chatDate.toDateString() === now.toDateString()) {
      return format(chatDate, "p"); // Returns time like "3:42 PM"
    }
    
    // If this week
    const diffDays = Math.floor((now.getTime() - chatDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return format(chatDate, "EEE"); // Returns day of week like "Mon"
    }
    
    // Otherwise
    return format(chatDate, "MMM d"); // Returns date like "Apr 1"
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Loading your conversations...</p>
      </div>
    );
  }
  
  if (chats.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <h3 className="font-semibold text-lg">No matches yet</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            When you match with someone, you can start chatting with them here.
          </p>
          <Link to="/discover" className="text-primary hover:underline">
            Find matches now
          </Link>
        </div>
      </Card>
    );
  }
  
  return (
    <ScrollArea className="h-[70vh]">
      <div className="space-y-2 pr-3">
        {chats.sort((a, b) => {
          const timeA = a.lastMessageTime?.getTime() || 0;
          const timeB = b.lastMessageTime?.getTime() || 0;
          return timeB - timeA;
        }).map((chat) => (
          <Link to={`/messages/${chat.matchId}`} key={chat.matchId}>
            <div className="flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors">
              <div className="relative">
                <img
                  src={chat.userImage}
                  alt={chat.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {chat.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs text-white">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold truncate">{chat.userName}</h3>
                  {chat.lastMessageTime && (
                    <span className="text-xs text-muted-foreground">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  )}
                </div>
                
                {chat.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChatList;
