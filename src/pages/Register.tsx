import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) return setError('Passwords do not match.');
    
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', formData);
      login(res.data.user, res.data.accessToken);
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 p-20 opacity-5 pointer-events-none hidden lg:block">
        <span className="font-display text-[300px] leading-none">Join</span>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full glass p-10 border border-gold/30 relative z-10"
      >
        <div className="text-center mb-12">
            <h1 className="font-display text-4xl mb-4 italic">Begin Your Journey</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">Join the exclusive world of GOLO</p>
        </div>

        {error && (
            <div className="bg-rose/10 border border-rose/30 text-rose text-xs p-4 mb-8 italic text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Full Name</label>
                <input 
                    type="text" 
                    required
                    className="w-full bg-transparent border-b border-gold/20 py-3 outline-none focus:border-gold transition-colors italic text-sm"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Email Address</label>
                <input 
                    type="email" 
                    required
                    className="w-full bg-transparent border-b border-gold/20 py-3 outline-none focus:border-gold transition-colors italic text-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Security Code</label>
                <input 
                    type="password" 
                    required
                    className="w-full bg-transparent border-b border-gold/20 py-3 outline-none focus:border-gold transition-colors italic text-sm"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Confirm Security Code</label>
                <input 
                    type="password" 
                    required
                    className="w-full bg-transparent border-b border-gold/20 py-3 outline-none focus:border-gold transition-colors italic text-sm"
                    value={formData.confirm}
                    onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
                />
            </div>

            <div className="flex items-center space-x-3 pt-4">
                <input type="checkbox" required className="accent-gold h-4 w-4" />
                <span className="text-[10px] uppercase tracking-widest opacity-40">I accept the terms of GOLO luxury</span>
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-obsidian text-gold py-5 uppercase tracking-[0.4em] font-bold text-xs hover:bg-gold hover:text-obsidian transition-all flex items-center justify-center group disabled:opacity-50"
            >
                {loading ? "Registering..." : (
                    <>
                        <span>Claim Membership</span>
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </>
                )}
            </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gold/10 text-center space-y-4">
            <p className="text-[10px] uppercase tracking-widest opacity-40">Already part of our world?</p>
            <Link to="/auth/login" className="text-xs uppercase tracking-widest font-bold text-gold border-b border-gold pb-1 inline-block">
                Sign In Instead
            </Link>
        </div>

        <div className="mt-12 flex justify-center text-gold/20">
            <ShieldCheck size={32} strokeWidth={1} />
        </div>
      </motion.div>
    </div>
  );
}
