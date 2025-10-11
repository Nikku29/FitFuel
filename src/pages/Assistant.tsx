
import React from 'react';
import AIChat from '@/components/assistant/AIChat';
import { motion } from 'framer-motion';

const Assistant = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex flex-col space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col space-y-2">
            <motion.h1 
              className="text-3xl md:text-4xl font-heading font-bold text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              AI Fitness & Nutrition Assistant
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Get personalized workout advice, nutritional guidance, and answers to your fitness questions.
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full"
          >
            <AIChat />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Assistant;
