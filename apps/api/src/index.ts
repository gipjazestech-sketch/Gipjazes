import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// 1. Health Check
app.get(['/', '/health', '/api/health'], async (req, res) => {
    let dbStatus = 'disconnected';
    let dbError = null;
    let tables: string[] = [];
    try {
        if (pool) {
            await pool.query('SELECT 1');
            dbStatus = 'connected';
            const { rows } = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
            tables = rows.map((t: any) => t.tablename);
        } else {
            dbStatus = 'no_pool';
        }
    } catch (e: any) {
        dbStatus = 'error';
        dbError = e.message;
    }

    res.json({
        status: 'ok',
        service: 'gipjazes-api',
        env: process.env.NODE_ENV,
        database: {
            status: dbStatus,
            error: dbError,
            tables: tables
        },
        storage: !!process.env.AWS_ACCESS_KEY_ID,
        timestamp: new Date().toISOString()
    });
});

// Import Routes
import { authenticateToken, optionalAuthenticateToken } from './middleware/auth';
import authRoutes from './routes/auth';
import videoRoutes from './routes/video';
import marketplaceRoutes from './routes/marketplace';
import chatRoutes from './routes/chat';

import aiRoutes from './routes/ai';

// 2. Auth Routes (Unprotected)
app.use('/api/auth', authRoutes);

// 3. Protected / Partially Protected Routes
app.use('/api/videos', optionalAuthenticateToken, videoRoutes);
app.use('/api/marketplace', authenticateToken, marketplaceRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
    console.error('SERVER_ERROR:', err);

    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Always return JSON
    res.status(statusCode).json({
        error: true,
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start the server (Vercel uses export default but local needs listen)
if (process.env.NODE_ENV !== 'production') {
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    });

    server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use.`);
            console.log('💡 Retrying via npm run dev will now automatically clear the port.');
            process.exit(1);
        } else {
            console.error('❌ Server startup error:', err);
        }
    });
}

export default app;
