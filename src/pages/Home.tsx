
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, HeartPulse, Dumbbell, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import SEOHead from '@/components/production/SEOHead';

const Home = () => {
  const { userData } = useUser();
  
  const features = [
    {
      icon: <Activity size={40} className="text-fitfuel-purple" />,
      title: "AI-Powered Fitness",
      description: "Get personalized workout and nutrition plans tailored to your unique goals and preferences."
    },
    {
      icon: <HeartPulse size={40} className="text-fitfuel-purple" />,
      title: "Health Tracking",
      description: "Monitor your progress with intuitive dashboards and insightful analytics."
    },
    {
      icon: <Dumbbell size={40} className="text-fitfuel-purple" />,
      title: "Workout Library",
      description: "Access hundreds of exercises and routines suitable for all fitness levels."
    },
    {
      icon: <MessageSquare size={40} className="text-fitfuel-purple" />,
      title: "Community Support",
      description: "Connect with like-minded individuals on their fitness journey."
    }
  ];

  return (
    <>
      <SEOHead
        title="FitFusion - Your Ultimate Fitness Companion"
        description="Transform your fitness journey with personalized workouts, nutrition guidance, and AI-powered coaching. Join thousands achieving their health goals."
        keywords={['fitness', 'workout', 'nutrition', 'health', 'AI coach']}
        type="website"
        url="https://your-domain.com"
        image="https://your-domain.com/og-image.jpg"
        siteName="FitFusion"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "FitFusion",
          "url": "https://your-domain.com",
          "description": "Your Ultimate Fitness Companion"
        }}
      />
      <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-purple-50 py-16 md:py-24">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight">
              Your Personal <span className="text-fitfuel-purple">AI Fitness</span> Assistant
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              Achieve your fitness goals with personalized workouts, meal plans, and progress tracking powered by artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={userData.name ? "/assistant" : "/signup"}>
                <Button size="lg" className="gradient-purple hover:opacity-90 transition-opacity">
                  {userData.name ? "Get Started" : "Sign Up Free"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative animate-fade-in delay-200">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-fitfuel-purple-light to-fitfuel-green blur-lg opacity-30"></div>
            <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1594882645126-14020914d58d" 
                alt="Person using FITFUEL app" 
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold">How FITFUEL Works</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform learns from your goals, preferences, and progress to deliver a truly personalized fitness experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg card-hover animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                <CardContent className="pt-6">
                  <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold">Your Fitness Journey</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Get started with FITFUEL in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 animate-fade-in">
              <div className="w-16 h-16 bg-fitfuel-purple rounded-full text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="text-xl font-heading font-semibold mb-2">Complete Your Profile</h3>
              <p className="text-gray-600">Share your fitness goals, preferences, and current stats with our AI assistant.</p>
            </div>
            
            <div className="text-center p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="w-16 h-16 bg-fitfuel-purple rounded-full text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="text-xl font-heading font-semibold mb-2">Get Personalized Plans</h3>
              <p className="text-gray-600">Receive custom workouts and nutrition plans designed specifically for you.</p>
            </div>
            
            <div className="text-center p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="w-16 h-16 bg-fitfuel-purple rounded-full text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="text-xl font-heading font-semibold mb-2">Track Your Progress</h3>
              <p className="text-gray-600">Monitor your results, adjust your goals, and celebrate your achievements.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to={userData.name ? "/assistant" : "/signup"}>
              <Button size="lg" className="gradient-purple hover:opacity-90 transition-opacity">
                {userData.name ? "Continue Your Journey" : "Start Your Journey"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold">What Our Users Say</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg card-hover animate-fade-in">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src="https://i.pravatar.cc/150?img=1" 
                      alt="User" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">Sarah J.</h4>
                    <p className="text-sm text-gray-500">Lost 15 lbs in 3 months</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The personalized meal plans and workouts have been a game changer for me. The AI really understands my preferences and limitations."
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg card-hover animate-fade-in" style={{ animationDelay: '150ms' }}>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src="https://i.pravatar.cc/150?img=11" 
                      alt="User" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">Michael T.</h4>
                    <p className="text-sm text-gray-500">Gained 10 lbs of muscle</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "As someone with a busy schedule, FITFUEL's adaptive workouts have been perfect. The AI adjusts when I'm short on time but still ensures I'm making progress."
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg card-hover animate-fade-in" style={{ animationDelay: '300ms' }}>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src="https://i.pravatar.cc/150?img=5" 
                      alt="User" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">Lisa K.</h4>
                    <p className="text-sm text-gray-500">Improved flexibility & strength</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The variety of workouts keeps me engaged and the nutrition guidance is practical. I've never stuck with a fitness program this long before!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-fitfuel-purple text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Ready to Transform Your Fitness Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who have achieved their fitness goals with FITFUEL's AI-powered guidance.
          </p>
          <Link to={userData.name ? "/assistant" : "/signup"}>
            <Button size="lg" className="bg-white text-fitfuel-purple hover:bg-gray-100 transition-colors">
              {userData.name ? "Go to AI Assistant" : "Get Started for Free"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
    </>
  );
};

export default Home;
