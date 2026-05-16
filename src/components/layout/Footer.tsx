import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-obsidian text-ivory pt-32 pb-16 border-t border-gold/20 relative overflow-hidden">
      {/* Decorative grain */}
      <div className="absolute inset-0 grain-overlay opacity-[0.02]" />
      
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 relative z-10">
        {/* Brand Column */}
        <div className="space-y-10">
          <Link to="/" className="flex flex-col group">
            <span className="font-display text-5xl font-light tracking-[0.3em] text-gold group-hover:scale-105 transition-transform origin-left italic">GOLO</span>
            <span className="text-[8px] uppercase tracking-[0.5em] opacity-40 mt-1">Private Collection</span>
          </Link>
          <p className="text-sm opacity-50 leading-relaxed italic font-display max-w-xs">
            "We do not merely sell objects; we curate the intersection of heritage craftsmanship and modern aspiration."
          </p>
          <div className="flex space-x-6">
            {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="text-gold/60 hover:text-gold transition-colors p-2 border border-gold/10 rounded-full hover:bg-gold/5"><Icon size={18} strokeWidth={1.5} /></a>
            ))}
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="space-y-10">
          <h4 className="font-display text-xl uppercase tracking-[0.3em] text-gold italic">Gallery</h4>
          <ul className="space-y-4 text-[10px] uppercase tracking-[0.2em] font-bold">
            <li><Link to="/products" className="opacity-50 hover:opacity-100 hover:text-gold transition-all">Full Collection</Link></li>
            <li><Link to="/products?category=jewelry" className="opacity-50 hover:opacity-100 hover:text-gold transition-all">Fine Jewelry</Link></li>
            <li><Link to="/products?category=bags" className="opacity-50 hover:opacity-100 hover:text-gold transition-all">Luxury Bags</Link></li>
            <li><Link to="/products?category=traditional" className="opacity-50 hover:opacity-100 hover:text-gold transition-all">Traditional Heritage</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="space-y-10">
          <h4 className="font-display text-xl uppercase tracking-[0.3em] text-gold italic">Concierge</h4>
          <ul className="space-y-4 text-[10px] uppercase tracking-[0.2em] font-bold">
            <li><Link to="/account/orders" className="opacity-50 hover:opacity-100 hover:text-gold transition-all">Order Tracking</Link></li>
            <li><Link to="/support" className="opacity-50 hover:opacity-100 hover:text-gold transition-all">Support Liaison</Link></li>
            <li><a href="#" className="opacity-50 hover:opacity-100 hover:text-gold transition-all">Aftercare Guide</a></li>
            <li><a href="#" className="opacity-50 hover:opacity-100 hover:text-gold transition-all">Maison Laws</a></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="space-y-10">
          <h4 className="font-display text-xl uppercase tracking-[0.3em] text-gold italic">Correspondence</h4>
          <p className="text-xs opacity-50 italic font-display">Enroll for exclusive previews and private auction alerts.</p>
          <form className="flex border-b border-gold/30 py-3 group focus-within:border-gold transition-colors">
            <input 
              type="email" 
              placeholder="Private Email..." 
              className="bg-transparent border-none outline-none text-xs w-full italic font-display placeholder:opacity-40"
            />
            <button type="submit" className="text-gold group-hover:translate-x-2 transition-transform"><Send size={18} strokeWidth={1.5} /></button>
          </form>
          <div className="pt-6 flex flex-wrap gap-4 opacity-20">
             {['VISA', 'AMEX', 'MASTERCARD', 'CRYPTO'].map(p => (
                 <span key={p} className="text-[7px] tracking-[0.5em] font-black border border-ivory/20 px-2 py-1 rounded-sm">{p}</span>
             ))}
          </div>
        </div>
      </div>
      
      <div className="max-w-[1400px] mx-auto px-6 mt-32 pt-12 border-t border-gold/10 flex flex-col md:flex-row justify-between items-center text-[8px] tracking-[0.5em] uppercase font-bold opacity-30">
        <p>© 2026 GOLO MAISON DE LUXE. All Rights Reserved.</p>
        <div className="flex space-x-12 mt-4 md:mt-0">
            <a href="#" className="hover:text-gold transition-colors">Privacy</a>
            <a href="#" className="hover:text-gold transition-colors">Etiquette</a>
            <a href="#" className="hover:text-gold transition-colors">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
