
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Layout from "@/components/layout/Layout";

const Home = () => {
  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-3xl">
          <div className="mb-8 flex flex-col items-center">
            <Heart className="h-16 w-16 text-primary mb-4" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Love Across Languages</h1>
            <p className="text-xl text-muted-foreground">
              Connect with people from all around the world, regardless of the languages you speak.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild size="lg" className="text-lg">
              <Link to="/register">Create Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Find Your Match</h3>
              <p className="text-muted-foreground">
                Discover people who share your interests, no matter what language they speak.
              </p>
            </div>
            
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Chat Naturally</h3>
              <p className="text-muted-foreground">
                Our automatic translation allows you to communicate effortlessly in your native language.
              </p>
            </div>
            
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Build Connections</h3>
              <p className="text-muted-foreground">
                Break the language barrier and form meaningful relationships across cultures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
