import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, Bell, LogOut, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

// Sub-components
const Profile = () => {
    const { user, login, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/users/profile', { full_name: name, phone });
            login({ ...user, full_name: name, phone }, localStorage.getItem('golo_token') || '');
            setIsEditing(false);
            alert('Identity updated successfully.');
        } catch (err) { alert('Update failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-12">
            <div className="flex items-center space-x-8 pb-12 border-b border-gold/10">
                <div className="h-24 w-24 bg-gold rounded-full flex items-center justify-center text-obsidian text-4xl font-display uppercase font-bold">
                    {user?.full_name.charAt(0)}
                </div>
                <div>
                    <h2 className="font-display text-4xl mb-2">{user?.full_name}</h2>
                    <p className="text-[10px] uppercase tracking-widest opacity-40 italic">{user?.email}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <section className="space-y-6">
                    <h3 className="text-[10px] uppercase font-bold tracking-widest opacity-40">Personal Chronicles</h3>
                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="space-y-6">
                             <div className="border-b border-gold/10 pb-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-50 block mb-1">Full Identity</label>
                                <input 
                                    className="bg-transparent outline-none w-full italic font-display text-lg"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div className="border-b border-gold/10 pb-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-50 block mb-1">Contact Signal</label>
                                <input 
                                    className="bg-transparent outline-none w-full italic font-display text-lg"
                                    placeholder="Add phone..."
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button type="submit" disabled={loading} className="text-[10px] uppercase tracking-widest font-bold text-gold border-b border-gold pb-1">{loading ? 'Saving...' : 'Preserve'}</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="text-[10px] uppercase tracking-widest font-bold opacity-40">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="border-b border-gold/10 pb-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-50 block mb-1">Full Identity</label>
                                <p className="text-sm font-display text-lg">{user?.full_name}</p>
                            </div>
                            <div className="border-b border-gold/10 pb-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-50 block mb-1">Electronic Mail</label>
                                <p className="text-sm font-display text-lg">{user?.email}</p>
                            </div>
                            <div className="border-b border-gold/10 pb-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-50 block mb-1">Contact Signal</label>
                                <p className="text-sm font-display text-lg">{user?.phone || 'Not provided'}</p>
                            </div>
                            <button onClick={() => setIsEditing(true)} className="text-[10px] uppercase tracking-widest font-bold text-gold border-b border-gold pb-1 mt-6">Edit Identity</button>
                        </div>
                    )}
                </section>

                <div className="flex flex-col justify-end">
                    <button 
                        onClick={logout}
                        className="flex items-center justify-center space-x-4 border border-rose/30 text-rose py-4 uppercase tracking-[0.3em] font-bold text-[10px] hover:bg-rose hover:text-white transition-all"
                    >
                        <LogOut size={16} />
                        <span>Revoke Access</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Account() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="h-screen flex items-center justify-center font-display text-4xl animate-pulse">GOLO</div>;
  if (!user) return <Navigate to="/auth/login" />;

  const tabs = [
    { name: 'Identity', path: '', icon: User },
    { name: 'Acquisitions', path: '/orders', icon: Package },
    { name: 'Desires', path: '/wishlist', icon: Heart },
    { name: 'Destinations', path: '/addresses', icon: MapPin },
    { name: 'Notices', path: '/notifications', icon: Bell },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-20">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-12">
            <div className="space-y-2">
                <h1 className="font-display text-4xl italic">Member Circle</h1>
                <p className="text-[10px] uppercase tracking-widest opacity-40">Since {new Date(user.created_at).getFullYear()}</p>
            </div>
            
            <nav className="flex flex-col space-y-4">
                {tabs.map((tab) => {
                    const isActive = location.pathname === `/account${tab.path}`;
                    return (
                        <Link 
                            key={tab.name} 
                            to={`/account${tab.path}`}
                            className={`flex items-center space-x-4 p-4 transition-all border ${
                                isActive ? 'bg-gold/5 border-gold text-gold' : 'border-gold/5 opacity-60 hover:opacity-100 hover:border-gold/20'
                            }`}
                        >
                            <tab.icon size={18} strokeWidth={1.5} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{tab.name}</span>
                            {isActive && <motion.div layoutId="tab-marker" className="flex-grow flex justify-end"><ChevronRight size={14} /></motion.div>}
                        </Link>
                    );
                })}
            </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3 min-h-[60vh] glass p-12 border border-gold/10">
            <Routes>
                <Route path="/" element={<Profile />} />
                <Route path="/orders" element={<div className="font-display text-2xl italic opacity-40 py-20 text-center">Your history is as clear as a diamond.</div>} />
                <Route path="/wishlist" element={<div className="font-display text-2xl italic opacity-40 py-20 text-center">Your desires are being archived.</div>} />
                <Route path="*" element={<Navigate to="/account" />} />
            </Routes>
        </div>
      </div>
    </div>
  );
}
