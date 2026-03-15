import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initiateCheckout } from '@/services/stripeService';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLoadingPlan(planId);
    try {
      await initiateCheckout(planId);
    } finally {
      // Small timeout so user can read the toast before resetting loader
      setTimeout(() => setLoadingPlan(null), 1500);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  const plans = [
    {
      id: 'basic',
      name: 'Starter',
      description: 'Perfect for tracking everyday nutrition and fitness basics.',
      monthlyPrice: 0,
      annualPrice: 0,
      icon: <Shield className="h-6 w-6 text-blue-500" />,
      features: [
        'Basic calorie tracking',
        'Standard macro breakdown',
        'Access to community recipes',
        'Simple workout logger'
      ],
      ctaText: 'Get Started',
      popular: false,
      color: 'blue'
    },
    {
      id: 'pro',
      name: 'Pro AI',
      description: 'Unlock the full potential of AI-driven personalized health.',
      monthlyPrice: 19,
      annualPrice: 15, // Calculated as $15/mo billed annually
      icon: <Sparkles className="h-6 w-6 text-purple-500" />,
      features: [
        'AI personalized recipes',
        'Vision AI food scanning',
        'Smart workout generation',
        'Advanced nutritional insights',
        'Priority email support'
      ],
      ctaText: 'Upgrade to Pro',
      popular: true,
      color: 'purple'
    },
    {
      id: 'elite',
      name: 'Elite Coaching',
      description: 'Human-in-the-loop coaching plus unlimited AI usage.',
      monthlyPrice: 99,
      annualPrice: 79,
      icon: <Crown className="h-6 w-6 text-orange-500" />,
      features: [
        'Everything in Pro AI',
        'Monthly 1-on-1 coaching call',
        'Custom macro adjustments',
        'Form check video analysis',
        '24/7 priority chat support'
      ],
      ctaText: 'Go Elite',
      popular: false,
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-20 relative overflow-hidden flex flex-col items-center">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full z-10 text-center mb-16">
        <motion.h1 
          className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Simple, transparent pricing
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          No hidden fees. Choose the plan that best fits your fitness journey.
        </motion.p>

        {/* Billing Toggle */}
        <motion.div 
          className="flex items-center justify-center mt-10 space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
          <button 
            role="switch"
            aria-checked={isAnnual}
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 hover:cursor-pointer ${isAnnual ? 'bg-purple-600' : 'bg-slate-300'}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`}
            />
          </button>
          <span className={`text-sm font-medium flex items-center ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
            Annually <span className="ml-2 rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-700">Save 20%</span>
          </span>
        </motion.div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 z-10"
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            variants={itemVariants}
            className={`relative flex flex-col rounded-3xl bg-white p-8 shadow-xl border-2 transition-transform duration-300 hover:-translate-y-2 ${plan.popular ? 'border-purple-500 shadow-purple-500/10' : 'border-transparent'}`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-1 text-sm font-semibold text-white shadow-md">
                Most Popular
              </div>
            )}
            
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-xl bg-${plan.color}-50`}>
                {plan.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
            </div>
            
            <p className="text-slate-500 text-sm min-h-[40px] mb-6">{plan.description}</p>
            
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900">
                ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
              </span>
              <span className="text-slate-500 font-medium">/mo</span>
            </div>
            
            <ul className="mb-8 space-y-4 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <Check className={`h-5 w-5 mr-3 shrink-0 text-${plan.color}-500`} />
                  <span className="text-slate-600 font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className={`w-full py-6 text-lg rounded-xl font-semibold transition-all shadow-md ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-lg' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
              onClick={() => handleSubscribe(plan.id)}
              disabled={loadingPlan === plan.id}
            >
              {loadingPlan === plan.id ? 'Processing...' : plan.ctaText}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PricingPage;
