
import React from 'react';
import { motion } from 'framer-motion';

interface WorkoutEquipmentProps {
  equipment: string[];
}

const WorkoutEquipment: React.FC<WorkoutEquipmentProps> = ({ equipment }) => {
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold mb-2">Equipment Needed</h3>
      <ul className="list-disc pl-5 space-y-1">
        {(equipment || []).map((item: string, index: number) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
            className="text-gray-700"
          >
            {item}
          </motion.li>
        ))}
        {(!equipment || equipment.length === 0) && (
          <li className="text-gray-400 italic text-sm">No special equipment listed.</li>
        )}
      </ul>
    </motion.div>
  );
};

export default WorkoutEquipment;
