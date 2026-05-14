import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authGuard } from '../middleware/auth.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

router.use(authGuard);

router.get('/me', async (req, res) => {
  try {
    const { data: user, error: supabaseError } = await supabase
      .from('users')
      .select('id, full_name, email, role, phone, avatar_url, created_at')
      .eq('id', req.user.id)
      .single();

    if (supabaseError) throw supabaseError;
    success(res, 'User profile fetched', { user });
  } catch (err) {
    error(res, err.message);
  }
});

router.put('/profile', async (req, res) => {
  const { full_name, phone, avatar_url } = req.body;
  try {
    const { error: supabaseError } = await supabase
      .from('users')
      .update({ 
        full_name, 
        phone, 
        avatar_url, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', req.user.id);

    if (supabaseError) throw supabaseError;
    success(res, 'Profile updated');
  } catch (err) {
    error(res, err.message);
  }
});

router.get('/addresses', async (req, res) => {
  try {
    const { data: addresses, error: supabaseError } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', req.user.id);

    if (supabaseError) throw supabaseError;
    success(res, 'Addresses fetched', { addresses });
  } catch (err) {
    error(res, err.message);
  }
});

router.post('/addresses', async (req, res) => {
  const { label, full_name, phone, line1, line2, city, district, country, is_default } = req.body;
  try {
    if (is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', req.user.id);
    }
    
    const { error: supabaseError } = await supabase
      .from('addresses')
      .insert([{
        user_id: req.user.id,
        label,
        full_name,
        phone,
        line1,
        line2,
        city,
        district,
        country,
        is_default: !!is_default
      }]);

    if (supabaseError) throw supabaseError;
    success(res, 'Address added', {}, 201);
  } catch (err) {
    error(res, err.message);
  }
});

router.get('/wishlist', async (req, res) => {
  try {
    const { data: wishlistItems, error: supabaseError } = await supabase
      .from('wishlist')
      .select('products(*)')
      .eq('user_id', req.user.id);

    if (supabaseError) throw supabaseError;
    
    // Flatten result
    const products = wishlistItems.map(item => item.products);
    
    success(res, 'Wishlist fetched', { products });
  } catch (err) {
    error(res, err.message);
  }
});

router.post('/wishlist/:pid', async (req, res) => {
  const pid = req.params.pid;
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', pid)
      .maybeSingle();

    if (existing) {
      const { error: deleteError } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', req.user.id)
        .eq('product_id', pid);
      if (deleteError) throw deleteError;
      success(res, 'Removed from wishlist', { wishlisted: false });
    } else {
      const { error: insertError } = await supabase
        .from('wishlist')
        .insert([{ user_id: req.user.id, product_id: pid }]);
      if (insertError) throw insertError;
      success(res, 'Added to wishlist', { wishlisted: true });
    }
  } catch (err) {
    error(res, err.message);
  }
});

export default router;
