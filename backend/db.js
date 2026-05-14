import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const db = new Database('golo.db');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      phone TEXT,
      avatar_url TEXT,
      token_version INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      token_hash TEXT NOT NULL,
      family_id TEXT NOT NULL,
      is_revoked INTEGER DEFAULT 0,
      user_agent TEXT,
      ip_address TEXT,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image_url TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (parent_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      brand TEXT,
      base_price REAL NOT NULL,
      sale_price REAL,
      stock_qty INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      image_url TEXT,
      images TEXT, -- JSON array
      attributes TEXT, -- JSON object
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      sku TEXT UNIQUE,
      attributes TEXT, -- JSON
      price_override REAL,
      stock_qty INTEGER DEFAULT 0,
      image_url TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      user_id INTEGER,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      body TEXT,
      verified_purchase INTEGER DEFAULT 0,
      is_approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      label TEXT,
      full_name TEXT,
      phone TEXT,
      line1 TEXT,
      line2 TEXT,
      city TEXT,
      district TEXT,
      country TEXT,
      is_default INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      product_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      address_id INTEGER,
      status TEXT DEFAULT 'pending',
      subtotal REAL,
      discount REAL,
      shipping REAL,
      tax REAL,
      total REAL,
      promo_code TEXT,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      notes TEXT,
      placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (address_id) REFERENCES addresses(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      variant_id INTEGER,
      name TEXT,
      brand TEXT,
      image_url TEXT,
      quantity INTEGER,
      unit_price REAL,
      line_total REAL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (variant_id) REFERENCES product_variants(id)
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL, -- percentage/fixed
      value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      max_uses INTEGER,
      used_count INTEGER DEFAULT 0,
      starts_at DATETIME,
      expires_at DATETIME,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      subtitle TEXT,
      cta_text TEXT,
      cta_link TEXT,
      image_url TEXT,
      bg_color TEXT,
      text_color TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      starts_at DATETIME,
      ends_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      user_id INTEGER,
      role TEXT NOT NULL, -- user/assistant
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      body TEXT,
      type TEXT,
      is_read INTEGER DEFAULT 0,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin
  const adminEmail = 'admin@golo.com';
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!existingAdmin) {
    const hash = bcrypt.hashSync('Admin@1234', 12);
    db.prepare('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
      'GOLO Admin',
      adminEmail,
      hash,
      'admin'
    );
  }

  // Seed categories if empty
  const categoryCount = db.prepare('SELECT count(*) as count FROM categories').get().count;
  if (categoryCount === 0) {
    const cats = [
      ['Clothing', 'clothing', 'https://images.unsplash.com/photo-1445205170230-053b83e2638c?q=80&w=800'],
      ['Jewelry', 'jewelry', 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?q=80&w=800'],
      ['Bags', 'bags', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800'],
      ['Gadgets', 'gadgets', 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=800'],
      ['Home', 'home', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800'],
      ['Kids', 'kids', 'https://images.unsplash.com/photo-1514090458221-65bb69af63e6?q=80&w=800'],
      ['Luxury', 'luxury', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800'],
      ['Perfumes', 'perfumes', 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800']
    ];
    const stmt = db.prepare('INSERT INTO categories (name, slug, image_url) VALUES (?, ?, ?)');
    cats.forEach(c => stmt.run(...c));
  }

  // Seed some products
  const productCount = db.prepare('SELECT count(*) as count FROM products').get().count;
  if (productCount === 0) {
    const products = [
      [1, 'Royal Silk Panjabi', 'royal-silk-panjabi', 'Traditional premium silk Panjabi for men.', 'GOLO Traditional', 5500, 4800, 50, 1, 'https://images.unsplash.com/photo-1598211686290-a8ef209d8aa5?w=800'],
      [1, 'Floral Summer Dress', 'floral-summer-dress', 'Light and elegant floral dress for summer outings.', 'GOLO Boutique', 3200, null, 30, 0, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'],
      [2, 'Diamond Halo Ring', 'diamond-halo-ring', '18k white gold ring with a brilliant cut diamond.', 'GOLO Luxury', 125000, 115000, 5, 1, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'],
      [3, 'Quilted Leather Tote', 'quilted-leather-tote', 'Handcrafted genuine leather tote bag.', 'GOLO Leather', 18500, null, 15, 1, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
      [8, 'Midnight Oud Perfume', 'midnight-oud', 'Rich and intense oriental fragrance.', 'GOLO Fragrances', 8500, 7200, 25, 1, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800']
    ];
    const stmt = db.prepare('INSERT INTO products (category_id, name, slug, description, brand, base_price, sale_price, stock_qty, is_featured, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    products.forEach(p => stmt.run(...p));
  }

    // Seed banners
  const bannerCount = db.prepare('SELECT count(*) as count FROM banners').get().count;
  if (bannerCount === 0) {
    const banners = [
      ['The New Classic', 'Elevate your everyday with our new collection.', 'Shop Now', '/products', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600', '#0D0D0D', '#F5F0E8', 1, 1],
      ['Timeless Elegance', 'Jewelry that tells a story of luxury.', 'Explore', '/products?category=jewelry', 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?w=1600', '#C9A96E', '#0D0D0D', 1, 2]
    ];
    const stmt = db.prepare('INSERT INTO banners (title, subtitle, cta_text, cta_link, image_url, bg_color, text_color, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    banners.forEach(b => stmt.run(...b));
  }
}

export default db;
