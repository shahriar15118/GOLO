import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Send, User, Bot, HelpCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, Navigate } from 'react-router-dom';

export default function SupportPage() {
    const { user } = useAuth();
    const [ticket, setTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const res = await api.get('/support/my-ticket');
            setTicket(res.data.ticket);
            setMessages(res.data.messages || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTicket();
            const interval = setInterval(async () => {
                const res = await api.get('/support/my-ticket');
                if (res.data.messages.length > messages.length) {
                    setMessages(res.data.messages);
                }
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!user) return <Navigate to="/auth/login" />;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !ticket || sending) return;

        const content = input;
        setInput('');
        setSending(true);

        // Optimistic update
        setMessages(prev => [...prev, { role: 'user', message: content, created_at: new Date().toISOString() }]);

        try {
            const res = await api.post('/support/message', {
                ticketId: ticket.id,
                message: content
            });
            // Update with AI response
            setMessages(prev => [...prev, { 
                role: 'ai', 
                message: res.data.aiResponse, 
                created_at: new Date().toISOString() 
            }]);
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-ivory dark:bg-obsidian pt-32 pb-20 transition-colors duration-500 relative overflow-hidden">
            {/* Background Texture */}
            <div className="fixed inset-0 grain-overlay z-[100] pointer-events-none opacity-[0.03]" />
            <div className="absolute top-0 right-0 w-1/2 h-screen bg-gold/5 blur-[120px] rounded-full -mr-[25%] -z-10" />
            
            <div className="max-w-4xl mx-auto px-6 space-y-12 relative z-10">
                <div className="flex flex-col items-center text-center space-y-6">
                    <Link to="/" className="p-3 border border-gold/20 rounded-full hover:bg-gold hover:text-obsidian transition-all group">
                        <ArrowLeft size={16} />
                    </Link>
                    <div className="space-y-2">
                        <h1 className="font-display text-5xl lg:text-7xl italic">Concierge Liaison</h1>
                        <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">Priority Support for GOLO PRIVE Members</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-4">
                        <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        <div className="animate-pulse text-[10px] uppercase tracking-widest opacity-40">Connecting to Concierge Desk...</div>
                    </div>
                ) : (
                    <div className="glass h-[600px] flex flex-col border border-gold/10 rounded-[2.5rem] bg-white/50 dark:bg-gold/5 shadow-2xl backdrop-blur-md overflow-hidden">
                        {/* Header */}
                        <div className="p-8 border-b border-gold/10 flex justify-between items-center bg-white/30 dark:bg-transparent">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 bg-gold/10 rounded-full flex items-center justify-center text-gold border border-gold/20">
                                    <HelpCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-display text-2xl leading-none">Diplomatic Support</h3>
                                    <p className="text-[8px] uppercase tracking-widest opacity-40 mt-1">Ticket #{ticket.id} &bull; Status: {ticket.status}</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center space-x-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[8px] uppercase tracking-widest font-bold opacity-60">System Online</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                                    <MessageCircle size={48} strokeWidth={1} />
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold max-w-xs">
                                        Tell us your problem, and our AI Concierge will provide an immediate solution.
                                    </p>
                                </div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    {messages.map((m, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] sm:max-w-[70%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`h-8 w-8 rounded-full border shrink-0 flex items-center justify-center ${
                                                    m.role === 'user' ? 'border-gold/20 bg-gold/5 text-gold' : 
                                                    m.role === 'ai' ? 'border-blue-400 bg-blue-400/5 text-blue-400' : 
                                                    'border-gold bg-gold text-obsidian'
                                                }`}>
                                                    {m.role === 'user' ? <User size={14} /> : 
                                                     m.role === 'ai' ? <Bot size={14} /> : 
                                                     <User size={14} />}
                                                </div>
                                                <div className={`space-y-1 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                                                    <div className={`p-5 rounded-[2rem] text-sm leading-relaxed ${
                                                        m.role === 'user' ? 'bg-gold/10 border border-gold/10 text-obsidian dark:text-ivory rounded-tr-none' : 
                                                        m.role === 'ai' ? 'bg-blue-400/5 border border-blue-400/10 text-blue-400 italic rounded-tl-none font-serif' : 
                                                        'bg-gold text-obsidian rounded-tl-none font-bold'
                                                    }`}>
                                                        {m.message}
                                                    </div>
                                                    <p className="text-[7px] uppercase tracking-widest opacity-30 font-bold px-2">
                                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-8 border-t border-gold/10 bg-white/30 dark:bg-transparent">
                            <div className="relative flex items-center gap-4">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Explain your case to the Concierge..."
                                    className="w-full bg-ivory/50 dark:bg-white/5 border border-gold/20 dark:border-white/10 rounded-[2rem] p-5 pr-16 outline-none focus:border-gold transition-all text-sm italic resize-none"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(e);
                                        }
                                    }}
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim() || sending}
                                    className="absolute right-3 p-3 bg-gold text-obsidian rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {[
                        { title: 'Privacy Promise', desc: 'Secure encryption' },
                        { title: 'Diplomatic Tone', desc: 'Sophisticated support' },
                        { title: 'Priority Access', desc: 'Reserved for members' }
                    ].map((item, i) => (
                        <div key={i} className="text-center space-y-2 p-6 glass border border-gold/10 rounded-3xl">
                            <h4 className="text-[9px] uppercase font-bold tracking-widest opacity-60">{item.title}</h4>
                            <p className="text-[8px] uppercase tracking-[0.2em] opacity-40 italic">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

