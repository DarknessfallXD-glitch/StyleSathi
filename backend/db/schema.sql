-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'email',
    subscription_plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    tag VARCHAR(100),
    is_new BOOLEAN DEFAULT FALSE,
    is_ai_try_on BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Insert sample products
INSERT INTO products (name, price, category, image_url, tag, is_new, is_ai_try_on) VALUES
('Antique Gold Jhumk', 4999, 'EARRINGS', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200', 'AI Try-On', TRUE, TRUE),
('Silver Minimal Ring', 1250, 'RINGS', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200', 'AI Try-On', FALSE, TRUE),
('Pearl Drop Necklace', 3400, 'NECKLACE', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200', 'AI Try-On', FALSE, TRUE),
('Floral Tikka', 2100, 'MAANG TIKKA', 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=200', 'AI Try-On', FALSE, TRUE);