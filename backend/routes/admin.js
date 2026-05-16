import express from 'express';
import { supabase } from '../lib/supabase.js';
import db from '../db.js';
import { authGuard, roleGuard } from '../middleware/auth.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

router.use(authGuard);
router.use(roleGuard('admin'));

router.get('/products', async (req, res) => {
  try {
    const { data: products, error: supabaseError } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });

    if (supabaseError) throw supabaseError;

    const cleanedProducts = products.map(p => ({
      ...p,
      category_name: p.categories?.name || 'Uncategorized'
    }));

    success(res, 'All products fetched', { products: cleanedProducts });
  } catch (err) {
    error(res, err.message);
  }
});

router.patch('/products/:id/featured', async (req, res) => {
  try {
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('is_featured')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ is_featured: !product.is_featured })
      .eq('id', req.params.id);

    if (updateError) throw updateError;
    success(res, 'Product featured status toggled');
  } catch (err) {
    error(res, err.message);
  }
});

router.post('/products', async (req, res) => {
  const { name, brand, base_price, sale_price, stock_qty, image_url, category_id, is_featured } = req.body;
  const slug = (name || 'new-product').toLowerCase().replace(/ /g, '-') + '-' + Date.now();
  
  try {
    const { error: supabaseError } = await supabase
      .from('products')
      .insert([{
        name,
        slug,
        brand,
        base_price,
        sale_price: sale_price || null,
        stock_qty,
        image_url,
        category_id,
        is_featured: !!is_featured
      }]);

    if (supabaseError) throw supabaseError;
    success(res, 'Product created', {}, 201);
  } catch (err) {
    error(res, err.message);
  }
});

router.put('/products/:id', async (req, res) => {
  const { name, brand, base_price, sale_price, stock_qty, image_url, category_id, is_featured } = req.body;
  
  try {
    const { error: supabaseError } = await supabase
      .from('products')
      .update({
        name,
        brand,
        base_price,
        sale_price: sale_price || null,
        stock_qty,
        image_url,
        category_id,
        is_featured: !!is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id);

    if (supabaseError) throw supabaseError;
    success(res, 'Product updated');
  } catch (err) {
    error(res, err.message);
  }
});

// Categories
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error: supabaseError } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (supabaseError) throw supabaseError;
    success(res, 'Categories fetched', { categories });
  } catch (err) {
    error(res, err.message);
  }
});

router.post('/categories', async (req, res) => {
  const { name, slug, image_url, sort_order } = req.body;
  try {
    const { error: supabaseError } = await supabase
      .from('categories')
      .insert([{ name, slug: slug || name.toLowerCase().replace(/ /g, '-'), image_url, sort_order }]);
    if (supabaseError) throw supabaseError;
    success(res, 'Category created', {}, 201);
  } catch (err) {
    error(res, err.message);
  }
});

router.put('/categories/:id', async (req, res) => {
  const { name, slug, image_url, sort_order } = req.body;
  try {
    const { error: supabaseError } = await supabase
      .from('categories')
      .update({ name, slug, image_url, sort_order })
      .eq('id', req.params.id);
    if (supabaseError) throw supabaseError;
    success(res, 'Category updated');
  } catch (err) {
    error(res, err.message);
  }
});

// Banners
router.get('/banners', async (req, res) => {
  try {
    const { data: banners, error: supabaseError } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });
    if (supabaseError) throw supabaseError;
    success(res, 'Banners fetched', { banners });
  } catch (err) {
    error(res, err.message);
  }
});

router.post('/banners', async (req, res) => {
  try {
    const { error: supabaseError } = await supabase
      .from('banners')
      .insert([req.body]);
    if (supabaseError) throw supabaseError;
    success(res, 'Banner created', {}, 201);
  } catch (err) {
    error(res, err.message);
  }
});

router.put('/banners/:id', async (req, res) => {
  try {
    const { error: supabaseError } = await supabase
      .from('banners')
      .update(req.body)
      .eq('id', req.params.id);
    if (supabaseError) throw supabaseError;
    success(res, 'Banner updated');
  } catch (err) {
    error(res, err.message);
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [usersCount, productsCount, ordersCount, revenueResult, pendingCount] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total').neq('status', 'cancelled'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    const supportCount = db.prepare('SELECT count(*) as count FROM support_tickets WHERE status = "open"').get();

    const totalRevenue = revenueResult.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    success(res, 'Admin stats fetched', {
      totalUsers: usersCount.count || 0,
      totalProducts: productsCount.count || 0,
      totalOrders: ordersCount.count || 0,
      totalRevenue,
      pendingOrders: pendingCount.count || 0,
      openTickets: supportCount.count || 0
    });
  } catch (err) {
    error(res, err.message);
  }
});

router.get('/orders', async (req, res) => {
  try {
    const { data: orders, error: supabaseError } = await supabase
      .from('orders')
      .select('*, users(full_name)')
      .order('placed_at', { ascending: false });

    if (supabaseError) throw supabaseError;

    const cleanedOrders = orders.map(o => ({
      ...o,
      customer_name: o.users?.full_name || 'Anonymous Client'
    }));

    success(res, 'All orders fetched', { orders: cleanedOrders });
  } catch (err) {
    error(res, err.message);
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const { error: supabaseError } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (supabaseError) throw supabaseError;
    success(res, 'Order status updated');
  } catch (err) {
    error(res, err.message);
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const { data: users, error: supabaseError } = await supabase
      .from('users')
      .select('id, full_name, email, role, avatar_url, created_at')
      .order('created_at', { ascending: false });

    if (supabaseError) throw supabaseError;
    success(res, 'All users fetched', { users });
  } catch (err) {
    error(res, err.message);
  }
});

router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  try {
    const { error: supabaseError } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (supabaseError) throw supabaseError;
    success(res, 'User role updated');
  } catch (err) {
    error(res, err.message);
  }
});

// Notice Management
router.get('/notices', (req, res) => {
  try {
    const notices = db.prepare('SELECT * FROM notices ORDER BY created_at DESC').all();
    success(res, 'All notices fetched', { notices });
  } catch (err) {
    error(res, err.message);
  }
});

router.post('/notices', (req, res) => {
  try {
    const { title, content, type, is_active } = req.body;
    db.prepare('INSERT INTO notices (title, content, type, is_active) VALUES (?, ?, ?, ?)').run(
      title, content, type || 'info', is_active ?? 1
    );
    success(res, 'Notice created', {}, 201);
  } catch (err) {
    error(res, err.message);
  }
});

router.put('/notices/:id', (req, res) => {
  try {
    const { title, content, type, is_active } = req.body;
    db.prepare('UPDATE notices SET title = ?, content = ?, type = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      title, content, type, is_active, req.params.id
    );
    success(res, 'Notice updated');
  } catch (err) {
    error(res, err.message);
  }
});

router.delete('/notices/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM notices WHERE id = ?').run(req.params.id);
    success(res, 'Notice deleted');
  } catch (err) {
    error(res, err.message);
  }
});

export default router;
