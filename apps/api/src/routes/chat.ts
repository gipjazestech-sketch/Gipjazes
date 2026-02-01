import { Router } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET conversation with a specific user
router.get('/:recipientId', async (req: any, res) => {
    const userId = req.user?.id;
    const { recipientId } = req.params;

    if (!userId) return res.status(401).json({ error: 'Auth required' });

    try {
        const query = `
            SELECT m.*, u.username as sender_username
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = $1 AND m.recipient_id = $2)
               OR (m.sender_id = $2 AND m.recipient_id = $1)
            ORDER BY m.created_at ASC
        `;
        const { rows } = await pool.query(query, [userId, recipientId]);
        res.json(rows);
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET all active conversations
router.get('/conversations/list', async (req: any, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Auth required' });

    try {
        const query = `
            WITH LastMessages AS (
                SELECT DISTINCT ON (
                    CASE WHEN sender_id < recipient_id THEN sender_id ELSE recipient_id END,
                    CASE WHEN sender_id < recipient_id THEN recipient_id ELSE sender_id END
                ) *
                FROM messages
                WHERE sender_id = $1 OR recipient_id = $1
                ORDER BY 
                    CASE WHEN sender_id < recipient_id THEN sender_id ELSE recipient_id END,
                    CASE WHEN sender_id < recipient_id THEN recipient_id ELSE sender_id END,
                    created_at DESC
            )
            SELECT lm.*, 
                   u.username as other_username, 
                   u.avatar_url as other_avatar
            FROM LastMessages lm
            JOIN users u ON u.id = (CASE WHEN lm.sender_id = $1 THEN lm.recipient_id ELSE lm.sender_id END)
            ORDER BY lm.created_at DESC
        `;
        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST send message
router.post('/', async (req: any, res) => {
    const { recipientId, content } = req.body;
    const senderId = req.user?.id;

    if (!senderId || !recipientId || !content) {
        return res.status(400).json({ error: 'Sender, recipient and content required' });
    }

    try {
        const messageId = uuidv4();
        const query = `
            INSERT INTO messages (id, sender_id, recipient_id, content)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [messageId, senderId, recipientId, content]);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
