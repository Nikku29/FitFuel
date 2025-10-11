
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuoteDisplayProps {
  className?: string;
  workoutType: string;
}

// Quotes categorized by workout type
const quotesByType: Record<string, string[]> = {
  // General quotes for all workout types
  general: [
    "The only bad workout is the one that didn't happen.",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "Strength does not come from the body. It comes from the will.",
    "The difference between try and triumph is a little umph.",
    "Don't wish for it, work for it.",
    "The harder you push, the more you are pulled.",
    "Wake up with determination, go to bed with satisfaction.",
    "Challenges are what make life interesting. Overcoming them is what makes life meaningful.",
    "The only place where success comes before work is in the dictionary.",
    "Success isn't always about greatness. It's about consistency.",
    "Your health is an investment, not an expense.",
    "Fitness is not about being better than someone else. It's about being better than you used to be.",
    "If it doesn't challenge you, it doesn't change you.",
    "Your body hears everything your mind says. Stay positive.",
    "What seems impossible today will one day become your warm-up."
  ],
  
  // Strength training specific quotes
  strength: [
    "The iron never lies to you. You can walk outside and listen to all kinds of talk, but the iron is the great reference point.",
    "The resistance that you fight physically in the gym and the resistance that you fight in life can only build a strong character.",
    "The last three or four reps is what makes the muscle grow.",
    "Every rep counts. Every set matters. Make it meaningful.",
    "Strong people are harder to kill than weak people and more useful in general.",
    "The body achieves what the mind believes.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Strength is the product of struggle. You must do what others don't to achieve what others won't.",
    "If you want something you've never had, you must be willing to do something you've never done."
  ],
  
  // Cardio specific quotes
  cardio: [
    "Running is the greatest metaphor for life, because you get out of it what you put into it.",
    "The miracle isn't that I finished. The miracle is that I had the courage to start.",
    "The voice in your head that says you can't do this is a liar.",
    "The harder you run, the more your body will adapt.",
    "Every heartbeat makes you stronger.",
    "The only runner you're competing against is yourself.",
    "Your heart is the strongest muscle in your body. Train it well.",
    "When your legs get tired, run with your heart.",
    "Sweat is just fat crying."
  ],
  
  // Yoga specific quotes
  yoga: [
    "Yoga is not about touching your toes, it's about what you learn on the way down.",
    "Yoga is the journey of the self, through the self, to the self.",
    "The body benefits from movement, and the mind benefits from stillness.",
    "Yoga takes you into the present moment, the only place where life exists.",
    "Calming the mind is yoga. Not just standing on your head.",
    "Yoga is not about self-improvement, it's about self-acceptance.",
    "You cannot always control what goes on outside, but you can always control what goes on inside.",
    "Inhale the future, exhale the past.",
    "The pose begins when you want to leave it."
  ],
  
  // HIIT specific quotes
  hiit: [
    "High intensity, higher results.",
    "Your body is your temple. Don't let it fall apart.",
    "It's supposed to be intense. That's why it works.",
    "Don't count the seconds, make the seconds count.",
    "HIIT: because your body deserves to be pushed to its limits.",
    "If it doesn't challenge you, it won't change you.",
    "Short, intense, and effective. Just like life should be.",
    "The harder the battle, the sweeter the victory.",
    "Be stronger than your strongest excuse."
  ],
  
  // Core specific quotes
  core: [
    "A strong core leads to a strong everything else.",
    "Your core is your foundation. Build it strong.",
    "Abs are made in the kitchen and carved in the gym.",
    "When your core is strong, everything else falls into place.",
    "Building a strong core isn't just for looks, it's for life.",
    "A weak core is a weak body.",
    "The plank doesn't make you weak, it reveals your weakness so you can fix it.",
    "Work your core like you're preparing for battle.",
    "Core strength is life strength."
  ],
  
  // Mobility specific quotes
  mobility: [
    "Mobility before ability.",
    "Motion is lotion for the joints.",
    "Recovery is where the growth happens.",
    "Slow down to speed up.",
    "Flexibility is about creating space in the body to move freely.",
    "The goal is to move better, not just move more.",
    "An ounce of prevention is worth a pound of cure.",
    "Small movements, big results.",
    "Tight muscles are weak muscles."
  ],
  
  // Warm-up specific quotes
  "warm-up": [
    "A proper warm-up is like a good introduction – it sets the tone for everything that follows.",
    "Warm-up is not a waste of time, it's an investment.",
    "Prepare the body and the mind will follow.",
    "Start slow to finish strong.",
    "Your warm-up determines the quality of your workout.",
    "Skipping your warm-up is like starting your car in winter without letting the engine heat up.",
    "Prime the pump before the heavy flow.",
    "A good warm-up makes a good workout great."
  ]
};

const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ className, workoutType }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  // Determine which quote set to use based on workout type
  const getQuotesForType = () => {
    if (quotesByType[workoutType] && quotesByType[workoutType].length > 0) {
      return quotesByType[workoutType];
    }
    // Fall back to general quotes if no specific quotes for this workout type
    return quotesByType.general;
  };
  
  const quotes = getQuotesForType();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 8000); // Change quote every 8 seconds
    
    return () => clearInterval(interval);
  }, [quotes.length]);

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
            className="text-lg bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent"
            animate={{ 
              scale: [1, 1.02, 1],
              textShadow: ["0 0 0px rgba(124, 58, 237, 0)", "0 0 5px rgba(124, 58, 237, 0.5)", "0 0 0px rgba(124, 58, 237, 0)"]
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

export default QuoteDisplay;
