
import { useState } from "react";
import { User } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { translateText } from "@/services/translationService";
import { useAuth } from "@/contexts/AuthContext";

interface UserCardProps {
  user: User;
  onLike: () => void;
  onSkip: () => void;
}

const UserCard = ({ user, onLike, onSkip }: UserCardProps) => {
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const { user: currentUser } = useAuth();
  
  const translateBio = async () => {
    if (!currentUser || isTranslating) return;
    
    setIsTranslating(true);
    try {
      const response = await translateText(
        user.bio, 
        currentUser.preferredLanguage,
        null // Auto-detect source language
      );
      setTranslatedBio(response.translatedText);
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg transition-all duration-300 ease-in-out relative">
      <div className="relative aspect-[4/5] bg-muted">
        <img
          src={user.images[0]}
          alt={user.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-1">
            {user.name}, {user.age}
          </h2>
          <p className="text-sm opacity-90">{user.location}</p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg mb-1">About Me</h3>
          <p className="text-sm text-muted-foreground">
            {translatedBio || user.bio}
          </p>
          {!translatedBio && currentUser && user.preferredLanguage !== currentUser.preferredLanguage && (
            <Button 
              variant="link" 
              size="sm" 
              onClick={translateBio}
              className="p-0 h-auto text-xs text-primary"
              disabled={isTranslating}
            >
              {isTranslating ? "Translating..." : "Translate Bio"}
            </Button>
          )}
        </div>
        
        {user.interests.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-2 py-1 bg-muted text-xs rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-center gap-4 mt-4">
          <Button 
            onClick={onSkip}
            size="lg"
            variant="outline"
            className="rounded-full h-14 w-14 flex items-center justify-center"
          >
            <X className="h-6 w-6" />
          </Button>
          
          <Button
            onClick={onLike}
            size="lg"
            className="rounded-full h-14 w-14 flex items-center justify-center"
          >
            <Heart className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;
