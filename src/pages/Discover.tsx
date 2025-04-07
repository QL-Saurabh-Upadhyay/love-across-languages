
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import UserCard from "@/components/user/UserCard";
import { User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/contexts/UserContext";

const Discover = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  const { discoverUsers, matchUsers } = useUsers();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const loadUsers = async () => {
      try {
        const availableUsers = await discoverUsers();
        setUsers(availableUsers);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [user, navigate, discoverUsers]);
  
  const handleLike = async () => {
    if (currentIndex >= users.length) return;
    
    const likedUser = users[currentIndex];
    
    try {
      if (user) {
        await matchUsers(user.id, likedUser.id);
      }
    } catch (error) {
      console.error("Failed to create match:", error);
    } finally {
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  const handleSkip = () => {
    setCurrentIndex(prev => prev + 1);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-muted-foreground">Finding people for you...</p>
        </div>
      </Layout>
    );
  }
  
  if (users.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <h2 className="text-2xl font-bold mb-2">No more profiles</h2>
          <p className="text-muted-foreground">
            We've run out of profiles to show you. Check back later!
          </p>
        </div>
      </Layout>
    );
  }
  
  if (currentIndex >= users.length) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <h2 className="text-2xl font-bold mb-2">That's everyone for now!</h2>
          <p className="text-muted-foreground">
            You've viewed all available profiles. Check back later for more!
          </p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-8 min-h-[70vh]">
        <UserCard
          user={users[currentIndex]}
          onLike={handleLike}
          onSkip={handleSkip}
        />
      </div>
    </Layout>
  );
};

export default Discover;
