import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MotionButton } from "@/components/ui/motion-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/contexts/UserContext';
import { signUp, signInWithGoogle } from '@/integrations/firebase/auth';
import { createProfile } from '@/integrations/firebase/firestore';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import QuoteRotator from '@/components/ui/QuoteRotator';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, session } = useUser();

  useEffect(() => {
    if (user && session) {
      navigate('/');
    }
  }, [user, session, navigate]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: string): string | null => {
    if (!touched[field]) return null;
    
    switch (field) {
      case 'name':
        return !name ? 'Name is required' : null;
      case 'email':
        return !email ? 'Email is required' : 
               !email.includes('@') ? 'Invalid email address' : null;
      case 'password':
        return !password ? 'Password is required' : 
               password.length < 6 ? 'Password must be at least 6 characters' : null;
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({
      name: true,
      email: true,
      password: true,
      agreeTerms: true
    });
    
    if (!name || !email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (!email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    if (!agreeTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { user, error } = await signUp(email, password, name);
      
      if (error) throw error;
      
      if (user) {
        // Create user profile in Firestore
        await createProfile(user.uid, {
          email: user.email || '',
          full_name: name,
        });
        
        toast({
          title: "Account Created Successfully",
          description: "Welcome to FITFUEL! Your account has been created.",
        });
        
        navigate('/');
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Sign-up Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { user, error } = await signInWithGoogle();
      
      if (error) throw error;
      
      if (user) {
        // Create or update user profile in Firestore
        await createProfile(user.uid, {
          email: user.email || '',
          full_name: user.displayName || '',
        });
        
        toast({
          title: "Success",
          description: "Successfully signed up with Google!",
        });
        
        navigate('/');
      }
    } catch (error: any) {
      console.error("Google sign-up error:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Google Sign-Up failed",
        variant: "destructive"
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-50 overflow-hidden">
        <div className="w-full max-w-md space-y-8">
          <motion.div 
            className="text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="gradient-purple text-white font-bold text-xl p-2 rounded-lg">
                FIT
              </div>
              <span className="font-heading font-bold text-xl text-fitfuel-purple">FUEL</span>
            </Link>
            <h2 className="mt-6 text-3xl font-heading font-bold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join FITFUEL and start your personalized fitness journey
            </p>
          </motion.div>
          
          <QuoteRotator />
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-fitfuel-purple/20 shadow-lg shadow-fitfuel-purple/10">
              <CardHeader>
                <CardTitle className="text-xl">Sign up</CardTitle>
                <CardDescription>
                  Enter your information to create an account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center justify-between">
                      <span>Name</span>
                      {getFieldError('name') && (
                        <span className="text-xs font-normal text-red-500">{getFieldError('name')}</span>
                      )}
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => handleBlur('name')}
                      className={cn(
                        "input-gradient-focus transition-all duration-200",
                        getFieldError('name') ? "border-red-500 focus:border-red-500" : ""
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center justify-between">
                      <span>Email</span>
                      {getFieldError('email') && (
                        <span className="text-xs font-normal text-red-500">{getFieldError('email')}</span>
                      )}
                    </Label>
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={cn(
                        "input-gradient-focus transition-all duration-200",
                        getFieldError('email') ? "border-red-500 focus:border-red-500" : ""
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center justify-between">
                      <span>Password</span>
                      {getFieldError('password') && (
                        <span className="text-xs font-normal text-red-500">{getFieldError('password')}</span>
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleBlur('password')}
                        className={cn(
                          "input-gradient-focus pr-10 transition-all duration-200",
                          getFieldError('password') ? "border-red-500 focus:border-red-500" : ""
                        )}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                    <PasswordStrengthIndicator password={password} />
                  </div>
                  
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox 
                      id="terms" 
                      checked={agreeTerms}
                      onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                      className={cn(
                        !agreeTerms && touched.agreeTerms ? "border-red-500" : ""
                      )}
                    />
                    <label
                      htmlFor="terms"
                      className={cn(
                        "text-sm text-gray-600 leading-tight cursor-pointer",
                        !agreeTerms && touched.agreeTerms ? "text-red-500" : ""
                      )}
                    >
                      I agree to the{" "}
                      <Link to="#" className="text-fitfuel-purple hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="#" className="text-fitfuel-purple hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  
                  <MotionButton 
                    type="submit" 
                    className="w-full gradient-purple hover:opacity-90 transition-opacity relative"
                    disabled={loading}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : "Create account"}
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
                
                <motion.div 
                  className="mt-4" 
                  variants={itemVariants}
                >
                  <MotionButton 
                    variant="outline" 
                    className="w-full" 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleSignUp}
                  >
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12H16"/><path d="M12 8v8"/></svg>
                    Google
                  </MotionButton>
                </motion.div>
              </CardContent>
              <CardFooter>
                <p className="text-center text-sm text-gray-600 mt-2 w-full">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-fitfuel-purple hover:text-fitfuel-purple-dark">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Signup;
