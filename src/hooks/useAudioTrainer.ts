import { useCallback, useEffect, useRef, useState } from 'react';

export const useAudioTrainer = (isMuted: boolean = false) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synth = window.speechSynthesis;
    const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

    // Initialize Voice (Prefer Google US English or comparable)
    useEffect(() => {
        const loadVoices = () => {
            const voices = synth.getVoices();
            // Try to find a good "Trainer" voice
            const trainerVoice = voices.find(v =>
                v.name.includes('Google US English') ||
                v.name.includes('Samantha') ||
                v.lang === 'en-US'
            );
            if (trainerVoice) voiceRef.current = trainerVoice;
        };

        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const speak = useCallback((text: string, rate: number = 1.0, priority: 'high' | 'normal' = 'normal') => {
        if (isMuted || !text) return;

        // Cancel pending if high priority (interrupt)
        if (priority === 'high') {
            synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        if (voiceRef.current) utterance.voice = voiceRef.current;
        utterance.rate = rate;
        utterance.pitch = 1.0;

        // Audio Ducking Logic
        utterance.onstart = () => {
            setIsSpeaking(true);
            // Lower music volume via custom event if we had a music player
            // window.dispatchEvent(new CustomEvent('AUDIO_DUCKING_START')); 
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            // window.dispatchEvent(new CustomEvent('AUDIO_DUCKING_END'));
        };

        utterance.onerror = (e) => {
            console.error('TTS Error:', e);
            setIsSpeaking(false);
        };

        synth.speak(utterance);
    }, [isMuted, synth]);

    const stop = useCallback(() => {
        synth.cancel();
        setIsSpeaking(false);
    }, [synth]);

    // Protocol Methods
    const protocols = {
        announceRest: (seconds: number, nextExercise: string, equipment?: string[]) => {
            const equipText = equipment && equipment.length > 0 && equipment[0] !== 'None'
                ? ` Grab your ${equipment[0]}.`
                : '';

            // "Rest for 30 seconds. Next up: Pushups. Grab your dumbells."
            speak(`Rest for ${seconds} seconds. Next up: ${nextExercise}.${equipText}`, 1.1);
        },

        announcePrep: (seconds: number) => {
            speak(`Get set. ${seconds > 3 ? 'Go to position' : ''}`, 1.2, 'high');
        },

        countDown: (num: number) => {
            speak(num.toString(), 1.3, 'high');
        },

        startWork: () => {
            speak("Work!", 1.5, 'high');
        },

        announceComplete: () => {
            speak("Workout complete. Great job!", 1.0);
        }
    };

    return {
        speak,
        stop,
        isSpeaking,
        protocols
    };
};
