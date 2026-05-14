import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: any) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('golo_cart');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('golo_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: any) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === item.id);
      if (existing) {
        return prev.map(i => i.product_id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: Date.now(),
        product_id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.sale_price || item.base_price,
        quantity: 1,
        image_url: item.image_url
      }];
    });
    setCartOpen(true);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQty = (id: number, qty: number) => {
    if (qty < 1) return removeItem(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart, 
      subtotal, totalItems, isCartOpen, setCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
