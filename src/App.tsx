import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import Navbar from "./components/navigation/Navbar";
import Footer from "./components/navigation/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
// Group A (Verified Safe)
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
// import Assistant from "./pages/Assistant";

// Group B (Testing)
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import Workouts from "./pages/Workouts";

// Group C (Disabled)
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import MonitoringDashboard from "./pages/MonitoringDashboard";
import AIOnboarding from "./pages/AIOnboarding";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
// Group B (Testing)
import { setupLazyLoading } from "./utils/imageOptimization";
import { initSentry } from "./utils/sentry";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";
import { performanceMonitor } from "./utils/performance";
import { userBehaviorTracker } from "./utils/userBehaviorTracking";
import { setupCSP, setupSecurityHeaders } from "./utils/security";
import { preloadResources } from "./utils/buildOptimization";
import ErrorFallback from "./components/production/ErrorFallback";
import { initializeProductionOptimizations } from "./utils/productionOptimizations";

// Create a client
const queryClient = new QueryClient();

// Initialize Sentry
/*
if (import.meta.env.PROD) {
  initSentry();
}
*/

// Animated page wrapper  
const AnimatedRoutes = () => {
  const location = useLocation();

  // Track page views for analytics
  useEffect(() => {
    userBehaviorTracker.trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      {/* @ts-ignore - Routes key is required for AnimatePresence to work correctly */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        {/* Assistant Route Removed for Open Source UX Pivot */}
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/recipes" element={<PageTransition><Recipes /></PageTransition>} />
        <Route path="/workouts" element={<PageTransition><Workouts /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/subscription" element={<PageTransition><Subscription /></PageTransition>} />
        <Route path="/monitoring" element={<PageTransition><MonitoringDashboard /></PageTransition>} />
        <Route path="/ai-onboarding" element={<PageTransition><AIOnboarding /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  console.log('Build: App component rendering...');
  // Initialize production optimizations
  useEffect(() => {
    console.log('Build: Effect running');
    // initializeProductionOptimizations();
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    console.log('Performance monitoring log');
    /*
    console.log('Performance monitoring initialized');

    return () => {
      performanceMonitor.cleanup();
    };
    */
  }, []);

  return (
    // <div style={{ padding: 20, fontSize: 24, color: 'green' }}>App Loaded - Providers Disabled</div>

    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <ErrorBoundary>
                    <AnimatedRoutes />
                  </ErrorBoundary>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </UserProvider>
      </QueryClientProvider>
    </ErrorBoundary>

  );
};

export default App;
