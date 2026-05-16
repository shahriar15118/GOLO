import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Image as ImageIcon, Tag, MessageSquare, BarChart3, Settings, LogOut, Upload, X, Megaphone, HelpCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { NoticeManager } from './NoticeManager';
import { AdminSupport } from './AdminSupport';

// Shared Components
const ImageUploader = ({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
            onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, [onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
            'image/gif': ['.gif']
        },
        multiple: false 
    } as any);

    return (
        <div className="space-y-4">
            <label className="text-[8px] uppercase tracking-widest opacity-40">{label}</label>
            <div 
                {...getRootProps()} 
                className={`border-2 border-dashed transition-all cursor-pointer rounded-2xl flex flex-col items-center justify-center p-8 ${
                    isDragActive ? 'border-gold bg-gold/10' : 'border-gold/20 hover:border-gold/40 bg-gold/5'
                }`}
            >
                <input {...getInputProps()} />
                {value ? (
                    <div className="relative group w-full aspect-video">
                        <img src={value} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                            <span className="text-white text-[10px] uppercase font-bold tracking-widest">Change Image</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-gold/40">
                        <Upload size={32} className="mb-4" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Drag & Drop Image</span>
                        <span className="text-[8px] opacity-60 mt-1 italic">or click to browse</span>
                    </div>
                )}
            </div>
            <div className="flex space-x-2">
                <input 
                    type="text" 
                    placeholder="Or paste image URL..." 
                    className="flex-grow bg-transparent border-b border-gold/20 outline-none pb-1 text-xs italic"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                {value && <button onClick={() => onChange('')} className="text-rose opacity-40 hover:opacity-100 transition-opacity"><X size={14} /></button>}
            </div>
        </div>
    );
};

// Sub-components
const DashboardOverview = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <div className="animate-pulse text-[10px] uppercase tracking-[0.5em] text-gold">Synchronizing Analytics Vault...</div>
        </div>
    );
    
    if (!stats) return <div className="text-center py-20 opacity-40 italic">Failed to retrieve analytics.</div>;

    const cards = [
        { name: 'Total Revenue', value: `৳${stats.totalRevenue.toLocaleString()}`, icon: BarChart3, color: 'text-gold' },
        { name: 'Active Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-gold' },
        { name: 'Open Support', value: stats.openTickets, icon: MessageSquare, color: 'text-gold' },
        { name: 'Active Citizens', value: stats.totalUsers, icon: Users, color: 'text-gold' },
    ];

    return (
        <div className="space-y-16 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-display mb-2">Operational Insight</h2>
                    <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Real-time performance metrics</p>
                </div>
                <button onClick={fetchStats} className="text-[10px] uppercase tracking-widest font-bold border-b border-gold/50 pb-1 hover:border-gold transition-colors">Refresh Feed</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {cards.map((card) => (
                    <div key={card.name} className="p-8 bg-white dark:bg-gold/5 border border-gold/10 dark:border-gold/20 rounded-3xl hover:border-gold/40 transition-all group shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className={`p-4 bg-white dark:bg-obsidian rounded-2xl ${card.color}`}>
                                <card.icon size={24} strokeWidth={1.5} />
                            </div>
                            <div className="text-[10px] font-bold tracking-widest opacity-20 group-hover:opacity-100 transition-opacity uppercase">Live</div>
                        </div>
                        <h3 className="text-xs uppercase tracking-widest opacity-60 mb-2 font-bold">{card.name}</h3>
                        <p className="text-4xl font-display italic tracking-tight">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 p-10 bg-white dark:bg-gold/5 border border-gold/10 dark:border-gold/20 rounded-[2.5rem] relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <BarChart3 size={120} />
                    </div>
                    <h3 className="font-display text-2xl mb-12 border-b border-gold/10 pb-4 italic">Revenue Trajectory</h3>
                    <div className="h-[300px] flex items-end justify-between space-x-1 sm:space-x-4">
                        {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85, 45, 100, 80, 60, 40, 70, 90, 100, 80, 50, 40, 70, 90, 100, 80, 60, 40, 70, 90, 100].map((h, i) => (
                            <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.02 }}
                                    className="bg-gold/20 group-hover:bg-gold transition-colors rounded-t-sm w-full"
                                />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gold text-obsidian px-2 py-1 rounded">৳{Math.floor(h * 1.5)}k</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-8 text-[8px] uppercase tracking-widest opacity-40 font-bold italic">
                        <span>30 Days Ago</span>
                        <span>Mid Cycle</span>
                        <span>Current Period</span>
                    </div>
                </div>

                <div className="p-10 bg-white dark:bg-gold/5 border border-gold/10 dark:border-gold/20 rounded-[2.5rem] shadow-sm">
                    <h3 className="font-display text-2xl mb-10 border-b border-gold/10 pb-4 italic">Inventory Distribution</h3>
                    <div className="space-y-10">
                        {[
                            { name: 'Jewelry', val: 85 },
                            { name: 'Luxury Bags', val: 62 },
                            { name: 'Traditional', val: 94 },
                            { name: 'Fragrances', val: 41 },
                        ].map((cat, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">{cat.name}</span>
                                    <span className="text-[10px] font-mono text-gold">{cat.val}%</span>
                                </div>
                                <div className="h-1 bg-gold/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${cat.val}%` }}
                                        className="h-full bg-gold"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-gold/10 text-center">
                        <button className="text-[8px] uppercase font-bold tracking-[0.4em] text-gold/40 hover:text-gold transition-colors">Manage Full Catalog</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

    const ProductManager = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [pRes, cRes] = await Promise.all([
                api.get('/admin/products'),
                api.get('/admin/categories')
            ]);
            setProducts(pRes.data.products || []);
            setCategories(cRes.data.categories || []);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to retrieve inventory vault');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const filteredProducts = products.filter(p => {
        const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.category_name === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const toggleFeatured = async (id: number) => {
        try {
            await api.patch(`/admin/products/${id}/featured`, {});
            fetchAll();
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
            fetchAll();
            alert('Success');
        } catch (err) { alert('Failed to save'); }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="font-display text-4xl italic">Luxury Collection</h2>
                <button 
                  onClick={() => setEditingProduct({ name: '', brand: '', base_price: 0, sale_price: 0, stock_qty: 0, image_url: '', category_id: categories[0]?.id || 1, is_featured: 0 })}
                  className="bg-gold text-obsidian px-6 py-2 text-[10px] uppercase font-bold tracking-widest rounded-full hover:bg-white transition-colors"
                >
                    + New Treasure
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <input 
                    type="text" 
                    placeholder="Search by name or brand..." 
                    className="bg-white dark:bg-transparent border border-gold/30 dark:border-gold/20 px-4 py-2 text-xs outline-none focus:border-gold transition-colors italic w-full md:w-96 rounded-full shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select 
                    className="bg-white dark:bg-transparent border border-gold/30 dark:border-gold/20 px-4 py-2 text-[10px] uppercase font-bold tracking-widest outline-none rounded-full shadow-sm"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                >
                    <option value="all" className="bg-ivory dark:bg-obsidian">All Houses</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.name} className="bg-ivory dark:bg-obsidian">{cat.name}</option>
                    ))}
                </select>
            </div>

            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 backdrop-blur-md p-4">
                    <form onSubmit={handleSave} className="glass p-12 border border-gold/20 max-w-4xl w-full space-y-8 max-h-[90vh] overflow-y-auto rounded-3xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="font-display text-4xl italic">Refining Item</h3>
                            <button type="button" onClick={() => setEditingProduct(null)} className="p-2 bg-gold/10 rounded-full hover:bg-gold/20 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <ImageUploader 
                                    label="Product Visual"
                                    value={editingProduct.image_url}
                                    onChange={(val) => setEditingProduct({...editingProduct, image_url: val})}
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[8px] uppercase tracking-widest opacity-40">Item Name</label>
                                    <input className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] uppercase tracking-widest opacity-40">Brand House</label>
                                    <input className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" value={editingProduct.brand} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[8px] uppercase tracking-widest opacity-40">Base Value (৳)</label>
                                        <input type="number" className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" value={editingProduct.base_price} onChange={e => setEditingProduct({...editingProduct, base_price: parseFloat(e.target.value)})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] uppercase tracking-widest opacity-40">Sale Value (৳)</label>
                                        <input type="number" className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" value={editingProduct.sale_price} onChange={e => setEditingProduct({...editingProduct, sale_price: parseFloat(e.target.value)})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[8px] uppercase tracking-widest opacity-40">Inventory Count</label>
                                        <input type="number" className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" value={editingProduct.stock_qty} onChange={e => setEditingProduct({...editingProduct, stock_qty: parseInt(e.target.value)})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] uppercase tracking-widest opacity-40">House Category</label>
                                        <select 
                                            className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl"
                                            value={editingProduct.category_id}
                                            onChange={e => setEditingProduct({...editingProduct, category_id: parseInt(e.target.value)})}
                                        >
                                            {categories.map(c => <option key={c.id} value={c.id} className="bg-ivory dark:bg-obsidian">{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full bg-gold text-obsidian py-5 uppercase font-bold tracking-[0.3em] text-[10px] hover:bg-ivory transition-all rounded-full shadow-2xl shadow-gold/20">
                            Commit Changes to Vault
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="py-20 text-center opacity-40 animate-pulse uppercase tracking-[0.5em] text-[10px]">Retrieving inventory data...</div>
            ) : error ? (
                <div className="p-8 border border-rose/20 bg-rose/5 rounded-2xl text-center text-rose">
                    <p className="mb-4">{error}</p>
                    <button onClick={fetchAll} className="px-4 py-2 bg-gold text-obsidian rounded-full text-[10px] uppercase font-bold tracking-widest">Retry</button>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="py-20 text-center opacity-40 italic">No products found in the database.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gold/20 text-[10px] uppercase tracking-widest opacity-40">
                                <th className="pb-4">Visual</th>
                                <th className="pb-4">Item</th>
                                <th className="pb-4">Value</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredProducts.map(p => (
                                <tr key={p.id} className="border-b border-gold/5 group hover:bg-gold/5 transition-colors">
                                    <td className="py-4">
                                        <img src={p.image_url} alt={p.name} className="h-16 w-12 object-cover bg-white/10 rounded-lg shadow-lg border border-gold/10" />
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-display text-xl tracking-tight leading-tight">{p.name}</span>
                                            <span className="text-[8px] uppercase tracking-widest opacity-40 mt-1">{p.brand} &bull; {p.category_name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gold">৳{(p.sale_price || p.base_price).toLocaleString()}</span>
                                            {p.sale_price && <span className="text-[10px] line-through opacity-40 leading-none">৳{p.base_price.toLocaleString()}</span>}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <button 
                                            onClick={() => toggleFeatured(p.id)}
                                            className={`px-3 py-1 text-[8px] uppercase tracking-widest font-bold rounded-full transition-all ${p.is_featured ? 'bg-gold text-obsidian' : 'border border-gold/30 opacity-40 hover:opacity-100'}`}
                                        >
                                            {p.is_featured ? 'Featured' : 'Standard'}
                                        </button>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex space-x-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingProduct(p)} className="hover:text-gold uppercase text-[10px] font-bold tracking-widest">Refine</button>
                                            <button className="hover:text-rose-500 uppercase text-[10px] font-bold tracking-widest">Expunge</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

    const CategoryManager = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/categories');
            setCategories(res.data.categories || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing.id) await api.put(`/admin/categories/${editing.id}`, editing);
            else await api.post(`/admin/categories`, editing);
            setEditing(null);
            fetchCategories();
            alert('House Updated');
        } catch (err) { alert('Update failed'); }
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-center">
                <h2 className="font-display text-4xl italic">Luxury Houses</h2>
                <button onClick={() => setEditing({ name: '', slug: '', image_url: '', sort_order: 1 })} className="bg-gold text-obsidian px-6 py-2 text-[10px] uppercase font-bold tracking-widest rounded-full">Add Category</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 text-center opacity-40 animate-pulse text-[10px] uppercase tracking-widest">Opening vaults...</div>
                ) : categories.length === 0 ? (
                    <div className="col-span-full py-20 text-center opacity-40 italic">No luxury houses established yet.</div>
                ) : (
                    categories.map(cat => (
                        <div key={cat.id} className="glass border border-gold/10 p-6 rounded-2xl relative overflow-hidden group bg-white dark:bg-gold/5">
                            <img src={cat.image_url} className="absolute inset-0 w-full h-full object-cover opacity-20 transition-transform duration-1000 group-hover:scale-110" />
                            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                <span className="text-[8px] uppercase tracking-[0.5em] text-gold/60 italic">House {cat.sort_order}</span>
                                <h3 className="font-display text-3xl">{cat.name}</h3>
                                <div className="flex space-x-4 pt-4">
                                    <button onClick={() => setEditing(cat)} className="text-[9px] uppercase tracking-widest font-bold border border-gold/40 px-4 py-1 rounded-full hover:bg-gold hover:text-obsidian transition-colors">Modify House</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 backdrop-blur-md p-4">
                    <form onSubmit={handleSave} className="glass p-12 border border-gold/20 max-w-xl w-full space-y-8 rounded-3xl">
                        <h3 className="font-display text-3xl italic">House Configuration</h3>
                        <div className="space-y-6">
                            <ImageUploader label="House Background" value={editing.image_url} onChange={(val) => setEditing({...editing, image_url: val})} />
                            <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest opacity-40">House Name</label>
                                <input className="bg-transparent border-b border-gold/20 w-full outline-none py-2 italic font-display text-xl" value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[8px] uppercase tracking-widest opacity-40">Internal Slug</label>
                                    <input className="bg-transparent border-b border-gold/20 w-full outline-none py-1 italic font-display text-sm" value={editing.slug} onChange={e => setEditing({...editing, slug: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] uppercase tracking-widest opacity-40">Priority Order</label>
                                    <input type="number" className="bg-transparent border-b border-gold/20 w-full outline-none py-1 italic font-display text-sm" value={editing.sort_order} onChange={e => setEditing({...editing, sort_order: parseInt(e.target.value)})} />
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button type="submit" className="flex-grow bg-gold text-obsidian py-4 uppercase font-bold tracking-widest text-[10px] rounded-full">Save Changes</button>
                            <button type="button" onClick={() => setEditing(null)} className="px-8 border border-gold/20 uppercase font-bold tracking-widest text-[10px] rounded-full">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

    const BannerManager = () => {
    const [banners, setBanners] = useState([]);
    const [editing, setEditing] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/banners');
            setBanners(res.data.banners || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBanners(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing.id) await api.put(`/admin/banners/${editing.id}`, editing);
            else await api.post(`/admin/banners`, editing);
            setEditing(null);
            fetchBanners();
            alert('Banner Updated');
        } catch (err) { alert('Update failed'); }
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-center">
                <h2 className="font-display text-4xl italic">Ad Banners</h2>
                <button onClick={() => setEditing({ title: '', subtitle: '', cta_text: 'Shop Now', cta_link: '/', image_url: '', sort_order: 1 })} className="bg-gold text-obsidian px-6 py-2 text-[10px] uppercase font-bold tracking-widest rounded-full">New Ad</button>
            </div>

            <div className="space-y-8">
                {loading ? (
                    <div className="py-20 text-center opacity-40 animate-pulse text-[10px] uppercase tracking-widest">Synchronizing Banners...</div>
                ) : banners.length === 0 ? (
                    <div className="py-20 text-center opacity-40 italic">No marketing banners configured.</div>
                ) : (
                    banners.map((b: any) => (
                        <div key={b.id} className="glass p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-center bg-white dark:bg-gold/5 border border-gold/20 shadow-sm">
                            <img src={b.image_url} className="h-32 w-56 object-cover rounded-xl shadow-lg border border-gold/10" />
                            <div className="flex-grow text-center md:text-left">
                                <h3 className="font-display text-2xl mb-1">{b.title}</h3>
                                <p className="text-xs opacity-60 italic">{b.subtitle}</p>
                                <div className="flex space-x-4 mt-4 opacity-40">
                                    <span className="text-[8px] uppercase tracking-widest">CTA: {b.cta_text}</span>
                                    <span className="text-[8px] uppercase tracking-widest">Link: {b.cta_link}</span>
                                </div>
                            </div>
                            <button onClick={() => setEditing(b)} className="text-[10px] uppercase font-bold tracking-widest bg-gold/10 hover:bg-gold hover:text-obsidian px-6 py-2 rounded-full transition-all">Edit Ad</button>
                        </div>
                    ))
                )}
            </div>

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 backdrop-blur-md p-4">
                    <form onSubmit={handleSave} className="glass p-12 border border-gold/20 max-w-4xl w-full space-y-8 rounded-3xl">
                        <h3 className="font-display text-3xl italic">Ad Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <ImageUploader label="Banner Visual (Full Width Recommended)" value={editing.image_url} onChange={(val) => setEditing({...editing, image_url: val})} />
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[8px] uppercase tracking-widest opacity-40">Main Headline</label>
                                    <input className="bg-transparent border-b border-gold/20 w-full outline-none py-1 font-display text-xl" value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] uppercase tracking-widest opacity-40">Supporting Text</label>
                                    <textarea className="bg-transparent border border-gold/20 w-full outline-none p-2 italic text-sm rounded-lg" rows={3} value={editing.subtitle} onChange={e => setEditing({...editing, subtitle: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[8px] uppercase tracking-widest opacity-40">Button Text</label>
                                        <input className="bg-transparent border-b border-gold/20 w-full outline-none py-1 text-xs" value={editing.cta_text} onChange={e => setEditing({...editing, cta_text: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] uppercase tracking-widest opacity-40">Order</label>
                                        <input type="number" className="bg-transparent border-b border-gold/20 w-full outline-none py-1 text-xs" value={editing.sort_order} onChange={e => setEditing({...editing, sort_order: parseInt(e.target.value)})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] uppercase tracking-widest opacity-40">Link Destination</label>
                                    <input className="bg-transparent border-b border-gold/20 w-full outline-none py-1 text-xs" value={editing.cta_link} onChange={e => setEditing({...editing, cta_link: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button type="button" onClick={() => setEditing(null)} className="px-8 border border-gold/20 uppercase font-bold tracking-widest text-[10px] rounded-full">Cancel</button>
                            <button type="submit" className="bg-gold text-obsidian px-12 py-4 uppercase font-bold tracking-widest text-[10px] rounded-full">Save Creative</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

    const OrderManager = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/orders');
            setOrders(res.data.orders || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const updateStatus = async (id: number, status: string) => {
        await api.patch(`/admin/orders/${id}/status`, { status });
        fetchOrders();
    };

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
                    <div key={o.id} className="glass p-6 border border-gold/10 flex flex-col md:flex-row justify-between items-center gap-6 rounded-2xl bg-gold/5">
                        <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                            <div>
                                <span className="text-[8px] uppercase tracking-widest opacity-40 block mb-1 dark:opacity-40">Order Ref</span>
                                <span className="font-mono text-sm opacity-90">#{o.order_number}</span>
                            </div>
                            <div>
                                <span className="text-[8px] uppercase tracking-widest opacity-40 block mb-1 dark:opacity-40">Client</span>
                                <span className="text-sm italic font-display opacity-90">{o.customer_name}</span>
                            </div>
                            <div>
                                <span className="text-[8px] uppercase tracking-widest opacity-40 block mb-1 dark:opacity-40">Total Value</span>
                                <span className="font-bold opacity-90">৳{o.total.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-[8px] uppercase tracking-widest opacity-40 block mb-1 dark:opacity-40">Acquisition Status</span>
                                <select 
                                    value={o.status} 
                                    onChange={(e) => updateStatus(o.id, e.target.value)}
                                    className="bg-transparent text-[10px] uppercase font-bold text-gold outline-none cursor-pointer"
                                >
                                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                        <option key={s} value={s} className="bg-ivory dark:bg-obsidian">{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Link to={`/account`} className="text-[10px] uppercase tracking-widest font-bold border border-gold/20 px-4 py-2 hover:bg-gold hover:text-obsidian transition-all rounded-full">Inspect</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UserManager = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users');
            setUsers(res.data.users || []);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to retrieve connection to citizen registry');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const toggleRole = async (id: number, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'customer' : 'admin';
        if (!confirm(`Are you sure you want to change this citizen to ${newRole}?`)) return;
        
        try {
            await api.patch(`/admin/users/${id}/role`, { role: newRole });
            fetchUsers();
        } catch (err) {
            alert('Failed to update privilege');
        }
    };

    return (
        <div className="space-y-12">
            <div className="space-y-4">
                <h2 className="font-display text-4xl italic">Maison Citizens</h2>
                <p className="text-[10px] uppercase tracking-widest opacity-40">Registered members of the GOLO Private Collection</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    <div className="animate-pulse text-[10px] uppercase tracking-widest opacity-40">Retrieving citizen registry...</div>
                </div>
            ) : error ? (
                <div className="glass p-12 text-center border-rose/20 rounded-3xl bg-rose/5">
                    <p className="text-rose font-display text-xl mb-4">{error}</p>
                    <button onClick={fetchUsers} className="text-[10px] uppercase tracking-widest px-6 py-2 bg-gold text-obsidian rounded-full font-bold">Retry Synchronization</button>
                </div>
            ) : users.length === 0 ? (
                <div className="py-20 text-center opacity-40 italic">No citizens registered in the collection.</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {users.map(u => (
                        <div key={u.id} className="glass p-6 border border-gold/10 dark:border-gold/20 flex items-center justify-between gap-6 rounded-2xl group transition-all hover:bg-gold/5 bg-white dark:bg-gold/5 shadow-sm">
                            <div className="flex items-center space-x-6">
                                <div className="h-16 w-16 bg-gold/10 rounded-full border border-gold/20 flex items-center justify-center overflow-hidden">
                                    {u.avatar_url ? (
                                        <img src={u.avatar_url} alt={u.full_name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Users size={32} className="text-gold/20" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-display text-2xl tracking-tight leading-none text-obsidian dark:text-ivory">{u.full_name}</h3>
                                    <div className="flex items-center space-x-3 mt-2">
                                        <span className="text-[9px] uppercase tracking-widest opacity-40 italic text-obsidian dark:text-ivory">{u.email}</span>
                                        <div className="h-1 w-1 bg-gold/20 rounded-full" />
                                        <span className="text-[9px] uppercase tracking-widest opacity-60 text-obsidian dark:text-ivory">ID: {u.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-8">
                                <div className="text-right">
                                    <span className="text-[8px] uppercase tracking-widest opacity-40 block mb-1">Status</span>
                                    <button 
                                        onClick={() => toggleRole(u.id, u.role)}
                                        className={`px-4 py-1.5 text-[9px] uppercase tracking-widest font-bold rounded-full transition-all ${
                                            u.role === 'admin' ? 'bg-gold text-obsidian shadow-lg shadow-gold/20' : 'border border-gold/20 opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        {u.role === 'admin' ? 'Authority' : 'Citizen'}
                                    </button>
                                </div>
                                <div className="hidden md:block text-right">
                                    <span className="text-[8px] uppercase tracking-widest opacity-40 block mb-1">Joined</span>
                                    <span className="text-[10px] font-mono opacity-40 text-obsidian dark:text-ivory">{new Date(u.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'admin') return <Navigate to="/auth/login" />;

  const menu = [
    { name: 'Analytics', path: '', icon: LayoutDashboard },
    { name: 'Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Products', path: '/products', icon: Tag },
    { name: 'Categories', path: '/categories', icon: ImageIcon },
    { name: 'Banners', path: '/banners', icon: ImageIcon },
    { name: 'Notices', path: '/notices', icon: Megaphone },
    { name: 'Support', path: '/support', icon: HelpCircle },
    { name: 'Citizens', path: '/users', icon: Users },
  ];

  const currentSection = location.pathname.split('/').pop() || 'admin';

  return (
    <div className="min-h-screen pt-40 pb-20 bg-ivory dark:bg-obsidian text-obsidian dark:text-ivory relative overflow-hidden transition-colors duration-500">
      {/* Texture Overlay */}
      <div className="fixed inset-0 grain-overlay z-[100] pointer-events-none opacity-[0.04]" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-6 gap-12 relative z-10">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-16">
            <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-2 h-2 bg-gold animate-pulse rounded-full" />
                    <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">Maison Active</span>
                </div>
                <h1 className="font-display text-5xl lg:text-6xl italic leading-none">Console</h1>
                <div className="h-[1px] w-12 bg-gold/30" />
            </div>

            <nav className="flex flex-col space-y-3">
                {menu.map((item) => {
                    const isActive = (item.path === '' && location.pathname === '/admin') || 
                                   (item.path !== '' && location.pathname === `/admin${item.path}`);
                    return (
                        <Link 
                            key={item.name} 
                            to={`/admin${item.path}`}
                            className={`flex items-center space-x-5 p-5 text-[10px] uppercase font-bold tracking-[0.3em] transition-all rounded-2xl relative group overflow-hidden ${
                                isActive ? 'text-obsidian' : 'opacity-40 hover:opacity-100'
                            }`}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="active-bar"
                                    className="absolute inset-0 bg-gold z-0"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <item.icon size={16} className="relative z-10" />
                            <span className="relative z-10">{item.name}</span>
                        </Link>
                    );
                })}
                <div className="pt-12 border-t border-gold/10 mt-12">
                    <button 
                    onClick={logout}
                    className="flex items-center space-x-5 p-5 text-[10px] uppercase font-bold tracking-[0.3em] text-rose/60 hover:text-rose transition-all w-full text-left"
                    >
                        <LogOut size={16} />
                        <span>Terminate Session</span>
                    </button>
                </div>
            </nav>
        </aside>

        {/* Content */}
        <main className="lg:col-span-5 p-16 bg-white dark:bg-obsidian/60 dark:backdrop-blur-md border border-gold/20 dark:border-white/10 rounded-[3rem] shadow-xl shadow-obsidian/5 dark:shadow-black/80 relative">
            {/* Interior Glow */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
            <Routes>
                <Route path="/" element={<DashboardOverview />} />
                <Route path="/orders" element={<OrderManager />} />
                <Route path="/products" element={<ProductManager />} />
                <Route path="/categories" element={<CategoryManager />} />
                <Route path="/banners" element={<BannerManager />} />
                <Route path="/notices" element={<NoticeManager />} />
                <Route path="/support" element={<AdminSupport />} />
                <Route path="/users" element={<UserManager />} />
                <Route path="*" element={<Navigate to="/admin" />} />
            </Routes>
        </main>
      </div>
    </div>
  );
}
