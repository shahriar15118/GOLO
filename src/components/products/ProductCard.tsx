import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../../context/CartContext';
import { api } from '../../lib/api';

interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  base_price: number;
  sale_price?: number;
  image_url: string;
  is_featured: number | boolean;
}

export default function ProductCard({ product, ...props }: { product: any, [key: string]: any }) {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    try {
      await api.post(`/users/wishlist/${product.id}`, {});
    } catch (err) {
      // If error (not logged in), we keep local state or revert
      console.error(err);
    }
  };

  const discount = product.sale_price 
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100) 
    : 0;

  return (
    <motion.div 
      layout
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-white dark:bg-gold/5 border border-gold/10 rounded-2xl shadow-2xl shadow-obsidian/10 dark:shadow-black/40 group-hover:border-gold/40 transition-colors duration-700">
        <Link to={`/product/${product.slug}`}>
          <img 
            src={product.image_url} 
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 brightness-[0.85] group-hover:brightness-100 rounded-2xl"
          />
        </Link>

        {/* Cinematic Reveal */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-2xl" />
        <div className="absolute inset-4 border border-gold/30 scale-105 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none rounded-xl" />

        {/* Status Badges */}
        <div className="absolute top-6 left-6 flex flex-col space-y-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
          {discount > 0 && (
            <span className="bg-rose text-ivory text-[8px] font-bold px-3 py-1 uppercase tracking-[0.2em] rounded-full shadow-lg">
              -{discount}%
            </span>
          )}
          {(product.is_featured === 1 || product.is_featured === true) && (
            <span className="bg-gold text-obsidian text-[8px] font-bold px-3 py-1 uppercase tracking-[0.2em] rounded-full shadow-lg">
              Limited Edition
            </span>
          )}
        </div>

        {/* Interactions */}
        <div className="absolute top-6 right-6 flex flex-col space-y-3 transform translate-x-12 group-hover:translate-x-0 transition-all duration-700 delay-100">
            <button 
                onClick={toggleWishlist}
                className="p-3 bg-obsidian/60 backdrop-blur-md border border-gold/20 text-gold hover:bg-gold hover:text-obsidian transition-all duration-500 rounded-full group/fav"
            >
                <Heart size={14} className={isWishlisted ? 'fill-gold' : 'group-hover/fav:scale-110 transition-transform'} />
            </button>
        </div>

        <motion.button 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
          onClick={() => addItem(product)}
          className="absolute bottom-6 left-6 right-6 bg-ivory text-obsidian py-4 text-[9px] font-bold uppercase tracking-[0.4em] flex items-center justify-center space-x-3 transition-all hover:bg-gold rounded-full shadow-2xl"
        >
          <ShoppingBag size={14} strokeWidth={2.5} />
          <span>Add to Collection</span>
        </motion.button>
      </div>

      <div className="mt-8 text-center space-y-3 px-2">
        <div className="flex items-center justify-center space-x-4">
            <div className="h-[0.5px] w-8 bg-gold/20" />
            <p className="text-[8px] uppercase tracking-[0.6em] text-gold font-bold">{product.brand}</p>
            <div className="h-[0.5px] w-8 bg-gold/20" />
        </div>
        <h3 className="font-display text-2xl tracking-tight leading-tight">
          <Link to={`/product/${product.slug}`} className="hover:text-gold transition-colors block text-obsidian dark:text-ivory">
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center justify-center space-x-4 pt-1">
          {product.sale_price ? (
            <>
              <span className="text-gold font-bold tracking-[0.2em] text-lg italic">৳{product.sale_price.toLocaleString()}</span>
              <span className="text-obsidian/40 dark:text-ivory/20 line-through text-[10px] tracking-widest font-light">৳{product.base_price.toLocaleString()}</span>
            </>
          ) : (
            <span className="text-obsidian/70 dark:text-ivory/70 font-medium tracking-[0.2em] text-lg italic">৳{product.base_price.toLocaleString()}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
