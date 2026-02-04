import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configure S3
const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    endpoint: process.env.AWS_ENDPOINT, // Optional, for custom S3 providers
    forcePathStyle: !!process.env.AWS_ENDPOINT,
});

const uploadBucket = process.env.S3_BUCKET_NAME || 'gipjazes-videos';

const router = Router();

// GENERATE VIDEO
router.post('/generate', authenticateToken, async (req: any, res: any) => {
    const { prompt, style } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const videoId = uuidv4();
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const outputPath = path.join(tempDir, `${videoId}.mp4`);

    try {
        console.log(`[AI] Generating video for prompt: "${prompt}" with style: ${style}`);

        // Choose background based on style
        let inputSource = 'mandelbrot=size=720x1280:rate=25'; // Default trippy background
        let filterComplex = '';

        if (style === 'Retro') {
            inputSource = 'smptebars=size=720x1280:rate=25';
            filterComplex = ',curves=vintage';
        } else if (style === 'Cyberpunk') {
            inputSource = 'rgbtestsrc=size=720x1280:rate=25';
            filterComplex = ',hue=s=2';
        } else if (style === 'Nature') {
            // Simulated nature colors using gradients
            inputSource = 'color=c=forestgreen:s=720x1280:d=5';
            // This is a bit too simple, but robust for a mock
        }

        // FFmpeg command to generate video
        // We use -f lavfi to generate the input source
        // And drawtext to overlay the prompt

        // Escape single quotes for drawtext
        const sanitizedPrompt = prompt.replace(/'/g, '').substring(0, 50); // Limit length

        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(inputSource)
                .inputFormat('lavfi')
                .inputOptions(['-t 5']) // 5 seconds duration
                .complexFilter([
                    `drawtext=text='${sanitizedPrompt}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.5${filterComplex}`
                ])
                .outputOptions([
                    '-c:v libx264',
                    '-pix_fmt yuv420p',
                    '-preset ultrafast'
                ])
                .save(outputPath)
                .on('end', resolve)
                .on('error', reject);
        });

        console.log('[AI] Generation complete. Uploading...');

        // Upload to S3
        const s3Key = `ai_generated/${videoId}.mp4`;
        const fileContent = fs.readFileSync(outputPath);

        await s3.send(new PutObjectCommand({
            Bucket: uploadBucket,
            Key: s3Key,
            Body: fileContent,
            ContentType: 'video/mp4',
        }));

        // Determine public URL
        const endpoint = process.env.AWS_ENDPOINT;
        let videoUrl;
        if (endpoint) {
            const url = new URL(endpoint);
            videoUrl = `${url.protocol}//${uploadBucket}.${url.host}/${s3Key}`;
        } else {
            videoUrl = `https://${uploadBucket}.s3.amazonaws.com/${s3Key}`;
        }

        // Cleanup
        fs.unlinkSync(outputPath);

        res.json({
            success: true,
            videoUrl: videoUrl,
            message: 'AI Video generated successfully'
        });

    } catch (error) {
        console.error('AI Generation failed:', error);
        res.status(500).json({ error: 'Failed to generate video' });
    }
});

export default router;
