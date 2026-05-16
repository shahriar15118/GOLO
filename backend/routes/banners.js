import express from 'express';
import { supabase } from '../lib/supabase.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data: banners, error: supabaseError } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (supabaseError) throw supabaseError;
    success(res, 'Banners fetched', { banners });
  } catch (err) {
    error(res, err.message);
  }
});

export default router;
