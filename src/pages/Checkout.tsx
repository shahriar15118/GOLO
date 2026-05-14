import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ShieldCheck, ArrowRight, Truck, CreditCard, Banknote } from 'lucide-react';
import { motion } from 'motion/react';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const shipping = subtotal > 5000 ? 0 : 250;
  const grandTotal = subtotal + shipping - discount;

  useEffect(() => {
    if (!user) return navigate('/auth/login?redirect=/checkout');
    if (items.length === 0) return navigate('/products');

    const fetchAddresses = async () => {
      try {
        const res = await api.get('/users/addresses');
        setAddresses(res.data.addresses);
        const def = res.data.addresses.find((a: any) => a.is_default);
        if (def) setSelectedAddress(def.id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAddresses();
  }, [user, items]);

  const validatePromo = async () => {
    try {
      const res = await api.post('/promotions/validate', { code: promoCode, amount: subtotal });
      setDiscount(res.data.discount);
      alert('Promotion applied!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return alert('Please select a shipping destination.');
    setLoading(true);
    try {
      const res = await api.post('/orders', {
        address_id: selectedAddress,
        items,
        discount,
        shipping,
        tax: 0,
        total: grandTotal,
        promo_code: promoCode,
        payment_method: 'COD',
        notes: ''
      });
      clearCart();
      navigate(`/orders/${res.data.order_id}?placed=1`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <h1 className="font-display text-6xl mb-16 text-center italic">The GOLO Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
        <div className="lg:col-span-2 space-y-16">
          {/* Address Selection */}
          <section>
            <div className="flex justify-between items-center mb-8 border-b border-gold/20 pb-4">
                <h2 className="font-display text-3xl italic">Shipping Destination</h2>
                <button className="text-[10px] uppercase tracking-widest font-bold text-gold">+ Add New Address</button>
            </div>
            
            <div className="space-y-4">
              {addresses.map((addr: any) => (
                <label 
                  key={addr.id}
                  className={`block border p-6 cursor-pointer transition-all ${
                    selectedAddress === addr.id ? 'border-gold bg-gold/5' : 'border-gold/10 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input 
                      type="radio" 
                      name="address" 
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="accent-gold h-4 w-4"
                    />
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <span className="text-[10px] uppercase tracking-widest font-bold bg-gold text-obsidian px-2 py-0.5">{addr.label}</span>
                            <span className="font-bold text-sm">{addr.full_name}</span>
                        </div>
                        <p className="text-xs opacity-70 italic">{addr.line1}, {addr.city}, {addr.country}</p>
                        <p className="text-xs opacity-70 italic mt-1">{addr.phone}</p>
                    </div>
                  </div>
                </label>
              ))}
              {addresses.length === 0 && (
                <div className="text-center py-10 border border-dashed border-gold/20 opacity-40 italic">
                    No addresses found. Please add a destination.
                </div>
              )}
            </div>
          </section>

          {/* Payment Method */}
          <section>
            <h2 className="font-display text-3xl italic mb-8 border-b border-gold/20 pb-4">Payment Selection</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gold bg-gold/5 p-6 flex flex-col items-center justify-center space-y-3 cursor-pointer">
                    <Banknote size={24} className="text-gold" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Cash on Delivery</span>
                </div>
                <div className="border border-gold/10 p-6 flex flex-col items-center justify-center space-y-3 opacity-40 cursor-not-allowed">
                    <CreditCard size={24} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Online Payment</span>
                </div>
            </div>
          </section>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass p-10 border border-gold/30 space-y-8 sticky top-28">
            <h3 className="font-display text-3xl mb-8 text-center italic">Order Overview</h3>
            
            <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-4">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                        <span className="opacity-60">{item.name} x {item.quantity}</span>
                        <span className="font-bold">৳{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>

            <div className="h-[1px] w-full bg-gold/20" />

            {/* Promo Code */}
            <div className="space-y-4">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Privilege Code</label>
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        placeholder="Enter code..." 
                        className="flex-grow bg-transparent border-b border-gold/20 py-2 outline-none text-xs italic"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button onClick={validatePromo} className="text-[10px] uppercase font-bold tracking-widest text-gold">Apply</button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                    <span className="opacity-40 uppercase tracking-widest">Bag Subtotal</span>
                    <span>৳{subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="opacity-40 uppercase tracking-widest">Concierge Delivery</span>
                    <span>{shipping === 0 ? 'Complimentary' : `৳${shipping}`}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between items-center text-xs text-teal-600">
                        <span className="uppercase tracking-widest">Promotional Reward</span>
                        <span>-৳{discount}</span>
                    </div>
                )}
                <div className="pt-4 flex justify-between items-end">
                    <span className="text-xs uppercase font-bold tracking-[0.3em] opacity-40">Total Excellence</span>
                    <span className="font-display text-4xl text-gold">৳{grandTotal}</span>
                </div>
            </div>

            <button 
                disabled={loading}
                onClick={handlePlaceOrder}
                className="w-full bg-obsidian text-gold py-5 uppercase tracking-[0.4em] font-bold text-xs hover:bg-gold hover:text-obsidian transition-all flex items-center justify-center group disabled:opacity-50"
            >
                {loading ? "Confirming..." : (
                    <>
                        <span>Confirm Order</span>
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </>
                )}
            </button>

            <div className="pt-4 flex items-center justify-center space-x-3 opacity-30 text-[8px] uppercase tracking-widest">
                <ShieldCheck size={14} />
                <span>Encrypted Luxury Transaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
