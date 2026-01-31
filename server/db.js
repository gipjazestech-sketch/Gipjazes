const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');

// Initialize DB if not exists
if (!fs.existsSync(dbPath)) {
  const initialData = {
    users: [
      {
        username: 'ai_visionary',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=faces',
        bio: 'The future is now! 🤖 Generating dreams with AI.',
        created_at: new Date().toISOString()
      },
      {
        username: 'neon_city',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',
        bio: 'Midnight drive. 🌃 #vaporwave #chill',
        created_at: new Date().toISOString()
      },
      {
        username: 'creative_mind',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
        bio: 'Capturing the world one pixel at a time 📸',
        created_at: new Date().toISOString()
      }
    ],
    videos: [
      {
        id: 1,
        username: 'ai_visionary',
        userAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=faces',
        description: 'The future is now! 🤖 Generating dreams with AI. #ai #future #scifi',
        song: 'Synthwave Dreams',
        artist: 'AI Beat',
        likes: 15200,
        comments: 600,
        shares: 850,
        saves: 2000,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-at-night-aerial-view-41484-large.mp4',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        username: 'neon_city',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',
        description: 'Midnight drive. 🌃 #vaporwave #chill',
        song: 'Nightcall',
        artist: 'Kavinsky',
        likes: 95000,
        comments: 1500,
        shares: 3000,
        saves: 5000,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-red-sunset-over-the-mountains-5154-large.mp4',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        username: 'creative_mind',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
        description: 'Nature is amazing 🌿 #nature #vibes',
        song: 'Morning Dew',
        artist: 'Nature Sounds',
        likes: 12000,
        comments: 800,
        shares: 400,
        saves: 1200,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
        created_at: new Date().toISOString()
      }
    ],
    likes: [], // { username, videoId }
    follows: [] // { follower, followed }
  };
  fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
}

// Helper to read/write
const readDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const writeDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

const db = {
  getUser: (username) => {
    const data = readDb();
    return data.users.find(u => u.username === username);
  },
  createUser: (username, avatar, bio) => {
    const data = readDb();
    if (data.users.find(u => u.username === username)) return;
    const newUser = { username, avatar, bio, created_at: new Date().toISOString() };
    data.users.push(newUser);
    writeDb(data);
    return newUser;
  },
  getFollowStats: (username) => {
    const data = readDb();
    const following = data.follows.filter(f => f.follower === username).length;
    const followers = data.follows.filter(f => f.followed === username).length;
    return { following, followers };
  },
  getFollowingList: (username) => {
    const data = readDb();
    return data.follows.filter(f => f.follower === username).map(f => f.followed);
  },
  getAllVideos: () => {
    const data = readDb();
    return data.videos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getUserLikes: (username) => {
    const data = readDb();
    return data.likes.filter(l => l.username === username);
  },
  createVideo: (videoObj) => {
    const data = readDb();
    const newVideo = {
      id: data.videos.length > 0 ? Math.max(...data.videos.map(v => v.id)) + 1 : 1,
      ...videoObj,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      created_at: new Date().toISOString()
    };
    data.videos.unshift(newVideo);
    writeDb(data);
    return newVideo;
  },
  toggleLike: (username, videoId) => {
    const data = readDb();
    const existingIndex = data.likes.findIndex(l => l.username === username && l.video_id === parseInt(videoId));
    const videoIndex = data.videos.findIndex(v => v.id === parseInt(videoId));

    let liked = false;
    if (existingIndex >= 0) {
      // Unlike
      data.likes.splice(existingIndex, 1);
      if (videoIndex >= 0) data.videos[videoIndex].likes--;
      liked = false;
    } else {
      // Like
      data.likes.push({ username, video_id: parseInt(videoId) });
      if (videoIndex >= 0) data.videos[videoIndex].likes++;
      liked = true;
    }
    writeDb(data);
    return { liked };
  },
  toggleFollow: (follower, followed) => {
    const data = readDb();
    const existingIndex = data.follows.findIndex(f => f.follower === follower && f.followed === followed);

    let following = false;
    if (existingIndex >= 0) {
      // Unfollow
      data.follows.splice(existingIndex, 1);
      following = false;
    } else {
      // Follow
      data.follows.push({ follower, followed });
      following = true;
    }
    writeDb(data);
    return { following };
  }
};

module.exports = db;
