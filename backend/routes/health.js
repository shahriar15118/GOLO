import express from 'express';
import { supabase } from '../lib/supabase.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

router.get('/db', async (req, res) => {
  try {
    const { data, error: supabaseError, count } = await supabase
      .from('categories')
      .select('*', { count: 'exact' });

    if (supabaseError) throw supabaseError;

    success(res, 'Database connection is active', { 
        connected: true,
        categoryCount: count,
        categories: data
    });
  } catch (err) {
    error(res, `Database connection failed: ${err.message}`, 500);
  }
});

router.get('/seed', async (req, res) => {
  try {
    // 1. Seed Categories
    const { error: catErr } = await supabase.from('categories').upsert([
      { name: 'Haute Couture', slug: 'clothing', sort_order: 1, image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070' },
      { name: 'Signature Bags', slug: 'bags', sort_order: 2, image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935' },
      { name: 'High Jewelry', slug: 'jewelry', sort_order: 3, image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070' },
      { name: 'Ethereal Scents', slug: 'perfumes', sort_order: 4, image_url: 'https://images.unsplash.com/photo-1557827983-012eb6ea8dc1?q=80&w=2070' },
      { name: 'Little Royals', slug: 'kids', sort_order: 5, image_url: 'https://images.unsplash.com/photo-1519704943920-ad9260a9d93d?q=80&w=2070' },
      { name: 'Maison Décor', slug: 'home', sort_order: 6, image_url: 'https://images.unsplash.com/photo-1513519247481-1685022f4645?q=80&w=2070' },
      { name: 'Horology', slug: 'watches', sort_order: 7, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070' },
      { name: 'Tech Avant-Garde', slug: 'gadgets', sort_order: 8, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070' }
    ], { onConflict: 'slug' });

    if (catErr) throw catErr;

    // 2. Seed Banners
    const { error: banErr } = await supabase.from('banners').upsert([
      { 
        title: 'The Silk Road Collection', 
        subtitle: 'Timeless elegance meets modern silhouettes.', 
        cta_text: 'Shop Now', 
        cta_link: '/products?category=clothing', 
        image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070',
        sort_order: 1 
      },
      { 
        title: 'Golden Hour Treasures', 
        subtitle: 'Hand-crafted jewelry for moments that matter.', 
        cta_text: 'Explore', 
        cta_link: '/products?category=jewelry', 
        image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070',
        sort_order: 2 
      },
      { 
        title: 'Aurelian Scents', 
        subtitle: 'The essence of pure luxury captured in a bottle.', 
        cta_text: 'Discover', 
        cta_link: '/products?category=perfumes', 
        image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2070',
        sort_order: 3 
      }
    ]);

    if (banErr) throw banErr;

    // 3. Seed Featured Products (Sample for each new category)
    const { data: categories } = await supabase.from('categories').select('id, slug');
    const products = [
        { slug: 'velvet-gown', name: 'Noir Velvet Evening Gown', price: 45000, cat: 'clothing', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974' },
        { slug: 'royal-watch', name: 'Aureate Chronograph', price: 125000, cat: 'watches', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070' },
        { slug: 'silk-cushion', name: 'Imperial Silk Cushion Set', price: 8500, cat: 'home', img: 'https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?q=80&w=1974' },
        { slug: 'titan-headphones', name: 'Titanium Acoustic Shells', price: 15000, cat: 'gadgets', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070' }
    ];

    for (const p of products) {
        const catId = categories?.find(c => c.slug === p.cat)?.id;
        if (catId) {
            await supabase.from('products').upsert([
                { 
                    category_id: catId, 
                    name: p.name, 
                    slug: p.slug, 
                    brand: 'GOLO Prive', 
                    base_price: p.price, 
                    is_featured: true, 
                    image_url: p.img 
                }
            ], { onConflict: 'slug' });
        }
    }

    res.send(`
        <html>
            <head><title>Seeding Successful | GOLO</title></head>
            <body style="font-family: serif; background: #0B0B0B; color: #D4AF37; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px;">
                <h1 style="font-size: 4rem; margin-bottom: 0.5rem; letter-spacing: 0.3em; font-weight: 300;">GOLO</h1>
                <div style="width: 60px; height: 1px; background: #D4AF37; margin-bottom: 2rem;"></div>
                <p style="font-size: 1.2rem; margin-bottom: 3rem; font-style: italic; opacity: 0.8;">The database has been enriched with the latest luxury collections.</p>
                <a href="/" style="color: #0B0B0B; background: #D4AF37; padding: 1.2rem 3rem; text-decoration: none; text-transform: uppercase; letter-spacing: 0.3em; font-size: 0.8rem; border: 1px solid #D4AF37; transition: all 0.3s ease;">Enter the Boutique</a>
                <p style="margin-top: 2rem; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5;">Haute Couture &bull; Horology &bull; Maison Décor</p>
            </body>
        </html>
    `);
  } catch (err) {
    res.status(500).send(`
        <html>
            <body style="font-family: sans-serif; background: #0B0B0B; color: #ff6b6b; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center;">
                <h1>Seeding Failed</h1>
                <p>${err.message}</p>
                <p style="color: #666; margin-top: 1rem;">Check your Supabase RLS Policies. Ensure the Service Role key is correctly set.</p>
                <a href="/" style="color: #D4AF37; margin-top: 2rem;">Back to Home</a>
            </body>
        </html>
    `);
  }
});

export default router;
