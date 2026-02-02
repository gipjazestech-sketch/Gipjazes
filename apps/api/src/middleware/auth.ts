import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // This should be set in .env

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
    }

    try {
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export const optionalAuthenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    try {
        if (JWT_SECRET) {
            const decoded = jwt.verify(token, JWT_SECRET);
            (req as any).user = decoded;
        }
        next();
    } catch (err) {
        // Even if token is invalid, we continue but don't set req.user
        next();
    }
};
