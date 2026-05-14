import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import BannerCarousel from '../components/ui/BannerCarousel';
import ProductCard from '../components/products/ProductCard';
import { ArrowRight, Star, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, catsRes, featuredRes] = await Promise.all([
          api.get('/banners'),
          api.get('/products/categories'),
          api.get('/products/featured')
        ]);
        setBanners(bannersRes.data.banners);
        setCategories(catsRes.data.categories);
        setFeaturedProducts(featuredRes.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-display text-4xl animate-pulse">GOLO</div>;

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <BannerCarousel banners={banners} />

      {/* Marquee Promotion */}
      <div className="bg-obsidian border-y border-gold/30 py-4 overflow-hidden flex items-center">
        <div className="marquee-content whitespace-nowrap space-x-12">
            {[...Array(10)].map((_, i) => (
                <span key={i} className="text-gold text-[10px] font-bold uppercase tracking-[0.5em]">
                    Free Delivery Over ৳5000 • Traditional Collection Live • Use Code EID2026 For 15% Off • 100% Authentic Products • 7 Days Returns
                </span>
            ))}
        </div>
      </div>

      {/* Flash Sale Section */}
      <section className="bg-obsidian py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          {/* Animated decorative elements could go here */}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left space-y-6">
            <span className="text-rose font-bold uppercase tracking-[0.6em] text-xs">Exquisite Opportunity</span>
            <h2 className="font-display text-7xl text-ivory">Midnight Flash Sale</h2>
            <p className="text-ivory/60 italic font-display text-xl max-w-md">"A fleeting moment for the discerning collector. These treasures vanish as the sun rises."</p>
          </div>

          <div className="flex space-x-6">
            {['Hours', 'Minutes', 'Seconds'].map((unit) => (
                <div key={unit} className="flex flex-col items-center">
                    <div className="w-24 h-24 border border-gold/30 bg-gold/5 flex items-center justify-center font-display text-4xl text-gold mb-2">
                        {Math.floor(Math.random() * 60).toString().padStart(2, '0')}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 text-ivory">{unit}</span>
                </div>
            ))}
          </div>

          <Link 
            to="/products?sort=sale_price_asc"
            className="bg-ivory text-obsidian px-12 py-5 uppercase tracking-[0.3em] font-bold text-xs hover:bg-gold transition-all"
          >
            Claim the Offer
          </Link>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="font-display text-5xl mb-4">Curated Artisans</h2>
            <p className="text-sm opacity-60 uppercase tracking-widest">Explore our sophisticated categories</p>
          </div>
          <Link to="/products" className="text-xs uppercase tracking-[0.3em] font-bold text-gold hover:text-obsidian flex items-center group transition-colors">
            View All <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat: any) => (
            <Link 
              key={cat.id} 
              to={`/products?category=${cat.slug}`}
              className="group relative h-64 overflow-hidden border border-gold/10"
            >
              <img 
                src={cat.image_url} 
                alt={cat.name} 
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[50%] group-hover:grayscale-0" 
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute inset-x-0 bottom-8 text-center text-ivory">
                <h3 className="font-display text-2xl tracking-widest">{cat.name}</h3>
                <span className="text-[10px] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-ivory/5  py-32">
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-24">
                <h2 className="font-display text-6xl mb-6">Exclusives & Masterpieces</h2>
                <div className="h-[1px] w-32 bg-gold mx-auto mb-8" />
                <p className="text-sm opacity-60 uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
                    A selection of our most prestigious pieces, handcrafted for those who appreciate the finer things in life.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                {featuredProducts.map((p: any) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
      </section>

      {/* Brand Ethos */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="text-center space-y-6">
                <div className="flex justify-center text-gold"><Star size={40} strokeWidth={1} /></div>
                <h4 className="font-display text-2xl uppercase tracking-widest">Heritage Quality</h4>
                <p className="text-xs opacity-60 leading-relaxed italic">Crafted by master artisans with materials sourced from the most prestigious suppliers worldwide.</p>
            </div>
            <div className="text-center space-y-6">
                <div className="flex justify-center text-gold"><ShieldCheck size={40} strokeWidth={1} /></div>
                <h4 className="font-display text-2xl uppercase tracking-widest">Global Authenticity</h4>
                <p className="text-xs opacity-60 leading-relaxed italic">Every product undergoes a rigorous multi-point verification process to ensure absolute authenticity.</p>
            </div>
            <div className="text-center space-y-6">
                <div className="flex justify-center text-gold"><Clock size={40} strokeWidth={1} /></div>
                <h4 className="font-display text-2xl uppercase tracking-widest">Timeless Design</h4>
                <p className="text-xs opacity-60 leading-relaxed italic">Our aesthetic transcends seasons, offering pieces that remain elegant for a lifetime of luxury.</p>
            </div>
        </div>
      </section>

      {/* Gold Club CTA */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-obsidian border border-gold/40 p-20 text-center text-ivory relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                <span className="font-display text-[200px] leading-none">G</span>
            </div>
            <h2 className="font-display text-5xl mb-8">The Gold Club</h2>
            <p className="text-xl italic opacity-80 mb-12 max-w-2xl mx-auto font-display">
                "Wait no more for refinement. Join the inner circle and gain access to private collections and personal concierge services."
            </p>
            <button className="border border-gold text-gold px-12 py-4 uppercase tracking-[0.4em] font-bold text-xs hover:bg-gold hover:text-obsidian transition-all">
                Join Membership
            </button>
        </div>
      </section>
    </div>
  );
}
