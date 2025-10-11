
import React from 'react';
import { motion } from 'framer-motion';

interface WorkoutBenefitsProps {
  benefits: string[];
}

const WorkoutBenefits: React.FC<WorkoutBenefitsProps> = ({ benefits }) => {
  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold mb-2">Benefits</h3>
      <ul className="list-disc pl-5 space-y-1">
        {benefits.map((benefit: string, index: number) => (
          <motion.li 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
            className="text-gray-700"
          >
            {benefit}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default WorkoutBenefits;
