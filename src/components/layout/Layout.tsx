
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import NavBar from "./NavBar";
import MobileNav from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
  withPadding?: boolean;
}

const Layout = ({ children, withPadding = true }: LayoutProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className={`flex-1 ${withPadding ? 'container py-4' : ''} ${user && isMobile ? 'pb-20' : ''}`}>
        {children}
      </main>
      {user && <MobileNav />}
    </div>
  );
};

export default Layout;
