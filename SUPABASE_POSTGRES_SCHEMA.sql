-- GOLO Luxury E-commerce - Supabase (PostgreSQL) Schema
-- Run this in the Supabase SQL Editor

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    phone TEXT,
    avatar_url TEXT,
    token_version INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    sort_order INT DEFAULT 0
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    brand TEXT,
    base_price DECIMAL(12, 2) NOT NULL,
    sale_price DECIMAL(12, 2),
    stock_qty INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    images JSONB DEFAULT '[]',
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Banners Table
CREATE TABLE IF NOT EXISTS banners (
    id SERIAL PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    cta_text TEXT,
    cta_link TEXT,
    image_url TEXT,
    bg_color TEXT DEFAULT '#0B0B0B',
    text_color TEXT DEFAULT '#F5F5F0',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id INT REFERENCES users(id),
    address_id INT, -- Simplified for now
    status TEXT DEFAULT 'pending',
    subtotal DECIMAL(12, 2),
    discount DECIMAL(12, 2) DEFAULT 0.00,
    shipping DECIMAL(12, 2) DEFAULT 0.00,
    tax DECIMAL(12, 2) DEFAULT 0.00,
    total DECIMAL(12, 2),
    promo_code TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    placed_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    variant_id INT,
    name TEXT,
    brand TEXT,
    image_url TEXT,
    quantity INT,
    unit_price DECIMAL(12, 2),
    line_total DECIMAL(12, 2)
);

-- 7. Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id INT REFERENCES users(id),
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Promotions
CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value DECIMAL(12, 2) NOT NULL,
    min_order_amount DECIMAL(12, 2) DEFAULT 0.00,
    max_uses INT,
    used_count INT DEFAULT 0,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- 9. Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., 'Small', 'Gold', '50ml'
    sku TEXT UNIQUE,
    price_override DECIMAL(12, 2),
    stock_qty INT DEFAULT 0
);

-- 10. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    label TEXT, -- e.g., 'Home', 'Office'
    full_name TEXT,
    phone TEXT,
    line1 TEXT,
    line2 TEXT,
    city TEXT,
    district TEXT,
    country TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- INITIAL SEED DATA
INSERT INTO categories (name, slug, sort_order) VALUES 
('Haute Couture', 'clothing', 1),
('Signature Bags', 'bags', 2),
('High Jewelry', 'jewelry', 3),
('Ethereal Scents', 'perfumes', 4);

INSERT INTO banners (title, subtitle, cta_text, cta_link, image_url, sort_order) VALUES 
('The Silk Road Collection', 'Timeless elegance meets modern silhouettes.', 'Shop Now', '/collection/clothing', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070', 1),
('Golden Hour Treasures', 'Hand-crafted jewelry for moments that matter.', 'Explore', '/collection/jewelry', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070', 2);

INSERT INTO products (category_id, name, slug, brand, base_price, is_featured, image_url) VALUES 
(1, 'Noir Velvet Evening Gown', 'velvet-gown', 'GOLO Prive', 45000, true, 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974'),
(2, 'Croco-Embossed Clutch', 'croco-clutch', 'Maison GOLO', 12500, true, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935'),
(3, 'Celestial Diamond Studs', 'diamond-studs', 'Aurelian', 89000, true, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1974');
