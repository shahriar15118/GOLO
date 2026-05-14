import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';

interface Message {
  role: 'user' | 'assistant';
  message: string;
  created_at?: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sid = localStorage.getItem('golo_chat_session');
    if (!sid) {
      sid = `golo-session-${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('golo_chat_session', sid);
    }
    setSessionId(sid);
    
    // Fetch initial history if needed
    const fetchHistory = async () => {
        try {
            const res = await api.get(`/chat/history/${sid}`);
            setHistory(res.data.history);
        } catch (err) {
            console.error(err);
        }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = message;
    setMessage('');
    setHistory(prev => [...prev, { role: 'user', message: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/chat/message', { sessionId, message: userMsg });
      setHistory(prev => [...prev, { role: 'assistant', message: res.data.response }]);
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'assistant', message: "My apologies, I am experiencing a brief moment of reflection. Please allow me a moment to regain my composure." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 bg-gold text-obsidian rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform relative group"
          >
            <MessageSquare size={28} />
            <span className="absolute -top-12 right-0 bg-obsidian text-gold text-[10px] px-4 py-2 uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gold/40">
                Luxury Concierge
            </span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="w-96 h-[550px] glass overflow-hidden rounded-t-3xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-obsidian p-6 flex justify-between items-center border-b border-gold/30">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gold rounded-full flex items-center justify-center text-obsidian">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="font-display text-lg text-gold leading-none">Luxury Concierge</h3>
                    <span className="text-[8px] uppercase tracking-[0.3em] text-ivory/40">GOLO Private Assistant</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button onClick={() => setIsOpen(false)} className="text-ivory/60 hover:text-gold"><Minus size={20} /></button>
                <button onClick={() => setIsOpen(false)} className="text-ivory/60 hover:text-rose"><X size={20} /></button>
              </div>
            </div>

            {/* Chat Body */}
            <div 
                ref={scrollRef}
                className="flex-grow p-6 overflow-y-auto space-y-6 scroll-smooth bg-ivory/30 dark:bg-obsidian/30"
            >
              {history.length === 0 && (
                <div className="text-center py-10 space-y-4">
                    <p className="font-display text-xl italic opacity-60">"Good day. How may I elevate your luxury shopping experience today?"</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {['Royal Collection', 'Order Tracking', 'Bespoke Gifts'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setMessage(t)}
                                className="text-[8px] uppercase tracking-widest border border-gold/30 px-3 py-1 hover:bg-gold hover:text-obsidian transition-colors"
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
              )}

              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gold text-obsidian rounded-l-2xl rounded-tr-2xl font-bold' 
                      : 'bg-obsidian text-ivory rounded-r-2xl rounded-tl-2xl italic font-display text-sm'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-obsidian text-gold p-4 rounded-r-2xl rounded-tl-2xl flex space-x-1">
                    <div className="w-1 h-1 bg-gold rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-gold rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-gold rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Input */}
            <form onSubmit={handleSend} className="p-4 bg-obsidian border-t border-gold/30 flex items-center space-x-3">
              <input 
                type="text" 
                placeholder="Compose your inquiry..." 
                className="flex-grow bg-transparent text-xs text-ivory outline-none italic"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit" className="text-gold transition-transform hover:scale-110">
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
