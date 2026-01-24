
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { useAnonymousSession } from '@/hooks/useAnonymousSession';
import { Send, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnonymousUserForm from './AnonymousUserForm';
import { logError, logEvent } from '@/utils/sentry';

import { AIMessage } from '@/types/index';


// AI API configuration
import { aiService } from '@/services/aiService';

const AIChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      content: "Hi there! I'm your AI fitness and nutrition assistant. I can help you with workouts, nutrition advice, and create personalized plans. How can I help you today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPersonalizationForm, setShowPersonalizationForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { userData, user } = useUser();
  const { sessionToken, anonymousData, isLoading: sessionLoading, createSession } = useAnonymousSession();

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show personalization form for anonymous users on first visit
  useEffect(() => {
    if (!user && !sessionToken && !sessionLoading) {
      setShowPersonalizationForm(true);
    }
  }, [user, sessionToken, sessionLoading]);

  const handlePersonalizationSubmit = async (data: any) => {
    console.log('Submitting personalization data:', data);
    logEvent('personalization_form_submitted', { hasUserData: !!data });

    const result = await createSession(data);
    console.log('Session creation result:', result);

    if (result.success) {
      setShowPersonalizationForm(false);
      logEvent('anonymous_session_created');
      toast({
        title: "Profile saved!",
        description: "I'll use this information to give you personalized advice.",
      });
    } else {
      console.error('Failed to create session:', result.error);
      logError(new Error('Failed to create anonymous session'), { error: result.error });
      toast({
        title: "Error saving profile",
        description: "Don't worry, you can still use the assistant with general advice.",
        variant: "destructive"
      });
      setShowPersonalizationForm(false);
    }
  };

  const handleSkipPersonalization = () => {
    setShowPersonalizationForm(false);
    logEvent('personalization_form_skipped');
    toast({
      title: "Using general mode",
      description: "You can still get fitness advice! For personalized recommendations, you can share your details anytime.",
    });
  };

  const getPersonalizationContext = () => {
    if (user && userData) {
      // Authenticated user data
      let context = "You are a fitness and nutrition assistant. The user is logged in with the following profile:\n";

      if (userData.name) context += `Name: ${userData.name}\n`;
      if (userData.age) context += `Age: ${userData.age}\n`;
      if (userData.gender) context += `Gender: ${userData.gender}\n`;
      if (userData.height && userData.weight) {
        const heightInMeters = userData.height / 100;
        const bmi = (userData.weight / (heightInMeters * heightInMeters)).toFixed(1);
        context += `Height: ${userData.height}cm, Weight: ${userData.weight}kg (BMI: ${bmi})\n`;
      }
      if (userData.location) context += `Location: ${userData.location}\n`;
      if (userData.fitnessGoal) context += `Fitness Goal: ${userData.fitnessGoal}\n`;
      if (userData.activityLevel) context += `Fitness Level: ${userData.activityLevel}\n`;
      if (userData.dietaryPreference) context += `Dietary Preference: ${userData.dietaryPreference}\n`;
      if (userData.allergies) context += `Allergies/Food Sensitivities: ${userData.allergies}\n`;
      if (userData.medicalConditions) context += `Medical Conditions: ${userData.medicalConditions}\n`;
      if (userData.activityRestrictions) context += `Activity Restrictions: ${userData.activityRestrictions}\n`;

      return context;
    } else if (anonymousData) {
      // Anonymous user data
      let context = "You are a fitness and nutrition assistant. The user provided the following information:\n";

      if (anonymousData.age) context += `Age: ${anonymousData.age}\n`;
      if (anonymousData.gender) context += `Gender: ${anonymousData.gender}\n`;
      if (anonymousData.height_cm && anonymousData.weight_kg) {
        const heightInMeters = anonymousData.height_cm / 100;
        const bmi = (anonymousData.weight_kg / (heightInMeters * heightInMeters)).toFixed(1);
        context += `Height: ${anonymousData.height_cm}cm, Weight: ${anonymousData.weight_kg}kg (BMI: ${bmi})\n`;
      }
      if (anonymousData.location) context += `Location: ${anonymousData.location}\n`;
      if (anonymousData.fitness_goal) context += `Fitness Goal: ${anonymousData.fitness_goal}\n`;
      if (anonymousData.fitness_level) context += `Fitness Level: ${anonymousData.fitness_level}\n`;
      if (anonymousData.diet_preference) context += `Dietary Preference: ${anonymousData.diet_preference}\n`;
      if (anonymousData.allergies) context += `Allergies/Food Sensitivities: ${anonymousData.allergies}\n`;
      if (anonymousData.medical_conditions) context += `Medical Conditions: ${anonymousData.medical_conditions}\n`;
      if (anonymousData.activity_restrictions) context += `Activity Restrictions: ${anonymousData.activity_restrictions}\n`;

      return context;
    }

    return "You are a fitness and nutrition assistant. Provide general fitness and nutrition advice.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    // Log user interaction
    logEvent('ai_message_sent', {
      messageLength: currentInput.length,
      hasUserProfile: !!user,
      hasAnonymousData: !!anonymousData
    });

    try {
      console.log('Sending AI request with context:', getPersonalizationContext());

      const messages = [
        {
          role: 'system',
          content: `${getPersonalizationContext()}\n\nProvide helpful, accurate, and personalized fitness and nutrition advice. Be encouraging and supportive. If asked about medical conditions, always recommend consulting with healthcare professionals.`
        },
        {
          role: 'user',
          content: currentInput
        }
      ];

      // Call AI Service (delegates to Gemini)
      const aiResponse = await aiService.chat(messages);

      console.log('AI Response received');

      // Log successful AI response
      logEvent('ai_response_received', {
        responseLength: aiResponse.length,
        processingTime: Date.now() - parseInt(userMessage.id)
      });

      // Add AI response to messages
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: aiResponse,
            role: 'assistant',
            timestamp: new Date()
          }
        ]);
        setIsLoading(false);
      }, 500);

    } catch (error) {
      console.error("Error calling AI Service:", error);
      logError(error as Error, {
        userInput: currentInput,
        context: 'ai_chat_request'
      });

      // Add fallback response
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: "I'm sorry, I'm having trouble processing that request right now. Please try again in a moment, or ask me something else about fitness and nutrition!",
            role: 'assistant',
            timestamp: new Date()
          }
        ]);
        setIsLoading(false);
      }, 500);

      toast({
        title: "Connection issue",
        description: "Having trouble connecting to the AI. Please try again.",
        variant: "destructive"
      });
    }
  };

  const typingVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as const,
        duration: 0.5
      }
    }
  };

  if (showPersonalizationForm) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <AnonymousUserForm
          onSubmit={handlePersonalizationSubmit}
          onSkip={handleSkipPersonalization}
          isLoading={sessionLoading}
        />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="AI" />
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span>Fitness & Nutrition Assistant</span>
        </CardTitle>
        <CardDescription>
          {user ? (
            `Welcome back, ${userData.name || 'there'}! Ask me about workouts, nutrition, or get personalized fitness advice.`
          ) : anonymousData ? (
            "I have your profile info and can give you personalized advice. Ask me anything about fitness and nutrition!"
          ) : (
            "Ask questions about workouts, nutrition, or get general fitness advice. Want personalized recommendations? Share some details about yourself!"
          )}
        </CardDescription>
        {!user && !anonymousData && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPersonalizationForm(true)}
            className="w-fit"
          >
            Get Personalized Advice
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-96 overflow-hidden">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-slate-50 rounded-lg">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`${message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                      } rounded-lg px-4 py-2 max-w-[80%]`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2">
                    <motion.div
                      className="flex space-x-1"
                      variants={typingVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea
                placeholder="Ask about workouts, nutrition, or fitness advice..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[60px]"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-transform hover:scale-105 active:scale-95"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChat;
