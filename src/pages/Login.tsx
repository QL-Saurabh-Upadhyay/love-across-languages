
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { Heart } from "lucide-react";

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate("/discover");
    }
  }, [user, navigate]);
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
        <div className="text-center mb-8">
          <Heart className="h-10 w-10 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold">Sign in to Love Across Languages</h1>
          <p className="text-muted-foreground mt-2">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Create one now
            </Link>
          </p>
        </div>
        
        <LoginForm />
      </div>
    </Layout>
  );
};

export default Login;
