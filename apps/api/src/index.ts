import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import videoRoutes from './routes/video';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
import { authenticateToken } from './middleware/auth';
import authRoutes from './routes/auth';
import marketplaceRoutes from './routes/marketplace';
import chatRoutes from './routes/chat';

app.use('/api/auth', authRoutes);
app.use('/api/videos', authenticateToken, videoRoutes);
app.use('/api/marketplace', authenticateToken, marketplaceRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);

// Health Check
app.get(['/health', '/api/health'], (req, res) => {
    res.json({
        status: 'ok',
        service: 'gipjazes-api',
        env: process.env.NODE_ENV,
        database: !!process.env.DATABASE_URL
    });
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
