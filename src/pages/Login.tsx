import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signInWithSocial } = useAuth();
  const navigate = useNavigate();

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    setLoading(true);
    setError('');
    try {
        await signInWithSocial(provider);
        navigate('/account');
    } catch (err: any) {
        setError('Social identity failed.');
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.accessToken);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/account');
    } catch (err: any) {
      setError(err.message || 'Identity verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none hidden lg:block">
        <span className="font-display text-[300px] leading-none">Login</span>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full glass p-10 border border-gold/30 relative z-10"
      >
        <div className="text-center mb-12">
            <h1 className="font-display text-4xl mb-4 italic">Welcome Back</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">Re-enter the world of GOLO</p>
        </div>

        {error && (
            <div className="bg-rose/10 border border-rose/30 text-rose text-xs p-4 mb-8 italic text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Email Address</label>
                <input 
                    type="email" 
                    required
                    className="w-full bg-transparent border-b border-gold/20 py-3 outline-none focus:border-gold transition-colors italic text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="space-y-2 relative">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Security Code</label>
                <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    className="w-full bg-transparent border-b border-gold/20 py-3 outline-none focus:border-gold transition-colors italic text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute bottom-3 right-0 text-gold/50 hover:text-gold transition-colors"
                >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-obsidian text-gold py-5 uppercase tracking-[0.4em] font-bold text-xs hover:bg-gold hover:text-obsidian transition-all flex items-center justify-center group disabled:opacity-50"
            >
                {loading ? "Verifying..." : (
                    <>
                        <span>Enter GOLO</span>
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </>
                )}
            </button>
        </form>

        <div className="mt-12 space-y-6">
            <div className="relative flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-gold/10"></div>
                <span className="relative z-10 bg-ivory dark:bg-obsidian px-4 text-[8px] uppercase tracking-widest opacity-40">Social Access</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <button onClick={() => handleSocialLogin('google')} className="border border-gold/20 p-4 hover:bg-gold/5 transition-all text-[8px] font-bold uppercase tracking-widest">Google</button>
                <button onClick={() => handleSocialLogin('facebook')} className="border border-gold/20 p-4 hover:bg-gold/5 transition-all text-[8px] font-bold uppercase tracking-widest">Facebook</button>
                <button onClick={() => handleSocialLogin('twitter')} className="border border-gold/20 p-4 hover:bg-gold/5 transition-all text-[8px] font-bold uppercase tracking-widest">X / Twitter</button>
            </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gold/10 text-center space-y-4">
            <p className="text-[10px] uppercase tracking-widest opacity-40">New to our circle?</p>
            <Link to="/auth/register" className="text-xs uppercase tracking-widest font-bold text-gold border-b border-gold pb-1 inline-block">
                Create Account
            </Link>
        </div>

        <div className="mt-12 flex justify-center text-gold/20">
            <ShieldCheck size={32} strokeWidth={1} />
        </div>
      </motion.div>
    </div>
  );
}
