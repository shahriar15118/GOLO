import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Image as ImageIcon, Tag, MessageSquare, BarChart3, Settings, LogOut } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';

// Sub-components
const DashboardOverview = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <div className="animate-pulse">Retrieving analytics...</div>;

    const cards = [
        { name: 'Total Revenue', value: `৳${stats.totalRevenue.toLocaleString()}`, icon: BarChart3, color: 'text-teal-500' },
        { name: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-gold' },
        { name: 'Active Customers', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
        { name: 'Collection Size', value: stats.totalProducts, icon: Tag, color: 'text-rose-500' },
    ];

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {cards.map((card) => (
                    <div key={card.name} className="glass p-8 border border-gold/10">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${card.color} opacity-80`}><card.icon size={24} /></div>
                            <span className="text-[10px] uppercase tracking-widest opacity-40">Monthly</span>
                        </div>
                        <h4 className="font-display text-3xl font-bold">{card.value}</h4>
                        <p className="text-[8px] uppercase tracking-widest opacity-40 mt-2">{card.name}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass p-8 border border-gold/10">
                    <h3 className="font-display text-2xl mb-8 uppercase tracking-widest italic">Revenue Flow</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {[...Array(30)].map((_, i) => (
                            <div 
                                key={i} 
                                className="bg-gold/30 hover:bg-gold w-full transition-all cursor-crosshair group relative"
                                style={{ height: `${Math.random() * 100}%` }}
                            >
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity bg-gold text-obsidian px-1">৳{Math.floor(Math.random() * 1000)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[8px] uppercase tracking-widest opacity-40 italic">
                        <span>30 Days Ago</span>
                        <span>Present Day</span>
                    </div>
                </div>

                <div className="glass p-8 border border-gold/10">
                    <h3 className="font-display text-2xl mb-8 uppercase tracking-widest italic">Inventory Health</h3>
                    <div className="space-y-6">
                        {['Clothing', 'Jewelry', 'Bags', 'Perfumes'].map(c => (
                            <div key={c} className="space-y-2">
                                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                                    <span>{c}</span>
                                    <span>{Math.floor(Math.random() * 100)}%</span>
                                </div>
                                <div className="h-0.5 bg-gold/10 w-full overflow-hidden">
                                    <div className="h-full bg-gold" style={{ width: `${Math.random() * 80 + 20}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductManager = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const fetchProducts = async () => {
        try {
            const res = await api.get('/admin/products');
            setProducts(res.data.products);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.category_name === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const toggleFeatured = async (id: number) => {
        try {
            await api.patch(`/admin/products/${id}/featured`, {});
            fetchProducts();
        } catch (err) { alert('Action failed'); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct.id) {
                await api.put(`/admin/products/${editingProduct.id}`, editingProduct);
            } else {
                await api.post(`/admin/products`, editingProduct);
            }
            setEditingProduct(null);
            fetchProducts();
            alert('Success');
        } catch (err) { alert('Failed to save'); }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="font-display text-4xl italic">Luxury Collection</h2>
                <button 
                  onClick={() => setEditingProduct({ name: '', brand: '', base_price: 0, sale_price: 0, stock_qty: 0, image_url: '', category_id: 1, is_featured: 0 })}
                  className="bg-gold text-obsidian px-6 py-2 text-[10px] uppercase font-bold tracking-widest"
                >
                    + New Treasure
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <input 
                    type="text" 
                    placeholder="Search by name or brand..." 
                    className="glass border border-gold/20 bg-transparent px-4 py-2 text-xs outline-none focus:border-gold transition-colors italic w-full md:w-96"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select 
                    className="glass border border-gold/20 bg-obsidian px-4 py-2 text-[10px] uppercase font-bold tracking-widest outline-none"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                >
                    <option value="all">All Houses</option>
                    {Array.from(new Set(products.map(p => p.category_name))).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <div className="flex-grow "></div>
                <span className="text-[8px] uppercase tracking-widest opacity-40 italic">{filteredProducts.length} Treasures matching query</span>
            </div>

            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 backdrop-blur-sm p-4">
                    <form onSubmit={handleSave} className="glass p-12 border border-gold/20 max-w-2xl w-full space-y-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h3 className="font-display text-3xl italic">Refining Item</h3>
                            <button type="button" onClick={() => setEditingProduct(null)} className="opacity-40 hover:opacity-100 uppercase text-[10px] font-bold">Close</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-40">Item Name</label>
                                <input className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-40">Brand House</label>
                                <input className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" value={editingProduct.brand} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-40">Base Value (৳)</label>
                                <input type="number" className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" value={editingProduct.base_price} onChange={e => setEditingProduct({...editingProduct, base_price: parseFloat(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-40">Sale Value (৳)</label>
                                <input type="number" className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" value={editingProduct.sale_price} onChange={e => setEditingProduct({...editingProduct, sale_price: parseFloat(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-40">Inventory Count</label>
                                <input type="number" className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" value={editingProduct.stock_qty} onChange={e => setEditingProduct({...editingProduct, stock_qty: parseInt(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-40">Image Path</label>
                                <input className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" value={editingProduct.image_url} onChange={e => setEditingProduct({...editingProduct, image_url: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-40">Category ID</label>
                                <input type="number" className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" value={editingProduct.category_id} onChange={e => setEditingProduct({...editingProduct, category_id: parseInt(e.target.value)})} />
                            </div>
                        </div>

                        <button className="w-full bg-gold text-obsidian py-4 uppercase font-bold tracking-[0.2em] text-xs hover:bg-ivory transition-all">
                            Commit Changes
                        </button>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gold/20 text-[10px] uppercase tracking-widest opacity-40">
                            <th className="pb-4">Image</th>
                            <th className="pb-4">Name</th>
                            <th className="pb-4">Brand</th>
                            <th className="pb-4">Price</th>
                            <th className="pb-4">Stock</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredProducts.map(p => (
                            <tr key={p.id} className="border-b border-gold/5 group hover:bg-gold/5 transition-colors">
                                <td className="py-4">
                                    <img src={p.image_url} alt={p.name} className="h-12 w-10 object-cover bg-white/10" />
                                </td>
                                <td className="py-4 font-display text-lg">{p.name}</td>
                                <td className="py-4 opacity-60 italic">{p.brand}</td>
                                <td className="py-4 font-bold">৳{p.sale_price || p.base_price}</td>
                                <td className="py-4 font-mono">{p.stock_qty}</td>
                                <td className="py-4">
                                    <button 
                                        onClick={() => toggleFeatured(p.id)}
                                        className={`px-2 py-1 text-[8px] uppercase tracking-tighter ${p.is_featured ? 'bg-gold text-obsidian' : 'border border-gold/20'}`}
                                    >
                                        {p.is_featured ? 'Featured' : 'Standard'}
                                    </button>
                                </td>
                                <td className="py-4">
                                    <div className="flex space-x-4 opacity-40 group-hover:opacity-100">
                                        <button 
                                          onClick={() => setEditingProduct(p)}
                                          className="hover:text-gold uppercase text-[10px] font-bold"
                                        >
                                            Edit
                                        </button>
                                        <button className="hover:text-rose uppercase text-[10px] font-bold">Hide</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const OrderManager = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/admin/orders');
                setOrders(res.data.orders);
            } catch (err) { console.error(err); }
        };
        fetchOrders();
    }, []);

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <h2 className="font-display text-4xl italic">Decrees & Acquisition</h2>
                <div className="flex space-x-4">
                    {['all', 'pending', 'processing', 'shipped', 'delivered'].map(s => (
                        <button 
                            key={s} 
                            onClick={() => setFilter(s)}
                            className={`text-[8px] uppercase tracking-widest font-bold pb-1 border-b ${filter === s ? 'text-gold border-gold' : 'opacity-40 border-transparent'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {filtered.map(o => (
                    <div key={o.id} className="glass p-6 border border-gold/10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                            <div>
                                <span className="text-[8px] uppercase tracking-widest opacity-40 block mb-1">Order Ref</span>
                                <span className="font-mono text-sm">#{o.order_number}</span>
                            </div>
                            <div>
                                <span className="text-[8px] uppercase tracking-widest opacity-40 block mb-1">Client</span>
                                <span className="text-sm italic font-display">{o.customer_name}</span>
                            </div>
                            <div>
                                <span className="text-[8px] uppercase tracking-widest opacity-40 block mb-1">Total Value</span>
                                <span className="font-bold">৳{o.total}</span>
                            </div>
                            <div>
                                <span className="text-[8px] uppercase tracking-widest opacity-40 block mb-1">Acquisition Status</span>
                                <span className="text-[10px] uppercase font-bold text-gold">{o.status}</span>
                            </div>
                        </div>
                        <Link to={`/orders/${o.id}`} className="text-[10px] uppercase tracking-widest font-bold border border-gold/20 px-4 py-2 hover:bg-gold hover:text-obsidian transition-all">Inspect</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'admin') return <Navigate to="/auth/login" />;

  const menu = [
    { name: 'Oracle View', path: '', icon: LayoutDashboard },
    { name: 'Decrees', path: '/orders', icon: ShoppingBag },
    { name: 'Treasures', path: '/products', icon: Tag },
    { name: 'Citizens', path: '/users', icon: Users },
    { name: 'Banners', path: '/banners', icon: ImageIcon },
    { name: 'Dialogue', path: '/chat', icon: MessageSquare },
    { name: 'Config', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-ivory dark:bg-[#050505]">
      <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-6 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-12">
            <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">Authority Panel</span>
                <h1 className="font-display text-4xl italic">Command Centre</h1>
            </div>

            <nav className="flex flex-col space-y-2">
                {menu.map((item) => {
                    const isActive = location.pathname === `/admin${item.path}`;
                    return (
                        <Link 
                            key={item.name} 
                            to={`/admin${item.path}`}
                            className={`flex items-center space-x-4 p-4 text-[10px] uppercase font-bold tracking-widest transition-all ${
                                isActive ? 'bg-gold text-obsidian' : 'opacity-60 hover:opacity-100 hover:bg-gold/5'
                            }`}
                        >
                            <item.icon size={16} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
                <button 
                  onClick={logout}
                  className="flex items-center space-x-4 p-4 text-[10px] uppercase font-bold tracking-widest text-rose opacity-60 hover:opacity-100 mt-10"
                >
                    <LogOut size={16} />
                    <span>Evict Authority</span>
                </button>
            </nav>
        </aside>

        {/* Content */}
        <main className="lg:col-span-5 p-12 glass border border-gold/10">
            <Routes>
                <Route path="/" element={<DashboardOverview />} />
                <Route path="/orders" element={<OrderManager />} />
                <Route path="/products" element={<ProductManager />} />
                <Route path="*" element={<Navigate to="/admin" />} />
            </Routes>
        </main>
      </div>
    </div>
  );
}
