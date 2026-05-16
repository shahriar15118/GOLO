import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { X, Megaphone, CheckCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';

export const NoticeManager = () => {
    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any>(null);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/notices');
            setNotices(res.data.notices || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotices(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing.id) await api.put(`/admin/notices/${editing.id}`, editing);
            else await api.post(`/admin/notices`, editing);
            setEditing(null);
            fetchNotices();
        } catch (err) { alert('Operation failed'); }
    };

    const deleteNotice = async (id: number) => {
        if (!confirm('Permanent deletion requested. Proceed?')) return;
        try {
            await api.delete(`/admin/notices/${id}`);
            fetchNotices();
        } catch (err) { alert('Deletion failed'); }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-emerald-500" />;
            case 'warning': return <AlertTriangle className="text-gold" />;
            case 'error': return <AlertTriangle className="text-rose-500" />;
            default: return <Info className="text-blue-400" />;
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-center">
                <h2 className="font-display text-4xl italic">Maison Decrees</h2>
                <button 
                    onClick={() => setEditing({ title: '', content: '', type: 'info', is_active: 1 })}
                    className="bg-gold text-obsidian px-6 py-2 text-[10px] uppercase font-bold tracking-widest rounded-full"
                >
                    + Issue New Notice
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 text-center opacity-40 animate-pulse text-[10px] uppercase tracking-widest">Retrieving public decrees...</div>
                ) : notices.length === 0 ? (
                    <div className="py-20 text-center opacity-40 italic">No formal notices currently active.</div>
                ) : (
                    notices.map(n => (
                        <div key={n.id} className="glass p-8 rounded-2xl border border-gold/10 flex items-center justify-between gap-8 bg-white dark:bg-gold/5 shadow-sm">
                            <div className="flex items-center space-x-6">
                                <div className="p-4 bg-gold/10 rounded-2xl">
                                    {getIcon(n.type)}
                                </div>
                                <div>
                                    <h3 className="font-display text-2xl mb-1">{n.title}</h3>
                                    <p className="text-xs opacity-60 line-clamp-1 italic">{n.content}</p>
                                    <div className="flex items-center space-x-4 mt-3">
                                        <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full ${n.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {n.is_active ? 'Active' : 'Archived'}
                                        </span>
                                        <span className="text-[8px] uppercase tracking-widest opacity-40 italic">{new Date(n.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button onClick={() => setEditing(n)} className="text-[10px] uppercase font-bold tracking-widest px-4 py-2 hover:text-gold">Edit</button>
                                <button onClick={() => deleteNotice(n.id)} className="text-[10px] uppercase font-bold tracking-widest px-4 py-2 hover:text-rose-500"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {editing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/90 backdrop-blur-md p-4">
                    <form onSubmit={handleSave} className="glass p-12 border border-gold/20 max-w-xl w-full space-y-8 rounded-3xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center">
                            <h3 className="font-display text-3xl italic">Notice Refinement</h3>
                            <button type="button" onClick={() => setEditing(null)} className="p-2 opacity-40 hover:opacity-100 transition-opacity"><X size={20} /></button>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-40">Headline</label>
                                <input 
                                    className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" 
                                    value={editing.title} 
                                    onChange={e => setEditing({...editing, title: e.target.value})}
                                    placeholder="Enter authoritative headline..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-40">Classification</label>
                                <div className="flex space-x-4">
                                    {['info', 'warning', 'success', 'error'].map(t => (
                                        <button 
                                            key={t}
                                            type="button"
                                            onClick={() => setEditing({...editing, type: t})}
                                            className={`text-[9px] uppercase tracking-widest font-bold px-4 py-2 rounded-full transition-all border ${editing.type === t ? 'bg-gold text-obsidian border-gold' : 'border-gold/20 opacity-40'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-40">Content Body</label>
                                <textarea 
                                    className="bg-transparent border border-gold/20 w-full outline-none p-4 italic text-sm rounded-2xl h-32" 
                                    value={editing.content} 
                                    onChange={e => setEditing({...editing, content: e.target.value})}
                                    placeholder="State the formal decree here..."
                                />
                            </div>

                            <div className="flex items-center space-x-3">
                                <input 
                                    type="checkbox" 
                                    id="active"
                                    checked={editing.is_active === 1}
                                    onChange={e => setEditing({...editing, is_active: e.target.checked ? 1 : 0})}
                                    className="accent-gold"
                                />
                                <label htmlFor="active" className="text-[10px] uppercase font-bold tracking-widest opacity-60">Pubic Visibility</label>
                            </div>
                        </div>

                        <button className="w-full bg-gold text-obsidian py-4 uppercase font-bold tracking-[0.3em] text-[10px] rounded-full shadow-2xl shadow-gold/20">
                            Broadcast to Collection
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
