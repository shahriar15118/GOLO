import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart as useCartContext } from '../context/CartContext';
import { ShoppingBag, Heart, Star, ShieldCheck, Truck, RotateCcw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/products/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCartContext();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data.product);
        
        // Fetch related products (using same category for now)
        const relatedRes = await api.get('/products', { category: res.data.product.category_id, limit: 4 });
        setRelatedProducts(relatedRes.data.products.filter((p: any) => p.id !== res.data.product.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="h-screen flex items-center justify-center font-display text-4xl animate-pulse">GOLO</div>;
  if (!product) return <div className="py-40 text-center font-display text-2xl italic">The masterpiece could not be found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 mb-12">
        <Link to="/" className="hover:text-gold transition-colors">GOLO</Link>
        <ChevronRight size={10} />
        <Link to="/products" className="hover:text-gold transition-colors">Collection</Link>
        <ChevronRight size={10} />
        <Link to={`/products?category=${product.category_slug}`} className="hover:text-gold transition-colors">{product.category_name}</Link>
        <ChevronRight size={10} />
        <span className="text-gold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-32">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[3/4] overflow-hidden bg-ivory/50">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {/* Thumbnails (Simulated) */}
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className={`aspect-square border border-gold/10 overflow-hidden cursor-pointer ${i === 0 ? 'ring-2 ring-gold' : 'opacity-60'}`}>
                    <img src={product.image_url} className="h-full w-full object-cover" />
                </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-10 sticky top-28">
          <div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold mb-4">{product.brand}</p>
            <h1 className="font-display text-6xl mb-6">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-8">
                <div className="flex text-gold">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? 'currentColor' : 'none'} />)}
                </div>
                <span className="text-[10px] uppercase tracking-widest opacity-40">(4.8 / 12 Luxury Reviews)</span>
            </div>
            
            <div className="flex items-center space-x-6">
                {product.sale_price ? (
                    <>
                        <span className="text-4xl font-display text-gold">৳{product.sale_price}</span>
                        <span className="text-xl font-display opacity-40 line-through">৳{product.base_price}</span>
                        <span className="bg-rose text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                            Save ৳{product.base_price - product.sale_price}
                        </span>
                    </>
                ) : (
                    <span className="text-4xl font-display">৳{product.base_price}</span>
                )}
            </div>
          </div>

          <div className="h-[1px] w-full bg-gold/10" />

          <p className="text-sm opacity-70 leading-relaxed italic font-display text-lg">
            {product.description}
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4 border border-gold/20 px-6 py-4">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-xl">-</button>
                    <span className="w-8 text-center font-bold">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="text-xl">+</button>
                </div>
                <button 
                    onClick={() => addItem(product)}
                    className="flex-grow bg-obsidian text-gold py-5 uppercase tracking-[0.4em] font-bold text-xs hover:bg-gold hover:text-obsidian transition-all transform hover:scale-[1.02]"
                >
                    Add to Bag
                </button>
            </div>
            <button className="w-full border border-gold/30 py-5 uppercase tracking-[0.4em] font-bold text-xs hover:bg-gold/5 flex items-center justify-center space-x-4">
                <Heart size={16} />
                <span>Save to Wishlist</span>
            </button>
          </div>

          {/* Delivery & Trust */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10">
            <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gold"><ShieldCheck size={18} /> <span className="text-[10px] uppercase font-bold tracking-widest">Authentic</span></div>
                <p className="text-[10px] opacity-40 italic">Guaranteed original product.</p>
            </div>
            <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gold"><Truck size={18} /> <span className="text-[10px] uppercase font-bold tracking-widest">Fast Concierge</span></div>
                <p className="text-[10px] opacity-40 italic">Dispatch within 24 hours.</p>
            </div>
            <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gold"><RotateCcw size={18} /> <span className="text-[10px] uppercase font-bold tracking-widest">7-Day Return</span></div>
                <p className="text-[10px] opacity-40 italic">Complimentary returns service.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="mb-32">
        <div className="flex space-x-12 border-b border-gold/10 mb-12">
            {['description', 'specifications', 'reviews'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-6 text-[10px] uppercase tracking-[0.4em] font-bold transition-all relative ${
                        activeTab === tab ? 'text-gold' : 'opacity-40 hover:opacity-100'
                    }`}
                >
                    {tab}
                    {activeTab === tab && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold" />
                    )}
                </button>
            ))}
        </div>

        <div className="max-w-4xl italic font-display text-lg opacity-70 leading-relaxed">
            {activeTab === 'description' && (
                <div className="space-y-6">
                    <p>Experience the culmination of artisanal heritage and contemporary vision. Every thread, every stitch, and every detail has been meticulously curated to reflect the GOLO standard of luxury.</p>
                    <p>Designed for those who understand that true elegance is found in the whisper, not the shout. This piece combines functional sophistication with aesthetic purity, creating a timeless addition to your prestigious collection.</p>
                </div>
            )}
            {activeTab === 'specifications' && (
                <div className="grid grid-cols-2 gap-y-8 bg-gold/5 p-12">
                    <div><h5 className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Material</h5><p>Hand-selected Grade A Textiles</p></div>
                    <div><h5 className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Origin</h5><p>Florence, Italy</p></div>
                    <div><h5 className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Care</h5><p>Dry Clean Only by Specialists</p></div>
                    <div><h5 className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Collection</h5><p>Summer Exclusives 2026</p></div>
                </div>
            )}
            {activeTab === 'reviews' && (
                <div className="space-y-12">
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gold/30">
                        <Star size={40} className="text-gold/20 mb-6" />
                        <h4 className="font-display text-2xl mb-2">Exquisite Satisfaction</h4>
                        <p className="text-xs uppercase tracking-widest opacity-40">Currently undergoing luxury validation</p>
                    </div>
                </div>
            )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="flex flex-col items-center mb-16">
            <h2 className="font-display text-4xl mb-4 italic">You May Also Desire</h2>
            <div className="h-[1px] w-20 bg-gold" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
