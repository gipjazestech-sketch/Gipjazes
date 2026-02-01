import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gipjazes-secret-key-2024';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // Fallback for local development/testing if no token provided
        if (process.env.NODE_ENV !== 'production') {
            (req as any).user = { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', username: 'testuser' };
            return next();
        }
        return res.status(401).json({ error: 'Authentication token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            (req as any).user = { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', username: 'testuser' };
            return next();
        }
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
