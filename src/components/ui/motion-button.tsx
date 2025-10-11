
import React, { forwardRef } from 'react';
import { motion, type TargetAndTransition, type VariantLabels } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';

type MotionButtonProps = ButtonProps & {
  whileHover?: VariantLabels | TargetAndTransition;
  whileTap?: VariantLabels | TargetAndTransition;
  animate?: VariantLabels | TargetAndTransition;
  transition?: any;
  initial?: any;
  variants?: any;
};

const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, whileHover, whileTap, animate, transition, initial, variants, ...props }, ref) => {
    return (
      <motion.div
        initial={initial}
        animate={animate}
        variants={variants}
        whileHover={whileHover || { scale: 1.05 }}
        whileTap={whileTap || { scale: 0.95 }}
        transition={transition || { type: 'spring', stiffness: 400, damping: 10 }}
        style={{ width: props.className?.includes('w-full') ? '100%' : 'auto' }}
      >
        <Button ref={ref} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

MotionButton.displayName = 'MotionButton';

export { MotionButton };
