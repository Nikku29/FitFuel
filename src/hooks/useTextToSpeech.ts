import { useState, useEffect, useCallback } from 'react';

export const useTextToSpeech = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            setIsSupported(true);
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                // Prefer a female voice or "Google US English" if available, else first available
                const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Female')) || voices[0];
                setVoice(preferredVoice);
            };

            window.speechSynthesis.onvoiceschanged = loadVoices;
            loadVoices();
        }
    }, []);

    const speak = useCallback((text: string, rate: number = 1.0, pitch: number = 1.0) => {
        if (!isSupported) return;

        // Cancel any current speaking
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (voice) utterance.voice = voice;
        utterance.rate = rate;
        utterance.pitch = pitch;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isSupported, voice]);

    const stop = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [isSupported]);

    return { speak, stop, isSpeaking, isSupported };
};
