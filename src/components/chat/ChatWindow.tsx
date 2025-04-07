
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Message } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/contexts/UserContext";
import { Send } from "lucide-react";
import { format } from "date-fns";

const ChatWindow = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { getChatMessages, sendMessage } = useUsers();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const pollingRef = useRef<number | null>(null);
  
  // Function to fetch messages
  const fetchMessages = async () => {
    if (!matchId || !user) return;
    
    try {
      const chatMessages = await getChatMessages(matchId);
      setMessages(chatMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      return;
    }
    
    // Clear any existing polling interval
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    
    // Initial fetch
    fetchMessages();
    
    // Set up polling for new messages
    pollingRef.current = window.setInterval(fetchMessages, 5000);
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [matchId, user]);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSend = async () => {
    if (!matchId || !newMessage.trim() || sending || !user) return;
    
    setSending(true);
    try {
      await sendMessage(matchId, newMessage.trim());
      setNewMessage("");
      // Fetch latest messages immediately after sending
      await fetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  if (!matchId || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Send a message to start the conversation.</p>
        </div>
        <div className="border-t p-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    );
  }
  
  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {};
  messages.forEach((message) => {
    const date = format(new Date(message.timestamp), "MMMM d, yyyy");
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });
  
  return (
    <div className="flex flex-col h-[70vh]">
      <ScrollArea className="flex-1 p-4">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-3">
            <div className="relative text-center my-4">
              <span className="bg-background px-2 text-xs text-muted-foreground">
                {date}
              </span>
              <div className="absolute inset-y-1/2 w-full h-px bg-border -z-10"></div>
            </div>
            
            {msgs.map((message) => {
              const isMine = user?.id === message.senderId;
              const showTranslation = !isMine && message.translatedText;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 ${
                      isMine
                        ? "bg-primary text-primary-foreground chat-bubble-out"
                        : "bg-accent text-accent-foreground chat-bubble-in"
                    }`}
                  >
                    <p className="text-sm">{isMine ? message.originalText : (message.translatedText || message.originalText)}</p>
                    {/* Only show original text if it's been translated */}
                    {!isMine && message.translatedText && (
                      <div className="mt-1 pt-1 border-t border-border/20 text-xs opacity-70 italic">
                        Original: {message.originalText}
                      </div>
                    )}
                    <div className="text-right mt-1">
                      <span className={`text-xs ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {format(new Date(message.timestamp), "p")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      
      <div className="border-t p-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
