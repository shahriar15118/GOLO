import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-obsidian text-ivory pt-20 pb-10 border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-6">
          <Link to="/" className="flex flex-col">
            <span className="font-display text-4xl font-bold tracking-[0.2em] text-gold">GOLO</span>
            <span className="text-[10px] uppercase tracking-[0.4em] opacity-60">Glamorous Outfit & Luxurious Outlook</span>
          </Link>
          <p className="text-sm opacity-60 leading-relaxed italic font-display">
            "Redefining the essence of elegance and providing a home for the sophisticated soul."
          </p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-gold transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-gold transition-colors"><Facebook size={20} /></a>
            <a href="#" className="hover:text-gold transition-colors"><Twitter size={20} /></a>
            <a href="#" className="hover:text-gold transition-colors"><Youtube size={20} /></a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="space-y-6">
          <h4 className="font-display text-lg uppercase tracking-widest text-gold">Collection</h4>
          <ul className="space-y-3 text-sm opacity-70">
            <li><Link to="/products" className="hover:text-gold transition-colors">Shop All</Link></li>
            <li><Link to="/products?category=clothing" className="hover:text-gold transition-colors">Women's Fashion</Link></li>
            <li><Link to="/products?category=jewelry" className="hover:text-gold transition-colors">Fine Jewelry</Link></li>
            <li><Link to="/products?category=luxury" className="hover:text-gold transition-colors">Limited Edition</Link></li>
            <li><Link to="/products?category=perfumes" className="hover:text-gold transition-colors">Signature Fragrances</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="space-y-6">
          <h4 className="font-display text-lg uppercase tracking-widest text-gold">Concierge</h4>
          <ul className="space-y-3 text-sm opacity-70">
            <li><Link to="/account/orders" className="hover:text-gold transition-colors">Track Your Order</Link></li>
            <li><a href="#" className="hover:text-gold transition-colors">Bespoke Services</a></li>
            <li><a href="#" className="hover:text-gold transition-colors">Gifting Experience</a></li>
            <li><a href="#" className="hover:text-gold transition-colors">Care Instructions</a></li>
            <li><a href="#" className="hover:text-gold transition-colors">Privacy & Terms</a></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="space-y-6">
          <h4 className="font-display text-lg uppercase tracking-widest text-gold">The Insider</h4>
          <p className="text-sm opacity-60 italic">Join our world for exclusive previews and luxury insights.</p>
          <form className="flex border-b border-gold/50 py-2">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-transparent border-none outline-none text-sm w-full italic"
            />
            <button type="submit" className="text-gold"><Send size={18} /></button>
          </form>
          <div className="pt-4 flex space-x-4 opacity-40">
             <span className="text-[10px] tracking-widest">VISA</span>
             <span className="text-[10px] tracking-widest">MASTERCARD</span>
             <span className="text-[10px] tracking-widest">AMEX</span>
             <span className="text-[10px] tracking-widest">BKASH</span>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 mt-20 pt-10 border-t border-gold/10 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-[0.3em] uppercase opacity-40">
        <p>© 2026 GOLO LUXURY. All Rights Reserved.</p>
        <p>Curated by Artisan Souls</p>
      </div>
    </footer>
  );
}
