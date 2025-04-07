
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
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
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to your authentication service
      const foundUser = MOCK_USERS.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error("Invalid credentials");
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setUser(foundUser);
      localStorage.setItem("user", JSON.stringify(foundUser));
      toast({
        title: "Login successful",
        description: `Welcome back, ${foundUser.name}!`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User>, password: string) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to your registration service
      const existingUser = MOCK_USERS.find(u => u.email === userData.email);
      
      if (existingUser) {
        throw new Error("Email already registered");
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name || "",
        email: userData.email || "",
        age: userData.age || 18,
        gender: userData.gender || "",
        bio: userData.bio || "",
        images: userData.images || ["/placeholder.svg"],
        interests: userData.interests || [],
        location: userData.location || "",
        preferredLanguage: userData.preferredLanguage || "en",
        createdAt: new Date()
      };
      
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      toast({
        title: "Registration successful",
        description: `Welcome, ${newUser.name}!`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  const updateUser = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      if (!user) throw new Error("No user logged in");
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
