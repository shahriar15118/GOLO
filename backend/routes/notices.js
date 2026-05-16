import express from 'express';
import db from '../db.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const notices = db.prepare('SELECT * FROM notices WHERE is_active = 1 ORDER BY created_at DESC').all();
    success(res, 'Active notices fetched', { notices });
  } catch (err) {
    error(res, err.message);
  }
});

export default router;
