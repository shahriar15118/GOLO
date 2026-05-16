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

  if (loading) return <div className="h-screen flex items-center justify-center font-display text-4xl animate-pulse text-gold">GOLO</div>;

  return (
    <div className="relative pb-32 bg-ivory dark:bg-obsidian text-obsidian dark:text-ivory transition-colors duration-500 selection:bg-gold/30">
      {/* Texture Overlay */}
      <div className="fixed inset-0 grain-overlay z-[60] pointer-events-none opacity-[0.04]" />

      {/* Hero Section */}
      {banners && banners.length > 0 ? (
        <BannerCarousel banners={banners} />
      ) : (
        <div className="h-[80vh] flex flex-col items-center justify-center border-b border-gold/10 bg-ivory dark:bg-gold/5 px-4 text-center relative overflow-hidden transition-colors duration-500">
          <div className="absolute inset-0 luxury-gradient opacity-40" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative z-10"
          >
            <span className="text-gold uppercase tracking-[1em] text-[10px] mb-8 block font-bold">Establishment 2026</span>
            <h1 className="font-display text-7xl md:text-[10rem] mb-8 tracking-tighter italic leading-none text-obsidian dark:text-ivory">GOLO PRIVE</h1>
            <div className="flex items-center justify-center space-x-8 mt-12">
                <div className="h-[1px] w-20 bg-gold/30" />
                <p className="font-display text-2xl opacity-60 italic text-obsidian dark:text-ivory">"Elegance is the only beauty that never fades"</p>
                <div className="h-[1px] w-20 bg-gold/30" />
            </div>
          </motion.div>
        </div>
      )}

      <div className="space-y-32 mt-32">
        {/* Marquee Promotion */}
        <div className="bg-ivory dark:bg-obsidian border-y border-gold/20 py-5 overflow-hidden flex items-center relative transition-colors duration-500">
          <div className="absolute inset-0 bg-gold/5 pointer-events-none" />
          <div className="marquee-content whitespace-nowrap space-x-12">
              {[...Array(10)].map((_, i) => (
                  <span key={i} className="text-gold/80 text-[9px] font-bold uppercase tracking-[0.6em] flex items-center">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full mr-12 opacity-40 shrink-0" />
                      Complimentary White-Glove Delivery • Traditional Collection Live • Use Code PRIVE2026 For 15% Reduction • Curated Authenticity 
                  </span>
              ))}
          </div>
        </div>

        {/* Flash Sale Section */}
        <section className="relative h-[80vh] flex items-center overflow-hidden bg-obsidian transition-colors">
        {/* Background Image with Cinematic Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=2070" 
            className="w-full h-full object-cover brightness-[0.4]"
            alt="Vault Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/60 to-transparent" />
        </div>
        
        <div className="max-w-[1400px] mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div className="inline-block border-l-2 border-gold pl-6">
                <span className="text-gold font-bold uppercase tracking-[0.8em] text-[10px] block mb-2">Private Revelation</span>
                <h2 className="font-display text-6xl md:text-8xl text-ivory tracking-tighter">Midnight <br/>Collection</h2>
            </div>
            
            <p className="text-ivory/60 italic font-display text-2xl max-w-md leading-relaxed">
              "A fleeting intersection of time and craftsmanship. For a limited window, access our vault of exceptional curiosities."
            </p>
            
            <div className="flex items-center space-x-12">
                <div className="flex space-x-8">
                    {['Hours', 'Min', 'Sec'].map((unit, i) => (
                        <div key={unit} className="flex flex-col items-center">
                            <div className="text-5xl font-display text-gold mb-1">
                                {i === 0 ? '08' : i === 1 ? '42' : '19'}
                            </div>
                            <span className="text-[8px] uppercase font-bold tracking-[0.4em] opacity-40 text-ivory">{unit}</span>
                        </div>
                    ))}
                </div>
                
                <Link 
                    to="/products"
                    className="group relative overflow-hidden px-12 py-5 bg-gold text-obsidian text-[10px] font-bold uppercase tracking-[0.4em] transition-all hover:pr-16"
                >
                    <span className="relative z-10">Access the Vault</span>
                    <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" size={16} />
                </Link>
            </div>
          </motion.div>
          
          <div className="hidden lg:block relative">
            <div className="aspect-[4/5] overflow-hidden border border-gold/20 shadow-2xl scale-90 hover:scale-95 transition-transform duration-700 bg-gold/5 backdrop-blur-sm">
                <img 
                    src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                    alt="Featured Piece"
                />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="font-display text-5xl mb-4 text-obsidian dark:text-ivory">Curated Artisans</h2>
            <p className="text-sm opacity-60 uppercase tracking-widest text-obsidian dark:text-ivory">Explore our sophisticated categories</p>
          </div>
          <Link to="/products" className="text-xs uppercase tracking-[0.3em] font-bold text-gold hover:text-obsidian dark:hover:text-ivory flex items-center group transition-colors">
            View All <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories && categories.length > 0 ? (
            categories.map((cat: any, index: number) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={cat.id}
              >
                <Link 
                  to={`/products?category=${cat.slug}`}
                  className="group relative h-0 pb-[135%] overflow-hidden border border-gold/20 block bg-gold/5 rounded-2xl shadow-xl shadow-black/40 hover:shadow-gold/10 transition-shadow"
                >
                  <img 
                    src={cat.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070'} 
                    alt={cat.name} 
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 grayscale-[80%] group-hover:grayscale-0 brightness-[0.7] group-hover:brightness-100 rounded-2xl" 
                  />
                  <div className="absolute inset-4 border border-gold/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-xl" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex flex-col items-center text-center">
                        <span className="text-[10px] uppercase tracking-[0.5em] text-gold/40 mb-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100 italic">Collection {index + 1}</span>
                        <h3 className="font-display text-2xl lg:text-3xl tracking-widest text-ivory drop-shadow-lg mb-4">{cat.name}</h3>
                        <div className="h-[1px] w-0 group-hover:w-12 bg-gold transition-all duration-700 mx-auto" />
                        <span className="mt-4 text-[9px] uppercase tracking-[0.4em] text-gold font-bold opacity-0 group-hover:opacity-100 transition-opacity delay-300">Enter Gallery</span>
                    </div>
                  </div>

                  {/* Decorative Lettering */}
                  <div className="absolute top-4 left-4 p-2 opacity-10 group-hover:opacity-40 transition-opacity">
                    <span className="font-display text-4xl text-gold italic">{cat.name.charAt(0)}</span>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            [...Array(8)].map((_, i) => (
              <div key={i} className="h-0 pb-[135%] border border-gold/10 bg-gold/5 flex items-center justify-center animate-pulse relative">
                <span className="absolute inset-0 flex items-center justify-center text-gold/20 font-display italic text-sm">Synchronizing...</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-ivory dark:bg-gold/5 border-y border-gold/10 py-32 transition-colors duration-500">
        <div className="max-w-[1400px] mx-auto px-6">
            <div className="text-center mb-24">
                <h2 className="font-display text-6xl mb-6 text-obsidian dark:text-ivory">Exclusives & Masterpieces</h2>
                <div className="h-[1px] w-32 bg-gold mx-auto mb-8" />
                <p className="text-sm opacity-60 uppercase tracking-widest max-w-xl mx-auto leading-relaxed text-obsidian dark:text-ivory">
                    A selection of our most prestigious pieces, handcrafted for those who appreciate the finer things in life.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                {featuredProducts && featuredProducts.length > 0 ? (
                  featuredProducts.map((p: any) => (
                      <ProductCard key={p.id} product={p} />
                  ))
                ) : (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-6 animate-pulse opacity-20">
                      <div className="aspect-[4/5] bg-gold/10 border border-gold/10" />
                      <div className="h-4 w-2/3 bg-gold/10 mx-auto" />
                      <div className="h-4 w-1/3 bg-gold/10 mx-auto" />
                    </div>
                  ))
                )}
            </div>
        </div>
      </section>

      {/* Brand Ethos */}
      <section className="max-w-[1400px] mx-auto px-6">
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
      <section className="max-w-[1400px] mx-auto px-6">
        <div className="bg-obsidian border border-gold/40 p-20 text-center text-ivory relative overflow-hidden rounded-[2rem] shadow-2xl">
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
    </div>
  );
}
