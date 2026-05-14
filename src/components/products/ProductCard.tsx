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
      <div className="relative aspect-[3/4] overflow-hidden bg-ivory/50">
        <Link to={`/product/${product.slug}`}>
          <img 
            src={product.image_url} 
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {discount > 0 && (
            <span className="bg-rose text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
              -{discount}%
            </span>
          )}
          {(product.is_featured === 1 || product.is_featured === true) && (
            <span className="glass text-obsidian dark:text-ivory text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
              Limited
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <button 
          onClick={toggleWishlist}
          className="absolute top-4 right-4 p-2 rounded-full glass hover:bg-white transition-colors"
        >
          <motion.div
            animate={{ scale: isWishlisted ? [1, 1.4, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart size={16} className={isWishlisted ? 'fill-rose text-rose' : ''} />
          </motion.div>
        </button>

        <motion.button 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
          onClick={() => addItem(product)}
          className="absolute bottom-4 left-4 right-4 bg-obsidian text-gold py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center space-x-2"
        >
          <ShoppingBag size={14} />
          <span>Add to Bag</span>
        </motion.button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 mb-1">{product.brand}</p>
        <h3 className="font-display text-lg mb-2">
          <Link to={`/product/${product.slug}`} className="hover:text-gold transition-colors">
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center justify-center space-x-3">
          {product.sale_price ? (
            <>
              <span className="text-gold font-bold">৳{product.sale_price}</span>
              <span className="text-gray-400 line-through text-sm">৳{product.base_price}</span>
            </>
          ) : (
            <span className="text-obsidian dark:text-ivory">৳{product.base_price}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
