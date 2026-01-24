import { useState, useEffect, useCallback, useRef } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface UseVoiceCommandProps {
    onCommand: (command: string) => void;
    isActive: boolean;
}

export const useVoiceCommand = ({ onCommand, isActive }: UseVoiceCommandProps) => {
    const [isListening, setIsListening] = useState(false);
    const [lastCommand, setLastCommand] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Initialize Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                const lastResult = event.results[event.results.length - 1];
                const command = lastResult[0].transcript.trim().toLowerCase();

                console.log('Voice Command Heard:', command);
                setLastCommand(command);
                processCommand(command);
            };

            recognition.onerror = (event: any) => {
                console.warn('Voice Recognition Error:', event.error);
                setError(event.error);
                // Don't stop listening on 'no-speech'
                if (event.error !== 'no-speech' && isActive) {
                    setIsListening(false);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
                // Auto-restart if it should be active
                if (isActive) {
                    // Slight delay to prevent aggressive looping
                    setTimeout(() => {
                        // if (isActive) recognition.start(); 
                    }, 500);
                }
            };

            recognitionRef.current = recognition;
        } else {
            console.warn('Web Speech API not supported in this browser.');
            setError('Not Supported');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    // Control Active State
    useEffect(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (isActive && !isListening) {
            try {
                recognition.start();
                setIsListening(true);
                setError(null);
            } catch (e) {
                // Usually "already started" error
                console.log("Recognition start suppressed", e);
            }
        } else if (!isActive && isListening) {
            recognition.stop();
            setIsListening(false);
        }
    }, [isActive, isListening]);

    const processCommand = (transcript: string) => {
        // Simple fuzzy matching
        if (transcript.includes('next') || transcript.includes('skip') || transcript.includes('done')) {
            onCommand('NEXT');
        } else if (transcript.includes('pause') || transcript.includes('stop') || transcript.includes('wait')) {
            onCommand('PAUSE');
        } else if (transcript.includes('resume') || transcript.includes('start') || transcript.includes('go')) {
            onCommand('RESUME');
        } else if (transcript.includes('explain') || transcript.includes('how') || transcript.includes('instructions')) {
            onCommand('EXPLAIN');
        }
    };

    return {
        isListening,
        lastCommand,
        error
    };
};
