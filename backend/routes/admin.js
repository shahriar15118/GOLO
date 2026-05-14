import express from 'express';
import { supabase } from '../lib/supabase.js';
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

router.get('/stats', async (req, res) => {
  try {
    const [usersCount, productsCount, ordersCount, revenueResult, pendingCount] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total').neq('status', 'cancelled'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    const totalRevenue = revenueResult.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    success(res, 'Admin stats fetched', {
      totalUsers: usersCount.count || 0,
      totalProducts: productsCount.count || 0,
      totalOrders: ordersCount.count || 0,
      totalRevenue,
      pendingOrders: pendingCount.count || 0
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

export default router;
