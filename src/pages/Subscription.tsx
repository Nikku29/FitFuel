
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const Subscription = () => {
    const { user } = useUser();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubscribe = (plan: string) => {
        if (!user) {
            toast({
                title: "Log in required",
                description: "Please log in to subscribe to a plan.",
                variant: "destructive"
            });
            navigate('/login');
            return;
        }

        // Mock Payment Flow for "Zero Funds" constraint
        toast({
            title: "Processing...",
            description: "Upgrading your plan (Free Trial Mode)...",
        });

        setTimeout(() => {
            toast({
                title: "Welcome to Pro! 🌟",
                description: "You have successfully upgraded to FitFuel Pro.",
            });
            navigate('/dashboard');
        }, 1500);
    };

    const plans = [
        {
            name: "Starter",
            price: "$0",
            period: "/month",
            description: "Everything you need to start your journey",
            features: [
                "Basic Workout Tracking",
                "5 AI Chef Recipes / month",
                "Community Access",
                "Standard Support"
            ],
            cta: "Current Plan",
            popular: false,
            disabled: true
        },
        {
            name: "FitFuel Pro",
            price: "$9.99",
            period: "/month",
            description: "Unlock your full potential with AI",
            features: [
                "Unlimited AI Chef Recipes",
                "Advanced Workout Analytics",
                "Priority AI Personal Trainer",
                "Smart Food Scanner",
                "Custom Meal Plans"
            ],
            cta: "Start Free Trial",
            popular: true,
            disabled: false
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Choose Your Fuel
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-4">
                            Simple pricing for serious fitness. Unlock advanced AI features to reach your goals faster.
                        </p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                            <Card className={`relative h-full border-2 ${plan.popular ? 'border-purple-500 shadow-xl' : 'border-gray-100'} bg-white/80 backdrop-blur`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center shadow-lg">
                                        <Star className="w-4 h-4 mr-1 fill-current" /> Most Popular
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        <span className="text-gray-500">{plan.period}</span>
                                    </div>
                                    <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center text-gray-700">
                                                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : ''}`}
                                        variant={plan.popular ? 'default' : 'outline'}
                                        disabled={plan.disabled}
                                        onClick={() => handleSubscribe(plan.name)}
                                    >
                                        {plan.cta == 'Current Plan' ? plan.cta : <><Zap className="w-4 h-4 mr-2" /> {plan.cta}</>}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center text-gray-500 text-sm">
                    <p>Secure payments processed by Stripe (Simulated)</p>
                    <p>Cancel anytime. No questions asked.</p>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
