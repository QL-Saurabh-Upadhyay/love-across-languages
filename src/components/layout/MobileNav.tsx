
import { Link, useLocation } from "react-router-dom";
import { Users, MessageCircle, User } from "lucide-react";

const MobileNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t">
      <div className="flex justify-around p-3">
        <Link
          to="/discover"
          className={`flex flex-col items-center justify-center ${
            location.pathname === "/discover" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Users className="h-6 w-6" />
          <span className="text-xs mt-1">Discover</span>
        </Link>
        
        <Link
          to="/messages"
          className={`flex flex-col items-center justify-center ${
            location.pathname === "/messages" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Messages</span>
        </Link>
        
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center ${
            location.pathname === "/profile" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
