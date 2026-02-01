import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import { pool } from '../db';

// Configure FFmpeg paths
try {
    if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic);
    if (ffprobeStatic) ffmpeg.setFfprobePath(ffprobeStatic.path);
} catch (e) {
    console.warn("FFmpeg static paths could not be set:", e);
}

const router = express.Router();
const upload = multer({ dest: path.join(os.tmpdir(), 'uploads') });

const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: process.env.AWS_ACCESS_KEY_ID ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    } : undefined
});

interface VideoMetadata {
    duration: number;
    width: number;
    height: number;
    format: string;
}

// Helper to extract metadata using FFmpeg
const extractMetadata = (filePath: string): Promise<VideoMetadata> => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            resolve({
                duration: metadata.format.duration || 0,
                width: videoStream?.width || 0,
                height: videoStream?.height || 0,
                format: metadata.format.format_name || 'unknown',
            });
        });
    });
};

// Upload Endpoint
router.post('/upload', upload.single('video'), async (req: any, res: any) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
    }

    const file = req.file;
    const videoId = uuidv4();
    const tempDir = path.join(os.tmpdir(), 'gipjazes_uploads', videoId);

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    try {
        // 1. Extract Metadata
        const metadata = await extractMetadata(file.path);

        // 2. Generate Thumbnail
        const thumbnailName = 'thumbnail.jpg';
        const thumbnailPath = path.join(tempDir, thumbnailName);
        await new Promise((resolve, reject) => {
            ffmpeg(file.path)
                .screenshots({
                    count: 1,
                    folder: tempDir,
                    filename: thumbnailName,
                    size: '320x640'
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // 3. Transcode to HLS
        const hlsFolder = path.join(tempDir, 'hls');
        if (!fs.existsSync(hlsFolder)) fs.mkdirSync(hlsFolder, { recursive: true });
        const hlsPlaylistFile = 'playlist.m3u8';
        const hlsPath = path.join(hlsFolder, hlsPlaylistFile);

        await new Promise((resolve, reject) => {
            ffmpeg(file.path)
                .addOptions([
                    '-profile:v baseline',
                    '-level 3.0',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls'
                ])
                .output(hlsPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        // 4. Upload Files to S3
        const bucket = process.env.S3_BUCKET_NAME!;

        // Upload original for backup/storage
        const originalS3Key = `videos/${videoId}/original${path.extname(file.originalname)}`;
        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: originalS3Key,
            Body: fs.createReadStream(file.path),
            ContentType: file.mimetype,
        }));

        // Upload thumbnail
        const thumbnailS3Key = `videos/${videoId}/${thumbnailName}`;
        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: thumbnailS3Key,
            Body: fs.createReadStream(thumbnailPath),
            ContentType: 'image/jpeg',
        }));

        // Upload HLS segments and playlist
        const hlsFiles = fs.readdirSync(hlsFolder);
        for (const hlsFile of hlsFiles) {
            const filePath = path.join(hlsFolder, hlsFile);
            const s3HlsKey = `videos/${videoId}/hls/${hlsFile}`;
            await s3.send(new PutObjectCommand({
                Bucket: bucket,
                Key: s3HlsKey,
                Body: fs.createReadStream(filePath),
                ContentType: hlsFile.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/MP2T'
            }));
        }

        const playbackHlsUrl = `https://${bucket}.s3.amazonaws.com/videos/${videoId}/hls/${hlsPlaylistFile}`;
        const thumbnailUrl = `https://${bucket}.s3.amazonaws.com/videos/${videoId}/${thumbnailName}`;
        const description = req.body.description || req.body.title || 'Untitled';
        const hashtags = description.match(/#\w+/g) || [];

        // 5. Save to Database
        const query = `
      INSERT INTO videos (id, user_id, title, description, s3_key, duration, width, height, mime_type, hashtags, playback_hls_url, thumbnail_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
        const values = [
            videoId,
            (req as any).user?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            req.body.title || 'Untitled',
            description,
            originalS3Key,
            metadata.duration,
            metadata.width,
            metadata.height,
            file.mimetype,
            hashtags,
            playbackHlsUrl,
            thumbnailUrl
        ];

        const { rows } = await pool.query(query, values);

        // Cleanup local files
        fs.unlinkSync(file.path);
        fs.rmSync(tempDir, { recursive: true, force: true });

        res.status(201).json({
            message: 'Video uploaded and processed successfully',
            video: rows[0],
        });

    } catch (error) {
        console.error('Upload processing failed:', error);
        // Cleanup on error
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
        res.status(500).json({ error: 'Video processing failed' });
    }
});

// Feed Endpoint
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const currentUserId = (req as any).user?.id || 'anonymous';

    try {
        const query = `
      SELECT v.*, u.username, u.avatar_url,
      (SELECT COUNT(*) FROM likes l WHERE l.video_id = v.id) as likes_count,
      EXISTS(SELECT 1 FROM likes l WHERE l.video_id = v.id AND l.user_id = $3) as is_liked_by_viewer,
      EXISTS(SELECT 1 FROM followers f WHERE f.follower_id = $3 AND f.following_id = v.user_id) as is_followed_by_viewer
      FROM videos v
      JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at DESC
      LIMIT $1 OFFSET $2
    `;
        const { rows } = await pool.query(query, [limit, offset, currentUserId]);

        // Transform data to match frontend expectations
        const videos = rows.map(row => ({
            id: row.id,
            uri: row.playback_hls_url || `https://s3.amazonaws.com/${process.env.S3_BUCKET_NAME}/${row.s3_key}`, // Fallback to raw if no HLS
            thumbnailUrl: row.thumbnail_url,
            videoWidth: row.width,
            videoHeight: row.height,
            likes: parseInt(row.likes_count || '0'),
            comments: row.comments_count || 0,
            description: row.description || row.title,
            isLiked: row.is_liked_by_viewer,
            isFollowing: row.is_followed_by_viewer,
            user: {
                id: row.user_id,
                username: row.username,
                avatar: row.avatar_url || 'https://via.placeholder.com/150',
            }
        }));

        res.json(videos);
    } catch (error) {
        console.error('Feed fetch failed:', error);
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
});

// Get Videos by User
router.get('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        const query = `
      SELECT v.*, u.username, u.avatar_url,
      (SELECT COUNT(*) FROM likes l WHERE l.video_id = v.id) as likes_count
      FROM videos v
      JOIN users u ON v.user_id = u.id
      WHERE v.user_id = $1
      ORDER BY v.created_at DESC
      LIMIT $2 OFFSET $3
    `;
        const { rows } = await pool.query(query, [userId, limit, offset]);

        const videos = rows.map(row => ({
            id: row.id,
            uri: row.playback_hls_url || `https://s3.amazonaws.com/${process.env.S3_BUCKET_NAME}/${row.s3_key}`,
            thumbnail: row.thumbnail_url,
            likes: parseInt(row.likes_count || '0'),
            comments: row.comments_count || 0,
            description: row.description || row.title,
            user: {
                id: row.user_id,
                username: row.username,
                avatar: row.avatar_url || 'https://via.placeholder.com/150',
            }
        }));

        res.json(videos);
    } catch (error) {
        console.error('User videos fetch failed:', error);
        res.status(500).json({ error: 'Failed to fetch user videos' });
    }
});

// Search Endpoint
router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query is required' });

    try {
        const query = `
      SELECT v.*, u.username, u.avatar_url,
      (SELECT COUNT(*) FROM likes l WHERE l.video_id = v.id) as likes_count
      FROM videos v
      JOIN users u ON v.user_id = u.id
      WHERE v.title ILIKE $1 OR v.description ILIKE $1 OR $1 = ANY(v.hashtags)
      ORDER BY v.created_at DESC
      LIMIT 20
    `;
        const { rows } = await pool.query(query, [`%${q}%`]);

        const videos = rows.map(row => ({
            id: row.id,
            uri: row.playback_hls_url || `https://s3.amazonaws.com/${process.env.S3_BUCKET_NAME}/${row.s3_key}`,
            thumbnailUrl: row.thumbnail_url,
            likes: parseInt(row.likes_count || '0'),
            comments: row.comments_count || 0,
            description: row.description || row.title,
            user: {
                id: row.user_id,
                username: row.username,
                avatar: row.avatar_url || 'https://via.placeholder.com/150',
            }
        }));

        res.json(videos);
    } catch (error) {
        console.error('Search failed:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Like a Video
router.post('/:id/like', async (req, res) => {
    const videoId = req.params.id;
    const userId = (req as any).user.id;

    try {
        await pool.query(
            'INSERT INTO likes (user_id, video_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, videoId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Like failed:', error);
        res.status(500).json({ error: 'Failed to like video' });
    }
});

// Unlike a Video
router.delete('/:id/like', async (req, res) => {
    const videoId = req.params.id;
    const userId = (req as any).user.id;

    try {
        await pool.query(
            'DELETE FROM likes WHERE user_id = $1 AND video_id = $2',
            [userId, videoId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Unlike failed:', error);
        res.status(500).json({ error: 'Failed to unlike video' });
    }
});

// Get Comments for a Video
router.get('/:id/comments', async (req, res) => {
    const videoId = req.params.id;
    try {
        const { rows } = await pool.query(
            `SELECT c.*, u.username, u.avatar_url 
             FROM comments c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.video_id = $1 
             ORDER BY c.created_at DESC`,
            [videoId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Fetch comments failed:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Add a Comment
router.post('/:id/comments', async (req, res) => {
    const videoId = req.params.id;
    const userId = (req as any).user.id;
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: 'Comment text is required' });

    try {
        // Create the comment
        const { rows } = await pool.query(
            'INSERT INTO comments (user_id, video_id, text) VALUES ($1, $2, $3) RETURNING *',
            [userId, videoId, text]
        );

        // Update video comment count (could use trigger but manual for now if trigger missing)
        await pool.query('UPDATE videos SET comments_count = comments_count + 1 WHERE id = $1', [videoId]);

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Comment failed:', error);
        res.status(500).json({ error: 'Failed to post comment' });
    }
});

// Follow a User
router.post('/users/:id/follow', async (req, res) => {
    const followingId = req.params.id;
    const followerId = (req as any).user?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    if (followerId === followingId) {
        return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    try {
        await pool.query(
            'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [followerId, followingId]
        );

        // Update counts
        await pool.query('UPDATE users SET following_count = following_count + 1 WHERE id = $1', [followerId]);
        await pool.query('UPDATE users SET followers_count = followers_count + 1 WHERE id = $1', [followingId]);

        res.json({ message: 'Followed successfully' });
    } catch (error) {
        console.error('Follow failed:', error);
        res.status(500).json({ error: 'Follow failed' });
    }
});

// Unfollow a User
router.delete('/users/:id/follow', async (req, res) => {
    const followingId = req.params.id;
    const followerId = (req as any).user?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    try {
        const result = await pool.query(
            'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2',
            [followerId, followingId]
        );

        if (result.rowCount && result.rowCount > 0) {
            // Update counts
            await pool.query('UPDATE users SET following_count = GREATEST(0, following_count - 1) WHERE id = $1', [followerId]);
            await pool.query('UPDATE users SET followers_count = GREATEST(0, followers_count - 1) WHERE id = $1', [followingId]);
        }

        res.json({ message: 'Unfollowed successfully' });
    } catch (error) {
        console.error('Unfollow failed:', error);
        res.status(500).json({ error: 'Unfollow failed' });
    }
});

export default router;
