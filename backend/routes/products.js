import express from 'express';
import { supabase } from '../lib/supabase.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { category, search, sort, limit = 40, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('products')
      .select('*, categories!inner(name, slug)', { count: 'exact' })
      .eq('is_active', true);

    if (category) {
      // Check if it's a slug or ID
      if (isNaN(parseInt(category))) {
        query = query.eq('categories.slug', category);
      } else {
        query = query.eq('category_id', parseInt(category));
      }
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (sort === 'price_asc') {
      query = query.order('base_price', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('base_price', { ascending: false });
    } else if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    }

    const { data: products, count, error: supabaseError } = await query
      .range(offset, offset + parseInt(limit) - 1);

    if (supabaseError) throw supabaseError;

    // Flatten category name for compatibility with frontend
    const cleanedProducts = products.map(p => ({
      ...p,
      category_name: p.categories.name
    }));
    
    success(res, 'Products fetched', { 
      products: cleanedProducts, 
      total: count, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });
  } catch (err) {
    error(res, err.message);
  }
});

router.get('/featured', async (req, res) => {
  try {
    const { data: products, error: supabaseError } = await supabase
      .from('products')
      .select('*, categories!inner(name)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(12);

    if (supabaseError) throw supabaseError;

    const cleanedProducts = products.map(p => ({
      ...p,
      category_name: p.categories.name
    }));

    success(res, 'Featured products fetched', { products: cleanedProducts });
  } catch (err) {
    error(res, err.message);
  }
});

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

router.get('/:slug', async (req, res) => {
  try {
    const { data: product, error: supabaseError } = await supabase
      .from('products')
      .select('*, categories!inner(name), product_variants(*), reviews(*, users(full_name))')
      .eq('slug', req.params.slug)
      .single();

    if (supabaseError) throw supabaseError;
    
    // Formatting for frontend compatibility
    const formattedProduct = {
      ...product,
      category_name: product.categories.name,
      variants: product.product_variants,
      reviews: product.reviews.filter(r => r.is_approved).map(r => ({
        ...r,
        user_name: r.users.full_name
      }))
    };

    success(res, 'Product fetched', { product: formattedProduct });
  } catch (err) {
    error(res, err.message);
  }
});

export default router;
