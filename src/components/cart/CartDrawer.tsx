import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { items, isCartOpen, setCartOpen, removeItem, updateQty, subtotal } = useCart();
  const navigate = useNavigate();

  const FREE_SHIPPING_LIMIT = 5000;
  const progress = Math.min((subtotal / FREE_SHIPPING_LIMIT) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_LIMIT - subtotal, 0);

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-ivory dark:bg-obsidian z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 flex justify-between items-center border-b border-gold/10">
              <div className="flex items-center space-x-4">
                <ShoppingBag size={24} className="text-gold" />
                <h2 className="font-display text-2xl uppercase tracking-widest">Your Bag</h2>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-gold/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Free Shipping Bar */}
            <div className="p-8 bg-gold/5 border-b border-gold/10">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-3">
                <span>Free Shipping Status</span>
                {remaining > 0 ? (
                  <span>৳{remaining} away</span>
                ) : (
                  <span className="text-teal-600">Unlocked</span>
                )}
              </div>
              <div className="h-1 w-full bg-ivory dark:bg-obsidian rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full ${remaining === 0 ? 'bg-teal-500' : 'bg-gold'}`}
                />
              </div>
              {remaining > 0 && (
                <p className="text-[10px] italic opacity-50 mt-3 text-center">
                  Add more treasures to receive complimentary worldwide concierge delivery.
                </p>
              )}
            </div>

            {/* Items */}
            <div className="flex-grow p-8 overflow-y-auto space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="p-10 rounded-full bg-gold/5"><ShoppingBag size={64} className="text-gold/20" /></div>
                  <h3 className="font-display text-2xl italic">Your bag is currently empty</h3>
                  <button 
                    onClick={() => setCartOpen(false)}
                    className="text-[10px] uppercase tracking-widest font-bold border-b border-gold pb-1 text-gold"
                  >
                    Start Curating
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex space-x-6">
                    <div className="h-32 w-24 flex-shrink-0 overflow-hidden bg-ivory/50">
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-gold font-bold mb-1">{item.brand}</p>
                            <h4 className="font-display text-lg leading-tight">{item.name}</h4>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-rose opacity-40 hover:opacity-100 transition-opacity">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-sm font-bold mt-2">৳{item.price}</p>
                      </div>
                      
                      <div className="flex items-center space-x-4 border border-gold/20 px-3 py-1 w-fit mt-4">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)}><Minus size={12} /></button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)}><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 border-t border-gold/20 space-y-6 bg-ivory dark:bg-obsidian">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40">Estimated Subtotal</span>
                  <span className="font-display text-3xl text-gold">৳{subtotal}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-obsidian text-gold py-5 uppercase tracking-[0.4em] font-bold text-xs hover:bg-gold hover:text-obsidian transition-all flex items-center justify-center group"
                >
                  <span>Proceed to Concierge</span>
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </button>
                <p className="text-[10px] text-center opacity-40 italic">Shipping and duties calculated at checkout.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
