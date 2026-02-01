import { Router } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET all products
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT p.*, u.username FROM products p JOIN users u ON p.owner_id = u.id';
        const values: any[] = [];

        if (category) {
            query += ' WHERE p.category = $1';
            values.push(category);
        }

        query += ' ORDER BY p.created_at DESC';
        const { rows } = await pool.query(query, values);
        res.json(rows);
    } catch (error) {
        console.error('Failed to fetch products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST new product
router.post('/', async (req: any, res: any) => {
    const { title, description, price, category, image_url } = req.body;
    const userId = req.user?.id;

    if (!title || !price || !userId) {
        return res.status(400).json({ error: 'Title, price and ownership required' });
    }

    try {
        const productId = uuidv4();
        const query = `
            INSERT INTO products (id, owner_id, title, description, price, category, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [productId, userId, title, description, price, category, image_url]);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Failed to create product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
