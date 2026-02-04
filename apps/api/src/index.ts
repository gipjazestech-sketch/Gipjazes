import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Import local modules
import { pool } from './db';
import { authenticateToken, optionalAuthenticateToken } from './middleware/auth';
import authRoutes from './routes/auth';
import videoRoutes from './routes/video';
import marketplaceRoutes from './routes/marketplace';
import chatRoutes from './routes/chat';
import aiRoutes from './routes/ai';

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
app.get(['/', '/health', '/api/health', '/api/v1/health'], async (req, res) => {
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

// 2. Database Setup Route (Emergency)
app.get(['/setup-db', '/db-setup', '/api/db-setup', '/api/setup-db'], async (req, res) => {
    console.log('[DB] Setup route triggered');
    try {
        // Try multiple paths to find the schema.sql in Vercel environment
        const possiblePaths = [
            path.join(process.cwd(), 'database/schema.sql'),
            path.join(process.cwd(), '../../database/schema.sql'),
            path.join(__dirname, '../../../database/schema.sql'),
            path.join(__dirname, '../../database/schema.sql'),
            '/var/task/database/schema.sql'
        ];

        let schemaPath = null;
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                schemaPath = p;
                break;
            }
        }

        if (!schemaPath) {
            return res.status(404).json({
                error: 'Schema file not found',
                cwd: process.cwd(),
                dirname: __dirname,
                tried: possiblePaths
            });
        }

        const schema = fs.readFileSync(schemaPath, 'utf8');
        // Split by semicolon and run separately if necessary, or just run as one block
        await pool.query(schema);
        res.json({ success: true, message: 'Database schema applied successfully', path: schemaPath });
    } catch (error: any) {
        console.error('[DB] Setup Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // Fallback for stripped paths

app.use('/api/videos', optionalAuthenticateToken, videoRoutes);
app.use('/videos', optionalAuthenticateToken, videoRoutes);

app.use('/api/marketplace', authenticateToken, marketplaceRoutes);
app.use('/marketplace', authenticateToken, marketplaceRoutes);

app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/chat', authenticateToken, chatRoutes);

app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/ai', authenticateToken, aiRoutes);

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
    console.error('SERVER_ERROR:', err);

    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: true,
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

export default app;
