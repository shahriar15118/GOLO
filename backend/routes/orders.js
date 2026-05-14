import express from 'express';
import db from '../db.js';
import { authGuard } from '../middleware/auth.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

router.use(authGuard);

router.post('/', (req, res) => {
  const { address_id, items, discount, shipping, tax, total, promo_code, payment_method, notes } = req.body;
  const user_id = req.user.id;
  const order_number = `GOLO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const transaction = db.transaction(() => {
    // 1. Create order
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const result = db.prepare(`
      INSERT INTO orders (order_number, user_id, address_id, subtotal, discount, shipping, tax, total, promo_code, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(order_number, user_id, address_id, subtotal, discount, shipping, tax, total, promo_code, payment_method, notes);

    const order_id = result.lastInsertRowid;

    // 2. Create order items and update stock
    const itemStmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, variant_id, name, brand, image_url, quantity, unit_price, line_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const stockStmt = db.prepare('UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?');

    for (const item of items) {
      // Check stock
      const product = db.prepare('SELECT stock_qty FROM products WHERE id = ?').get(item.product_id);
      if (!product || product.stock_qty < item.quantity) {
        throw new Error(`Insufficient stock for product: ${item.name}`);
      }

      itemStmt.run(order_id, item.product_id, item.variant_id || null, item.name, item.brand, item.image_url, item.quantity, item.price, item.price * item.quantity);
      stockStmt.run(item.quantity, item.product_id);
    }

    return order_id;
  });

  try {
    const order_id = transaction();
    success(res, 'Order placed successfully', { order_id, order_number }, 201);
  } catch (err) {
    error(res, err.message, 400);
  }
});

router.get('/', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY placed_at DESC').all(req.user.id);
    success(res, 'Orders fetched', { orders });
  } catch (err) {
    error(res, err.message);
  }
});

router.get('/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return error(res, 'Order not found', 404);

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    order.items = items;

    success(res, 'Order details fetched', { order });
  } catch (err) {
    error(res, err.message);
  }
});

export default router;
