
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProfileEdit from "@/components/user/ProfileEdit";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { getLanguageName } from "@/services/translationService";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <Card className="w-full md:w-72 flex-shrink-0">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                <img
                  src={user.images[0]}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground text-sm">{user.location}</p>
              
              <div className="mt-4 w-full">
                <div className="text-sm">
                  <span className="text-muted-foreground">Age:</span> {user.age}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Preferred language:</span>{" "}
                  {getLanguageName(user.preferredLanguage)}
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>
          
          <div className="flex-1">
            <ProfileEdit />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
