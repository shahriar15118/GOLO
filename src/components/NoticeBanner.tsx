import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Megaphone, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NoticeBanner() {
    const [notices, setNotices] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const fetchNotices = async () => {
        try {
            const res = await api.get('/notices');
            setNotices(res.data.notices || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotices();
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % (notices.length || 1));
        }, 8000);
        return () => clearInterval(interval);
    }, [notices.length]);

    if (notices.length === 0 || !isVisible) return null;

    const notice = notices[currentIndex];

    const getColors = (type: string) => {
        switch (type) {
            case 'success': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'warning': return 'bg-gold/10 text-gold border-gold/20';
            case 'error': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default: return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={14} />;
            case 'warning': return <AlertTriangle size={14} />;
            case 'error': return <AlertTriangle size={14} />;
            default: return <Info size={14} />;
        }
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                exit={{ y: -100 }}
                className="fixed top-[100px] left-0 w-full z-[80] px-6"
            >
                <div className={`max-w-4xl mx-auto glass backdrop-blur-2xl border flex items-center justify-between p-4 rounded-full shadow-2xl ${getColors(notice?.type)}`}>
                    <div className="flex items-center space-x-4 pl-2 overflow-hidden">
                        <div className="flex-shrink-0 animate-pulse">
                            {getIcon(notice?.type)}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-[10px] sm:text-xs font-bold truncate">
                                <span className="uppercase tracking-widest mr-2 opacity-60">Decree:</span>
                                <span className="italic font-display text-base tracking-tight">{notice?.title}</span>
                                <span className="mx-3 opacity-20">|</span>
                                <span className="opacity-80 italic font-medium">{notice?.content}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 pr-1">
                        <span className="text-[8px] uppercase font-bold tracking-[0.3em] opacity-40 hidden sm:block">Official Broadcast</span>
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
