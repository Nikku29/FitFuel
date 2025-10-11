
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuoteRotatorProps {
  className?: string;
}

const quotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Strength does not come from the body. It comes from the will.",
  "The difference between try and triumph is a little umph.",
  "Don't wish for it, work for it.",
  "Sweat is just fat crying.",
  "The harder you push, the more you are pulled.",
  "Wake up with determination, go to bed with satisfaction.",
  "Challenges are what make life interesting. Overcoming them is what makes life meaningful.",
  "The only place where success comes before work is in the dictionary.",
  "Success isn't always about greatness. It's about consistency.",
  "Your health is an investment, not an expense.",
  "Fitness is not about being better than someone else. It's about being better than you used to be.",
  "If it doesn't challenge you, it doesn't change you.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Good things come to those who sweat.",
  "Making excuses burns zero calories per hour.",
  "Your body hears everything your mind says. Stay positive.",
  "The only workout you regret is the one you didn't do.",
  "What seems impossible today will one day become your warm-up."
];

const QuoteRotator: React.FC<QuoteRotatorProps> = ({ className }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 8000); // Change quote every 8 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative h-24 ${className || ''}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuoteIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute w-full text-center italic font-heading"
        >
          <motion.p 
            className="text-lg bg-gradient-to-r from-fitfuel-purple to-fitfuel-purple-dark bg-clip-text text-transparent"
            animate={{ 
              scale: [1, 1.02, 1],
              textShadow: ["0 0 0px rgba(155, 92, 246, 0)", "0 0 5px rgba(155, 92, 246, 0.5)", "0 0 0px rgba(155, 92, 246, 0)"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            "{quotes[currentQuoteIndex]}"
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuoteRotator;
