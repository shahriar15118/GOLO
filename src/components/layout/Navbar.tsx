import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'glass h-20 shadow-md' : 'bg-transparent h-24'
      }`}>
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center">
            <span className="font-display text-3xl font-bold tracking-[0.2em] text-gold">GOLO</span>
            <span className="text-[8px] uppercase tracking-[0.4em] opacity-60">Glamour & Luxury</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <Link to="/products" className="text-sm uppercase tracking-widest hover:text-gold transition-colors">Collection</Link>
            <Link to="/products?category=jewelry" className="text-sm uppercase tracking-widest hover:text-gold transition-colors">Jewelry</Link>
            <Link to="/products?category=bags" className="text-sm uppercase tracking-widest hover:text-gold transition-colors">Bags</Link>
            <Link to="/products?category=luxury" className="text-sm uppercase tracking-widest hover:text-gold transition-colors">Exclusives</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center border-b border-gold/30 focus-within:border-gold py-1">
              <input 
                type="text" 
                placeholder="Search luxury..." 
                className="bg-transparent outline-none text-xs w-32 focus:w-48 transition-all duration-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit"><Search size={16} className="text-gold" /></button>
            </form>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 hover:bg-gold/10 rounded-full transition-colors">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Account */}
            <Link to={user ? "/account" : "/auth/login"} className="p-2 hover:bg-gold/10 rounded-full transition-colors">
              <User size={20} />
            </Link>

            {/* Wishlist */}
            <Link to="/account/wishlist" className="p-2 hover:bg-gold/10 rounded-full transition-colors hidden sm:block">
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <button 
              onClick={() => setCartOpen(true)}
              className="p-2 hover:bg-gold/10 rounded-full transition-colors relative"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-obsidian text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Announcements */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gold text-obsidian text-[10px] py-1 text-center font-bold tracking-[0.2em] overflow-hidden">
        <div className="marquee">
          FREE WORLDWIDE SHIPPING ON ORDERS OVER ৳5000 • NEW ARRIVALS: THE ELEGANCE COLLECTION • JOIN GOLO CLUB FOR 10% OFF
        </div>
      </div>

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
              <Link onClick={() => setMobileMenuOpen(false)} to="/products?category=clothing">Clothing</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/products?category=jewelry">Jewelry</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/products?category=bags">Bags</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/account">My Account</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/account/wishlist">Wishlist</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
