import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { CheckCircle, Package, Truck, Calendar, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const isNew = new URLSearchParams(location.search).get('placed') === '1';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center font-display text-4xl animate-pulse">GOLO</div>;
  if (!order) return <div className="py-40 text-center font-display text-2xl italic">The decree of your purchase could not be retrieved.</div>;

  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStep = steps.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-20">
      {isNew && (
        <div className="text-center space-y-6">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex p-6 rounded-full bg-teal-500/10 text-teal-500 mb-4"
            >
                <CheckCircle size={64} strokeWidth={1} />
            </motion.div>
            <h1 className="font-display text-6xl mb-4 italic">Purchase Decreed</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-40">Order #{order.order_number}</p>
            <p className="text-sm opacity-60 italic max-w-md mx-auto">
                "Your desire has been captured. Our artisans are now preparing your treasures with the utmost care."
            </p>
        </div>
      )}

      {/* Tracking Visualization */}
      <section className="bg-gold/5 p-12 border border-gold/20">
        <div className="flex justify-between items-center mb-12">
            <h2 className="font-display text-2xl italic uppercase tracking-widest">Courier Status</h2>
            <span className="text-[10px] bg-gold text-obsidian px-4 py-1 font-bold uppercase tracking-widest">{order.status}</span>
        </div>
        
        <div className="relative flex justify-between">
            {/* Connector Line */}
            <div className="absolute top-5 left-0 right-0 h-[1px] bg-gold/20 -z-10" />
            <div 
                className="absolute top-5 left-0 h-[1px] bg-gold transition-all duration-1000 -z-10" 
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} 
            />

            {steps.map((step, i) => (
                <div key={step} className="flex flex-col items-center space-y-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-500 ${
                        i <= currentStep ? 'bg-gold text-obsidian' : 'bg-ivory dark:bg-obsidian border border-gold/20 text-gold/20'
                    }`}>
                        {step === 'pending' && <Calendar size={16} />}
                        {step === 'confirmed' && <CheckCircle size={16} />}
                        {step === 'processing' && <Package size={16} />}
                        {step === 'shipped' && <Truck size={16} />}
                        {step === 'delivered' && <ShoppingBag size={16} />}
                    </div>
                    <span className={`text-[8px] uppercase tracking-widest font-bold ${i <= currentStep ? 'opacity-100' : 'opacity-20'}`}>
                        {step}
                    </span>
                </div>
            ))}
        </div>
      </section>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="space-y-6">
            <h3 className="font-display text-2xl italic border-b border-gold/10 pb-4">Treasure Details</h3>
            <div className="space-y-4">
                {order.items.map((item: any) => (
                    <div key={item.id} className="flex space-x-6">
                        <img src={item.image_url} className="h-20 w-16 object-cover bg-ivory/50" />
                        <div className="flex-grow flex flex-col justify-center">
                            <h4 className="font-display text-lg leading-tight">{item.name}</h4>
                            <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Qty: {item.quantity} • Unit: ৳{item.unit_price}</p>
                        </div>
                        <div className="flex items-center font-bold text-sm">৳{item.line_total}</div>
                    </div>
                ))}
            </div>
            <div className="pt-6 border-t border-gold/10 space-y-2 text-sm">
                <div className="flex justify-between opacity-60 italic font-display"><span>Subtotal</span><span>৳{order.subtotal}</span></div>
                <div className="flex justify-between opacity-60 italic font-display"><span>Concierge Delivery</span><span>{order.shipping === 0 ? 'Complimentary' : `৳${order.shipping}`}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-teal-600 italic font-display"><span>Privilege Reward</span><span>-৳{order.discount}</span></div>}
                <div className="flex justify-between font-display text-2xl pt-4 text-gold border-t border-gold/10 mt-4"><span>Grand Total</span><span>৳{order.total}</span></div>
            </div>
        </section>

        <section className="space-y-6">
            <h3 className="font-display text-2xl italic border-b border-gold/10 pb-4">Recipient Information</h3>
            <div className="space-y-8">
                <div>
                   <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Delivery Address</p>
                   {/* Dummy info as address is not joined in detail fetch for now */}
                   <p className="text-sm italic font-display opacity-80">Reserved for the owner's gaze.</p>
                </div>
                <div>
                   <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2">Method of Exchange</p>
                   <p className="text-sm font-bold uppercase tracking-widest">{order.payment_method}</p>
                   <p className="text-[10px] opacity-40 italic mt-1">Status: {order.payment_status}</p>
                </div>
                <div className="pt-10">
                   <Link to="/products" className="inline-block bg-gold text-obsidian px-10 py-4 uppercase tracking-[0.3em] font-bold text-[10px] hover:bg-obsidian hover:text-gold border border-gold transition-all">
                       Continue Curating
                   </Link>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}
