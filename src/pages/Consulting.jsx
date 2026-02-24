import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Wrench, Loader2, MessageSquare, Zap, Shield, Search } from 'lucide-react';
import ChatMessage from '../components/consulting/ChatMessage';

const STARTER_PROMPTS = [
    "My car makes a grinding noise when braking",
    "Engine warning light is on and car is losing power",
    "Car vibrates heavily at high speeds",
    "Air conditioning stopped blowing cold air",
    "Car won't start in the morning",
    "Steering wheel shakes when turning",
];

export default function Consulting() {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        initConversation();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const initConversation = async () => {
        setLoading(true);
        const conv = await base44.agents.createConversation({
            agent_name: 'parts_consultant',
            metadata: { name: 'Auto Parts Consultation' }
        });
        setConversation(conv);
        setLoading(false);

        const unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
            setMessages([...data.messages]);
        });
        return unsub;
    };

    const sendMessage = async (text) => {
        const msg = text || input.trim();
        if (!msg || sending || !conversation) return;
        setInput('');
        setSending(true);
        await base44.agents.addMessage(conversation, { role: 'user', content: msg });
        setSending(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const isTyping = messages.length > 0 && messages[messages.length - 1]?.role === 'user' && sending === false
        ? false
        : sending;

    const lastIsAssistant = messages.length > 0 && messages[messages.length - 1]?.role === 'assistant';
    const showTyping = sending && !lastIsAssistant;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col">

            {/* Header */}
            <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Wrench className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white">Auto Parts Consultant</h1>
                        <p className="text-sm text-slate-400">Describe your car problem — get part recommendations instantly</p>
                    </div>
                    <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-xs font-medium">Online</span>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col">

                {/* Empty state / starter */}
                {messages.length === 0 && !loading && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/30">
                            <MessageSquare className="w-10 h-10 text-black" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">What's wrong with your car?</h2>
                        <p className="text-slate-400 mb-8 max-w-md">Describe any symptom, sound, or issue and our AI mechanic will suggest the parts that may need replacing.</p>

                        <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
                            {STARTER_PROMPTS.map((prompt) => (
                                <button key={prompt} onClick={() => sendMessage(prompt)}
                                    className="px-4 py-2.5 bg-white/10 hover:bg-amber-500/20 border border-white/15 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 rounded-xl text-sm transition-all duration-200 text-left">
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-6 mt-10 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" />AI-powered diagnosis</span>
                            <span className="flex items-center gap-1.5"><Search className="w-3.5 h-3.5 text-amber-500" />Searches live inventory</span>
                            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-amber-500" />Expert recommendations</span>
                        </div>
                    </motion.div>
                )}

                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    </div>
                )}

                {/* Messages */}
                {messages.length > 0 && (
                    <div className="flex-1">
                        <AnimatePresence>
                            {messages.map((msg, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <ChatMessage message={msg} />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {showTyping && (
                            <div className="flex gap-3 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shrink-0 shadow-md">
                                    <Wrench className="w-4 h-4 text-black" />
                                </div>
                                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                    <div className="flex gap-1 items-center h-5">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <div className="border-t border-white/10 bg-black/30 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex gap-3 items-end">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your car problem... (e.g. 'My brakes squeak when stopping')"
                            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-slate-500 rounded-xl resize-none min-h-[52px] max-h-32 focus:bg-white/15 focus:border-amber-500/50"
                            rows={1}
                            disabled={sending || loading}
                        />
                        <Button onClick={() => sendMessage()} disabled={!input.trim() || sending || loading}
                            className="h-[52px] w-[52px] p-0 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-xl shadow-lg shadow-amber-500/25 shrink-0">
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
                </div>
            </div>
        </div>
    );
}