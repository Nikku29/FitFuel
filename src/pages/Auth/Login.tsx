
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MotionButton } from "@/components/ui/motion-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/contexts/UserContext';
import { signIn, signInWithGoogle } from '@/integrations/firebase/auth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, session, profile, isLoading } = useUser();

  useEffect(() => {
    if (user && session && !isLoading) {
      if (profile?.height_cm && profile?.weight_kg && profile?.fitness_goal) {
        navigate('/dashboard');
      } else {
        navigate('/profile');
      }
    }
  }, [user, session, isLoading, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { user, error } = await signIn(email, password);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have successfully logged in!",
      });

      navigate('/');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to log in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const { user, error } = await signInWithGoogle();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully logged in with Google!",
      });

      navigate('/');
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Error",
        description: error.message || "Google Sign-In failed.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50">
      <div className="w-full max-w-md space-y-8">
        <motion.div
          className="text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xl p-2 rounded-lg shadow-lg">
              FIT
            </div>
            <span className="font-heading font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">FUSION</span>
          </Link>
          <h2 className="mt-6 text-3xl font-heading font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your personalized fitness journey
          </p>
        </motion.div>

        <Card className="animate-fade-in bg-white/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-t-lg">
            <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email below to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm font-medium cursor-pointer text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <MotionButton
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : "Sign in"}
              </MotionButton>
            </form>

            <div className="mt-4 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <MotionButton
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Google
              </MotionButton>
            </div>
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-b-lg">
            <p className="text-center text-sm text-gray-600 mt-2 w-full">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-purple-600 hover:text-purple-700">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
