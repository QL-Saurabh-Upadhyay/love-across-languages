
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Users, MessageCircle, User, LogOut } from "lucide-react";
import { getLanguageName } from "@/services/translationService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <Link to="/" className="text-lg font-bold">
            LoveAcrossLanguages
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/discover"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === "/discover" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Discover
                  </div>
                </Link>
                <Link
                  to="/messages"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === "/messages" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    Messages
                  </div>
                </Link>
                <Link
                  to="/profile"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === "/profile" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Profile
                  </div>
                </Link>
              </nav>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.images[0]} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Language: {getLanguageName(user.preferredLanguage)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
