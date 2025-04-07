
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/contexts/AuthContext";
import { Heart } from "lucide-react";

const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center mb-8">
          <Heart className="h-10 w-10 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </Layout>
  );
};

export default Register;
