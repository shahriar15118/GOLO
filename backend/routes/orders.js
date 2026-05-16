import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authGuard } from '../middleware/auth.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

router.use(authGuard);

router.post('/', async (req, res) => {
  const { address_id, items, discount, shipping, tax, total, promo_code, payment_method, notes } = req.body;
  const user_id = req.user.id;
  const order_number = `GOLO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // 1. Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number,
        user_id,
        address_id,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        promo_code,
        payment_method,
        notes,
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items and update stock
    for (const item of items) {
      // Check stock and decrement
      const { data: product, error: stockLockError } = await supabase
        .from('products')
        .select('stock_qty')
        .eq('id', item.product_id)
        .single();
      
      if (stockLockError) throw stockLockError;
      if (product.stock_qty < item.quantity) {
        throw new Error(`Insufficient stock for product: ${item.name}`);
      }

      const { error: itemError } = await supabase
        .from('order_items')
        .insert([{
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          name: item.name,
          brand: item.brand,
          image_url: item.image_url,
          quantity: item.quantity,
          unit_price: item.price,
          line_total: item.price * item.quantity
        }]);

      if (itemError) throw itemError;

      const { error: updateStockError } = await supabase
        .from('products')
        .update({ stock_qty: product.stock_qty - item.quantity })
        .eq('id', item.product_id);

      if (updateStockError) throw updateStockError;
    }

    success(res, 'Order placed successfully', { order_id: order.id, order_number }, 201);
  } catch (err) {
    error(res, err.message, 400);
  }
});

router.get('/', async (req, res) => {
  try {
    const { data: orders, error: supabaseError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('placed_at', { ascending: false });

    if (supabaseError) throw supabaseError;
    success(res, 'Orders fetched', { orders });
  } catch (err) {
    error(res, err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (orderError) throw orderError;
    
    // Format for frontend
    order.items = order.order_items;
    delete order.order_items;

    success(res, 'Order details fetched', { order });
  } catch (err) {
    error(res, err.message);
  }
});

export default router;
