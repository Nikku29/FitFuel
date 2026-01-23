import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const QUOTES = [
    "Building your perfect week...",
    "Analyzing your recovery needs...",
    "Optimizing for maximum gains...",
    "Finalizing rep ranges...",
    "Scheduling rest days...",
    "Calibrating intensity levels...",
    "Reviewing biomechanics..."
];

interface QuoteLoaderProps {
    message?: string;
}

const QuoteLoader: React.FC<QuoteLoaderProps> = ({ message }) => {
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 h-64">
            <div className="relative">
                <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <Loader2 className="h-12 w-12 text-purple-600 animate-spin relative z-10" />
            </div>

            <div className="text-center space-y-2 max-w-md">
                <h3 className="text-lg font-semibold text-gray-800">
                    {message || "Designing Your Protocol"}
                </h3>

                <div className="h-8 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={quoteIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="text-purple-600 font-medium italic absolute w-full"
                        >
                            "{QUOTES[quoteIndex]}"
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default QuoteLoader;
