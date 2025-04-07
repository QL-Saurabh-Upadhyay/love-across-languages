
import { useState, useEffect } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ChatList from "@/components/chat/ChatList";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-4 h-full">
        {/* On mobile, show either the chat list or the chat window */}
        {(!matchId || !isMobile) && (
          <div className={`${matchId && !isMobile ? 'w-1/3' : 'w-full'}`}>
            <h2 className="text-2xl font-bold mb-4">Messages</h2>
            <ChatList />
          </div>
        )}
        
        {/* Chat window */}
        {matchId && (
          <div className={`${!isMobile ? 'w-2/3' : 'w-full'}`}>
            <Outlet />
          </div>
        )}
        
        {/* Show a placeholder if no chat is selected on desktop */}
        {!matchId && !isMobile && (
          <div className="w-2/3 flex items-center justify-center h-[70vh] border rounded-md bg-accent/20">
            <p className="text-muted-foreground">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Messages;
