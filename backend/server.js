const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sql } = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Test database connection
app.get('/api/health', async (req, res) => {
    try {
        const result = await sql`SELECT NOW()`;
        res.json({ status: 'OK', time: result[0].now, message: 'Database connected!' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await sql`SELECT * FROM products`;
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Just For You products
app.get('/api/products/just-for-you', async (req, res) => {
    try {
        const products = await sql`SELECT * FROM products WHERE tag = 'AI Try-On' LIMIT 10`;
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching just-for-you:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create user (sign up)
app.post('/api/users', async (req, res) => {
    const { name, email, password, provider } = req.body;
    try {
        const result = await sql`
            INSERT INTO users (name, email, password, provider) 
            VALUES (${name}, ${email}, ${password}, ${provider || 'email'})
            RETURNING id, name, email, provider
        `;
        res.json({ success: true, data: result[0] });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add to wishlist
app.post('/api/wishlist', async (req, res) => {
    const { user_id, product_id } = req.body;
    try {
        await sql`
            INSERT INTO wishlist (user_id, product_id) 
            VALUES (${user_id}, ${product_id})
            ON CONFLICT (user_id, product_id) DO NOTHING
        `;
        res.json({ success: true });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get wishlist for user
app.get('/api/wishlist/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const wishlist = await sql`
            SELECT p.* FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ${userId}
        `;
        res.json({ success: true, data: wishlist });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
});

// ==================== USER AUTHENTICATION ====================

// Sign Up - Create new user
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password, provider } = req.body;
    
    // Validate input
    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    try {
        // Check if user already exists
        const existingUser = await sql`
            SELECT * FROM users WHERE email = ${email}
        `;
        
        if (existingUser.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'User already exists with this email' 
            });
        }
        
        // Create new user
        const result = await sql`
            INSERT INTO users (name, email, password, provider) 
            VALUES (${name || ''}, ${email}, ${password || ''}, ${provider || 'email'})
            RETURNING id, name, email, provider, subscription_plan, created_at
        `;
        
        res.json({ 
            success: true, 
            data: result[0],
            message: 'User created successfully' 
        });
        
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Sign In - Check if user exists and credentials match
app.post('/api/auth/signin', async (req, res) => {
    const { email, password, provider } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    try {
        // Find user by email
        const users = await sql`
            SELECT * FROM users WHERE email = ${email}
        `;
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'No account found with this email' 
            });
        }
        
        const user = users[0];
        
        // For Google login (no password check)
        if (provider === 'google') {
            // Update provider if user signed up with email before
            if (user.provider !== 'google') {
                await sql`
                    UPDATE users SET provider = 'google' WHERE id = ${user.id}
                `;
            }
            return res.json({ 
                success: true, 
                data: user,
                message: 'Google login successful' 
            });
        }
        
        // For email/password login - check password
        if (password !== user.password) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid password' 
            });
        }
        
        res.json({ 
            success: true, 
            data: user,
            message: 'Login successful' 
        });
        
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user by ID
app.get('/api/auth/user/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const users = await sql`
            SELECT id, name, email, provider, subscription_plan, created_at 
            FROM users WHERE id = ${id}
        `;
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, data: users[0] });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});