import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { Send, User, Bot, Check, Clock, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminSupport = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(true);
    const [msgsLoading, setMsgsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await api.get('/support/admin/tickets');
            setTickets(res.data.tickets || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (ticketId: number) => {
        try {
            setMsgsLoading(true);
            const res = await api.get(`/support/admin/tickets/${ticketId}`);
            setMessages(res.data.messages || []);
        } catch (err) {
            console.error(err);
        } finally {
            setMsgsLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, []);
    
    useEffect(() => {
        if (selectedTicket) {
            fetchMessages(selectedTicket.id);
            // Polling for real-time feel
            const interval = setInterval(() => fetchMessages(selectedTicket.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedTicket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || !selectedTicket) return;
        
        const content = reply;
        setReply('');
        
        try {
            await api.post('/support/admin/reply', {
                ticketId: selectedTicket.id,
                message: content
            });
            fetchMessages(selectedTicket.id);
        } catch (err) {
            alert('Failed to send response');
            setReply(content);
        }
    };

    const updateStatus = async (status: string) => {
        if (!selectedTicket) return;
        try {
            await api.patch(`/support/admin/tickets/${selectedTicket.id}/status`, { status });
            setSelectedTicket({...selectedTicket, status});
            fetchTickets();
        } catch (err) { alert('Status update failed'); }
    };

    return (
        <div className="h-[75vh] flex overflow-hidden glass border border-gold/10 rounded-[2.5rem] bg-white dark:bg-obsidian/40 shadow-2xl">
            {/* Sidebar: Ticket List */}
            <div className="w-1/3 border-r border-gold/10 flex flex-col bg-white/50 dark:bg-black/20">
                <div className="p-8 border-b border-gold/10">
                    <h2 className="font-display text-2xl italic mb-2">Support Liaison</h2>
                    <p className="text-[8px] uppercase tracking-widest opacity-40">Client communication channels</p>
                </div>
                
                <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {loading ? (
                        <div className="py-20 text-center animate-pulse text-[10px] uppercase tracking-widest opacity-40">Syncing channels...</div>
                    ) : tickets.length === 0 ? (
                        <div className="py-20 text-center opacity-40 italic text-sm">No active support transmissions.</div>
                    ) : (
                        tickets.map(t => (
                            <button 
                                key={t.id}
                                onClick={() => setSelectedTicket(t)}
                                className={`w-full text-left p-6 rounded-2xl transition-all border flex gap-4 ${
                                    selectedTicket?.id === t.id 
                                    ? 'bg-gold border-gold text-obsidian shadow-lg' 
                                    : 'border-gold/5 bg-gold/5 hover:bg-gold/10 text-obsidian dark:text-ivory'
                                }`}
                            >
                                <div className="h-12 w-12 rounded-full border border-current/20 flex-shrink-0 flex items-center justify-center overflow-hidden bg-current/5">
                                    {t.users?.avatar_url ? (
                                        <img src={t.users.avatar_url} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <User size={20} />
                                    )}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-display text-lg truncate pr-2">{t.users?.full_name || 'Anonymous'}</h3>
                                        <span className={`text-[7px] uppercase font-bold px-1.5 py-0.5 rounded-full border border-current/30`}>
                                            {t.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] opacity-60 truncate italic">{t.users?.email}</p>
                                    <p className="text-[8px] opacity-40 mt-1 font-mono">{new Date(t.last_message_at).toLocaleTimeString()}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow flex flex-col relative bg-ivory/30 dark:bg-transparent">
                {selectedTicket ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-8 border-b border-gold/10 flex justify-between items-center bg-white dark:bg-black/10">
                            <div className="flex items-center space-x-4">
                                <div className="h-10 w-10 border border-gold/20 rounded-full flex items-center justify-center font-display bg-gold/5 italic text-gold">
                                    {selectedTicket.users?.full_name?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-display text-xl leading-none">{selectedTicket.users?.full_name}</h3>
                                    <p className="text-[9px] uppercase tracking-widest opacity-40 mt-1">Ticket #{selectedTicket.id} &bull; {selectedTicket.status}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                {['open', 'pending', 'closed'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => updateStatus(s)}
                                        className={`px-3 py-1 text-[8px] uppercase font-bold rounded-full transition-all border ${selectedTicket.status === s ? 'bg-gold text-obsidian border-gold' : 'border-gold/20 opacity-40 hover:opacity-100'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Messages Feed */}
                        <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {messages.map((m, i) => (
                                    <motion.div 
                                        key={m.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex ${m.role === 'admin' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] flex gap-4 ${m.role === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`h-8 w-8 rounded-full border shrink-0 flex items-center justify-center ${
                                                m.role === 'admin' ? 'border-gold bg-gold text-obsidian' : 
                                                m.role === 'ai' ? 'border-blue-400 bg-blue-400/10 text-blue-400' : 
                                                'border-gold/20 bg-gold/5 text-gold'
                                            }`}>
                                                {m.role === 'admin' ? <UserCheck size={14} /> : 
                                                 m.role === 'ai' ? <Bot size={14} /> : 
                                                 <User size={14} />}
                                            </div>
                                            <div>
                                                <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-sm ${
                                                    m.role === 'admin' ? 'bg-gold text-obsidian rounded-tr-none' : 
                                                    m.role === 'ai' ? 'bg-blue-400/5 border border-blue-400/10 text-blue-400 italic rounded-tl-none font-serif' : 
                                                    'bg-white dark:bg-gold/10 border border-gold/10 text-obsidian dark:text-ivory rounded-tl-none'
                                                }`}>
                                                    {m.message}
                                                </div>
                                                <div className={`flex items-center mt-2 px-2 gap-2 ${m.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                    <span className="text-[8px] uppercase tracking-widest opacity-30 font-bold">{new Date(m.created_at).toLocaleTimeString()}</span>
                                                    {m.role === 'admin' && <Check size={8} className="text-gold" />}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-8 border-t border-gold/10 bg-white dark:bg-black/10 space-y-4">
                            <div className="flex gap-4 items-end">
                                <div className="flex-grow relative">
                                    <textarea 
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        placeholder="Compose your diplomatic response..."
                                        className="w-full bg-ivory/50 dark:bg-white/5 border border-gold/20 dark:border-white/10 rounded-3xl p-5 pr-16 outline-none focus:border-gold transition-colors text-sm italic resize-none"
                                        rows={2}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend(e);
                                            }
                                        }}
                                    />
                                    <button 
                                        type="submit"
                                        className="absolute right-4 bottom-4 p-3 bg-gold text-obsidian rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[8px] uppercase tracking-widest opacity-30 text-center italic">Response will be tagged as 'Official Console Authority'</p>
                        </form>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 space-y-6">
                        <div className="p-12 border-2 border-dashed border-gold rounded-full">
                            <MessageSquare size={80} />
                        </div>
                        <div className="text-center">
                            <h3 className="font-display text-4xl mb-2">Console Silence</h3>
                            <p className="text-[10px] uppercase tracking-[0.5em] font-bold">Select a communication channel to begin liaison</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MessageSquare = ({ size }: { size?: number }) => (
    <svg 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);
