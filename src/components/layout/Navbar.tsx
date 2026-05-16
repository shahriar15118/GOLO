import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Heart, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user } = useAuth();
  const { totalItems, setCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const getTextColor = (baseOpacity = 'opacity-100') => {
    if (isScrolled) return `text-obsidian dark:text-ivory ${baseOpacity}`;
    if (isHomePage) return `text-ivory ${baseOpacity}`;
    return `text-obsidian dark:text-ivory ${baseOpacity}`;
  };

  return (
    <>
      {/* Announcements */}
      <div className="absolute top-0 left-0 right-0 h-7 z-[60] bg-gold text-obsidian text-[10px] flex items-center font-bold tracking-[0.4em] border-b border-obsidian/5 uppercase overflow-hidden">
        <div className="marquee-content whitespace-nowrap">
          <span className="mx-12">Complimentary worldwide delivery on all curated acquisitions</span>
          <span className="mx-12">The Autumn Éclat Collection has arrived</span>
          <span className="mx-12">Exclusive 15% reduction for Maison members</span>
          <span className="mx-12">Complimentary worldwide delivery on all curated acquisitions</span>
        </div>
      </div>

      <nav className={`fixed left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled 
          ? 'bg-ivory/95 dark:bg-obsidian/95 backdrop-blur-md h-16 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-2xl top-0 border-b border-gold/10' 
          : `h-24 top-7 ${isHomePage ? 'bg-transparent' : 'bg-ivory/95 dark:bg-obsidian/95 border-b border-gold/10'}`
      }`}>
        <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group relative flex flex-col items-center">
            <span className={`font-display text-3xl lg:text-4xl font-light tracking-[0.3em] transition-colors group-hover:text-gold italic ${
                isScrolled ? 'text-obsidian dark:text-ivory' : (isHomePage ? 'text-ivory dark:text-ivory' : 'text-obsidian dark:text-ivory')
            }`}>GOLO</span>
            <div className="h-[0.5px] w-0 group-hover:w-full bg-gold transition-all duration-700 -mt-0.5" />
            <span className={`text-[6px] uppercase tracking-[0.8em] mt-0.5 font-bold group-hover:opacity-100 transition-all whitespace-nowrap ${
                isScrolled ? 'opacity-40 text-obsidian dark:text-ivory' : (isHomePage ? 'opacity-60 text-ivory dark:text-ivory' : 'opacity-40 text-obsidian dark:text-ivory')
            }`}>Private Collection</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-12">
            {[
              { name: 'Collections', path: '/products' },
              { name: 'Jewelry', path: '/products?category=jewelry' },
              { name: 'Bags', path: '/products?category=bags' },
              { name: 'The Maison', path: '/about' }
            ].map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`text-[9px] uppercase font-bold tracking-[0.4em] relative group py-1 transition-colors ${
                    isScrolled ? 'text-obsidian dark:text-ivory' : (isHomePage ? 'text-ivory dark:text-ivory' : 'text-obsidian dark:text-ivory')
                }`}
              >
                <span className="relative z-10 group-hover:text-gold transition-colors">{item.name}</span>
                <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className={`flex items-center space-x-2 lg:space-x-6 transition-colors ${
            isScrolled ? 'text-obsidian dark:text-ivory' : (isHomePage ? 'text-ivory dark:text-ivory' : 'text-obsidian dark:text-ivory')
          }`}>
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden xl:flex items-center border-b border-gold/30 focus-within:border-gold py-1">
              <input 
                type="text" 
                placeholder="Search luxury..." 
                className="bg-transparent outline-none text-[10px] w-20 focus:w-32 transition-all duration-500 font-medium placeholder:opacity-40 whitespace-nowrap"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="group"><Search size={12} className="opacity-60 group-hover:opacity-100 transition-colors" /></button>
            </form>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 hover:text-gold transition-colors relative group">
              {theme === 'light' ? <Moon size={16} strokeWidth={1.5} /> : <Sun size={16} strokeWidth={1.5} />}
              <div className="absolute -inset-1 bg-gold/5 rounded-full scale-0 group-hover:scale-100 transition-transform" />
            </button>

            {/* Account */}
            <div className="flex items-center">
              {user?.role === 'admin' && (
                <Link to="/admin" className="hidden lg:flex items-center px-4 py-1.5 border border-gold/30 rounded-full hover:bg-gold hover:text-obsidian transition-all group overflow-hidden relative mr-4">
                  <span className="relative z-10 text-[8px] font-bold uppercase tracking-[0.1em]">Command Panel</span>
                  <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>
              )}
              <Link to={user ? "/account" : "/auth/login"} className="p-2 hover:text-gold transition-colors relative group">
                <User size={16} strokeWidth={1.5} />
                <div className="absolute -inset-1 bg-gold/5 rounded-full scale-0 group-hover:scale-100 transition-transform" />
              </Link>
            </div>

            {/* Cart */}
            <button 
              onClick={() => setCartOpen(true)}
              className="p-2 hover:text-gold transition-colors relative group"
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-gold text-obsidian text-[7px] font-black h-3.5 w-3.5 rounded-full flex items-center justify-center border-[0.5px] border-obsidian">
                  {totalItems}
                </span>
              )}
              <div className="absolute -inset-1 bg-gold/5 rounded-full scale-0 group-hover:scale-100 transition-transform" />
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>


      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-[100] glass flex flex-col p-10"
          >
            <button onClick={() => setMobileMenuOpen(false)} className="self-end mb-10"><X size={32} /></button>
            <div className="flex flex-col space-y-8 text-2xl font-display">
              <Link onClick={() => setMobileMenuOpen(false)} to="/products">All Collection</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/products?category=jewelry">Jewelry</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/products?category=bags">Bags</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/account">My Account</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
