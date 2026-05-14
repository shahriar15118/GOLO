import express from 'express';
import db from '../db.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const banners = db.prepare('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC').all();
    success(res, 'Banners fetched', { banners });
  } catch (err) {
    error(res, err.message);
  }
});

export default router;
