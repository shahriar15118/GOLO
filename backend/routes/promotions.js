import express from 'express';
import db from '../db.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

router.post('/validate', (req, res) => {
  const { code, amount } = req.body;
  try {
    const promo = db.prepare('SELECT * FROM promotions WHERE code = ? AND is_active = 1').get(code);
    if (!promo) return error(res, 'Invalid promotion code', 400);

    const now = new Date();
    if (promo.starts_at && new Date(promo.starts_at) > now) return error(res, 'Promotion not yet active', 400);
    if (promo.expires_at && new Date(promo.expires_at) < now) return error(res, 'Promotion expired', 400);
    if (promo.max_uses && promo.used_count >= promo.max_uses) return error(res, 'Promotion usage limit reached', 400);
    if (promo.min_order_amount && amount < promo.min_order_amount) return error(res, `Minimum order amount is ৳${promo.min_order_amount}`, 400);

    let discount = 0;
    if (promo.type === 'percentage') {
      discount = (amount * promo.value) / 100;
    } else {
      discount = promo.value;
    }

    success(res, 'Promotion applied', { discount, code: promo.code, type: promo.type, value: promo.value });
  } catch (err) {
    error(res, err.message);
  }
});

export default router;
