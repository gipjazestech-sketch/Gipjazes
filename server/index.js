const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Setup Uploads
// Setup Uploads
const isProduction = process.env.NODE_ENV === 'production';
const uploadsDir = isProduction ? path.join('/tmp', 'uploads') : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (e) {
        console.error("Could not create uploads dir:", e);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Serve static files (Uploaded content)
app.use('/uploads', express.static(uploadsDir));

// Serve Frontend (Built Vite App)
app.use(express.static(path.join(__dirname, 'public')));

// --- ROUTES ---

// Login / Register
// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const user = db.authenticateUser(username, password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials or user does not exist' });
    }

    // Get stats
    const stats = db.getFollowStats(username);
    const followingList = db.getFollowingList(username);

    res.json({ ...user, ...stats, followingList });
});

// Register
app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    // Check if exists
    if (db.getUser(username)) {
        return res.status(409).json({ error: 'Username already exists' });
    }

    // Use a default gradient or abstract image
    const avatar = `https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop&crop=faces`;
    const user = db.createUser(username, password, avatar, 'New user');

    const stats = db.getFollowStats(username);
    const followingList = db.getFollowingList(username);

    res.json({ ...user, ...stats, followingList });
});

// Get User Profile
app.get('/api/users/:username', (req, res) => {
    const { username } = req.params;
    const user = db.getUser(username);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const stats = db.getFollowStats(username);

    res.json({ ...user, ...stats });
});

// Get Feed
app.get('/api/videos', (req, res) => {
    const { userId } = req.query; // If logged in, we check 'liked' status
    const videos = db.getAllVideos();

    // Check 'liked' state if user is provided
    const userLikes = userId ? new Set(db.getUserLikes(userId).map(l => l.video_id)) : new Set();

    const enrichedVideos = videos.map(v => ({
        ...v,
        liked: userLikes.has(v.id)
    }));

    res.json(enrichedVideos);
});

// Upload Video
app.post('/api/videos', upload.single('video'), (req, res) => {
    const { username, caption } = req.body;
    const file = req.file;

    if (!file || !username) return res.status(400).json({ error: 'Missing file or username' });

    const videoUrl = `/uploads/${file.filename}`;
    const user = db.getUser(username);

    const newVideo = db.createVideo({
        username,
        userAvatar: user.avatar,
        description: caption || '',
        song: 'Original Sound',
        artist: username,
        videoUrl
    });

    res.json({ success: true, id: newVideo.id, videoUrl });
});

// Toggle Like
app.post('/api/videos/:id/like', (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    const result = db.toggleLike(username, id);
    res.json(result);
});

// Toggle Follow
app.post('/api/users/:target/follow', (req, res) => {
    const { target } = req.params;
    const { username } = req.body; // Follower

    if (username === target) return res.status(400).json({ error: "Cannot follow self" });

    const result = db.toggleFollow(username, target);
    res.json(result);
});

// SPA Fallback: Serve index.html for any unknown routes (excluding API)
app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return res.status(404).json({ error: 'Not Found' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
