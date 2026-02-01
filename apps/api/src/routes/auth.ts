import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gipjazes-secret-key-2024';

// REGISTER
router.post('/register', async (req: any, res: any) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password are required' });
    }

    try {
        // Check if user exists
        const exists = await pool.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        const query = `
            INSERT INTO users (id, username, email, password_hash, avatar_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, username, email, avatar_url;
        `;
        const avatarUrl = `https://www.gravatar.com/avatar/${uuidv4().replace(/-/g, '')}?d=identicon`;

        const { rows } = await pool.query(query, [userId, username, email, passwordHash, avatarUrl]);
        const user = rows[0];

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// LOGIN
router.post('/login', async (req: any, res: any) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        // Don't send password_hash
        delete user.password_hash;

        res.json({ user, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET ME (Current User)
router.get('/me', async (req: any, res: any) => {
    // This assumes auth middleware has run and populated req.user
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const { rows } = await pool.query('SELECT id, username, email, avatar_url, bio, following_count, followers_count FROM users WHERE id = $1', [userId]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// UPDATE PROFILE
router.put('/me', async (req: any, res: any) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const { bio, username, avatar_url } = req.body;

    try {
        const query = `
            UPDATE users 
            SET bio = COALESCE($1, bio),
                username = COALESCE($2, username),
                avatar_url = COALESCE($3, avatar_url)
            WHERE id = $4
            RETURNING id, username, email, avatar_url, bio, following_count, followers_count;
        `;
        const { rows } = await pool.query(query, [bio, username, avatar_url, userId]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

export default router;
