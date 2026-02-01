import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Health Check (Move to TOP to avoid being blocked or failing later)
app.get(['/', '/health', '/api/health'], (req, res) => {
    res.json({
        status: 'ok',
        service: 'gipjazes-api',
        env: process.env.NODE_ENV,
        database: !!process.env.DATABASE_URL,
        timestamp: new Date().toISOString()
    });
});

// Import Routes
import { authenticateToken } from './middleware/auth';
import authRoutes from './routes/auth';
import videoRoutes from './routes/video';
import marketplaceRoutes from './routes/marketplace';
import chatRoutes from './routes/chat';

// 2. Auth Routes (Unprotected)
app.use('/api/auth', authRoutes);

// 3. Protected Routes
app.use('/api/videos', authenticateToken, videoRoutes);
app.use('/api/marketplace', authenticateToken, marketplaceRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start the server (Vercel uses export default but local needs listen)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
