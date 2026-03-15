import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, HeartPulse, Dumbbell, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import SEOHead from '@/components/production/SEOHead';
import { motion, Variants } from 'framer-motion';

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

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } as any }
  };

  const smoothReveal: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } as any }
  };

  return (
    <>
      <SEOHead
        title="FitFuel - Your Ultimate AI Fitness Companion"
        description="Transform your fitness journey with personalized workouts, nutrition guidance, and AI-powered coaching. Join thousands achieving their health goals."
        keywords={['fitness', 'workout', 'nutrition', 'health', 'AI coach']}
        type="website"
        url="https://fitfuel.app"
        image="https://fitfuel.app/og-image.jpg"
        siteName="FitFuel"
      />
      
      <div className="flex flex-col min-h-screen overflow-hidden">
        
        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-b from-white to-purple-50 pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          {/* subtle background blob */}
          <motion.div 
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
            <motion.div 
              className="space-y-8"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold border border-purple-200">
                <Sparkles className="w-4 h-4 mr-2" /> FitFuel 2.0 is Here
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-heading font-black leading-[1.1] tracking-tight text-gray-900">
                Your Personal <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fitfuel-purple to-indigo-600">AI Fitness</span> Assistant
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Achieve your dream physique with hyper-personalized workouts, intelligent meal plans, and real-time form tracking driven by our advanced Mixture of Experts AI.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to={userData.name ? "/assistant" : "/signup"}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="h-14 px-8 text-lg font-bold bg-gray-900 hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl transition-all rounded-xl">
                      {userData.name ? "Resume Journey" : "Start Free Trial"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Floating Hero Image */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.4 }}
            >
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-purple-400 to-indigo-500 blur-2xl opacity-40"></div>
                <div className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/40 ring-1 ring-black/5">
                  <img 
                    src="https://images.unsplash.com/photo-1594882645126-14020914d58d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                    alt="Athlete training with FitFuel" 
                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  {/* Glassmorphism floaty card */}
                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute bottom-6 left-6 right-6 md:right-auto bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Activity className="text-green-600 w-5 h-5"/>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Daily Goal</p>
                        <p className="text-sm font-black text-gray-900">85% Completed</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 bg-white relative z-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={smoothReveal}
            >
              <h2 className="text-4xl md:text-5xl font-heading font-black text-gray-900 tracking-tight">How FitFuel Learns You</h2>
              <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto font-medium">
                Our MoE architecture routes your data to specialized models, creating a fitness experience that evolves with your body.
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants} whileHover={{ y: -10 }}>
                  <Card className="border border-gray-100 bg-white shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-shadow duration-300 h-full overflow-hidden group">
                    <CardContent className="pt-8 p-6 relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500"></div>
                      <div className="relative">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-50 flex items-center justify-center mb-6 ring-1 ring-purple-100 shadow-inner">
                          {feature.icon}
                        </div>
                        <h3 className="text-2xl font-black mb-3 text-gray-900">{feature.title}</h3>
                        <p className="text-gray-500 leading-relaxed font-medium">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 bg-zinc-50 border-y border-zinc-200">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={smoothReveal}
            >
              <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight">Three Steps to Greatness</h2>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-3 gap-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              {[
                { step: "01", title: "Complete Profile", desc: "Share your baseline. The AI needs constraints to build your master plan." },
                { step: "02", title: "Follow the AI", desc: "Receive dynamic, constantly adjusting routines spanning lifting to nutrition." },
                { step: "03", title: "Track & Adapt", desc: "Log your sets. The engine learns your fatigue curves and suggests optimizations." }
              ].map((item, i) => (
                <motion.div key={i} variants={itemVariants} className="relative text-center group">
                  {i !== 2 && <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-purple-300 to-transparent"></div>}
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 border border-zinc-100 group-hover:border-purple-300 transition-colors transform group-hover:-translate-y-2 duration-300">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-indigo-600">{item.step}</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-gray-900">{item.title}</h3>
                  <p className="text-zinc-500 font-medium text-lg px-4">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={smoothReveal}
            >
              <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight">Wall of Gains</h2>
            </motion.div>
            
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              {[
                { name: "Sarah J.", stat: "Lost 15 lbs", img: "1", quote: "The MoE architecture feels like magic. It scales my food and adjusts my sets if I sleep poorly." },
                { name: "Michael T.", stat: "Gained 10 lbs Muscle", img: "11", quote: "Finally, a fitness app that isn't just a glorified spreadsheet. The procedural posture SVGs actually help." },
                { name: "Lisa K.", stat: "Marathon Ready", img: "5", quote: "The edge-crawler pulls my favorite running blogs perfectly. FitFuel centralized my entire health stack." }
              ].map((t, i) => (
                <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.03 }}>
                  <Card className="border border-zinc-100 bg-zinc-50 hover:bg-white shadow-md hover:shadow-xl transition-all h-full">
                    <CardContent className="pt-8">
                      <div className="flex items-center mb-6">
                        <img src={`https://i.pravatar.cc/150?img=${t.img}`} alt={t.name} className="w-14 h-14 rounded-full border-2 border-white shadow-sm" />
                        <div className="ml-4">
                          <h4 className="font-bold text-lg text-gray-900">{t.name}</h4>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 mt-1">{t.stat}</Badge>
                        </div>
                      </div>
                      <p className="text-zinc-600 font-medium text-lg leading-relaxed italic">"{t.quote}"</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* BRUTALIST CTA */}
        <section className="py-32 bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600 rounded-full blur-[120px] opacity-30 mix-blend-screen pointer-events-none"></div>
          
          <motion.div 
            className="container mx-auto px-4 text-center relative z-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={smoothReveal}
          >
            <h2 className="text-5xl md:text-7xl font-heading font-black text-white mb-8 tracking-tighter">
              Stop Guessing.<br/>Start Building.
            </h2>
            <Link to={userData.name ? "/assistant" : "/signup"}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-gray-900 hover:bg-purple-50 text-xl font-bold shadow-2xl transition-all">
                  {userData.name ? "Enter Dashboard" : "Deploy Your Plan"}
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </section>
      </div>
    </>
  );
};

// Re-usable badge component for testimonials
function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: string }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</span>;
}

export default Home;
