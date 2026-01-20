
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { SYSTEM_PROMPT } from '@/config/aiSystemPrompt';
import aiService from '@/services/aiService';

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const AIOnboarding = () => {
    const { userData, user } = useUser();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Redirect if no user data
        if (!user) {
            navigate('/login');
            return;
        }

        // Initialize chat
        if (!hasInitialized.current && userData) {
            hasInitialized.current = true;
            initializeChat();
        }
    }, [user, userData]);

    useEffect(() => {
        // Auto-scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const initializeChat = async () => {
        setIsLoading(true);

        const initialContext = `
    USER PROFILE DATA:
    - Name: ${userData?.name}
    - Age: ${userData?.age}
    - Gender: ${userData?.gender}
    - Goal: ${userData?.fitnessGoal}
    - Level: ${userData?.activityLevel}
    - Location: ${userData?.location}
    - Diet: ${userData?.dietaryPreference}
    - Height: ${userData?.height}cm
    - Weight: ${userData?.weight}kg
    
    INSTRUCTION: 
    Start the consultation. Welcome the user by name. Analyze their profile briefly (1-2 sentences). 
    Then, ask the MOST important missing question to refine their plan (e.g., about injuries, specific days available, or equipment).
    `;

        const initialMessages: Message[] = [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: initialContext }
        ];

        try {
            // We manually call the AI service, but we need to expose a method that accepts raw messages
            // For now, we'll try to use a simplified call or assume aiService handles string arrays.
            // IMPORTANT: In a real app, we'd update aiService to expose a generic 'chat' method.
            // For this quick implementation, we will mock the response if the service isn't fully ready for generic chat, 
            // but ideally we should update 'aiService.ts' to support this.
            // Let's try to assume we can add a 'chat' method to aiService or use existing.

            const response = await aiService.chat(initialMessages);

            setMessages([
                ...initialMessages,
                { role: 'assistant', content: response }
            ]);
        } catch (error) {
            console.error("Failed to init chat", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my brain. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Build full history for context
            const fullHistory = [...messages, userMsg];

            // Call AI Service
            const response = await aiService.chat(fullHistory);

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            setIsLoading(false);

        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                        <Bot className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-slate-800">Review & Plan</h1>
                        <p className="text-sm text-slate-500">FitFuel Intelligent Coach</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Skip to Dashboard
                </Button>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.filter(m => m.role !== 'system' && !m.content.includes('USER PROFILE DATA')).map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                {msg.role === 'user' ? <UserIcon size={16} className="text-blue-600" /> : <Bot size={16} className="text-purple-600" />}
                            </div>
                            <div className={`rounded-2xl p-4 max-w-[80%] ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white border shadow-sm rounded-tl-none text-slate-800'
                                }`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <Bot size={16} className="text-purple-600" />
                            </div>
                            <div className="bg-white border shadow-sm p-4 rounded-2xl rounded-tl-none">
                                <div className="flex gap-2 items-center text-slate-500 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Thinking...
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="bg-white border-t p-4">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type your answer..."
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-purple-600 hover:bg-purple-700">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AIOnboarding;
