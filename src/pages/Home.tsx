
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Globe, MessageCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";

const Home = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="inline-block mb-6">
            <Heart className="h-16 w-16 text-primary animate-pulse-heart" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent sm:text-5xl">
            Love Across Languages
          </h1>
          
          <p className="text-xl mb-8 text-muted-foreground">
            Connect with people from around the world, without language barriers holding you back.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="min-w-40">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="min-w-40">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          <div className="text-center p-6 bg-accent rounded-lg">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Break Language Barriers</h3>
            <p className="text-muted-foreground">
              Our real-time translation technology lets you chat naturally in your preferred language.
            </p>
          </div>
          
          <div className="text-center p-6 bg-accent rounded-lg">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connect Globally</h3>
            <p className="text-muted-foreground">
              Find meaningful connections with people from different countries and cultures.
            </p>
          </div>
          
          <div className="text-center p-6 bg-accent rounded-lg">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Seamless Communication</h3>
            <p className="text-muted-foreground">
              Chat naturally and see translations in real-time for effortless conversations.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
