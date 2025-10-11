
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getStrength = (): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '', color: 'bg-gray-200' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-orange-500' };
    
    // Check for complexity (uppercase, lowercase, numbers, special chars)
    let complexity = 0;
    if (/[A-Z]/.test(password)) complexity++;
    if (/[a-z]/.test(password)) complexity++;
    if (/[0-9]/.test(password)) complexity++;
    if (/[^A-Za-z0-9]/.test(password)) complexity++;
    
    if (complexity === 2) return { strength: 3, label: 'Good', color: 'bg-yellow-500' };
    if (complexity === 3) return { strength: 4, label: 'Strong', color: 'bg-green-500' };
    if (complexity >= 4) return { strength: 5, label: 'Very Strong', color: 'bg-green-600' };
    
    return { strength: 2, label: 'Fair', color: 'bg-orange-500' };
  };
  
  const { strength, label, color } = getStrength();
  
  return password ? (
    <div className="mt-1 space-y-1">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div 
          className={cn("transition-all", color)}
          initial={{ width: '0%' }}
          animate={{ width: `${(strength / 5) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className={cn(
        "text-xs",
        strength <= 1 ? "text-red-500" : 
        strength <= 2 ? "text-orange-500" :
        strength <= 3 ? "text-yellow-500" : "text-green-600"
      )}>
        {label}
      </p>
    </div>
  ) : null;
};

export default PasswordStrengthIndicator;
