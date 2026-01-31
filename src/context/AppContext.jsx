import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

const INITIAL_VIDEOS = [
    {
        id: 1,
        username: 'ai_visionary',
        userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai_visionary',
        description: 'The future is now! 🤖 Generating dreams with AI. #ai #future #scifi',
        song: 'Synthwave Dreams',
        artist: 'AI Beat',
        likes: 1500000,
        liked: false,
        comments: 60000,
        saves: 200000,
        shares: 85000,
        videoUrl: 'https://exit109.com/~dscircle/RW20seconds_1.mp4',
    },
    {
        id: 2,
        username: 'neon_city',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon_city',
        description: 'Midnight drive. 🌃 #vaporwave #chill',
        song: 'Nightcall',
        artist: 'Kavinsky',
        likes: 950000,
        liked: false,
        comments: 15000,
        saves: 50000,
        shares: 30000,
        videoUrl: 'https://exit109.com/~dscircle/RW20seconds_2.mp4',
    }
];

export const AppProvider = ({ children }) => {
    // State with Lazy Initialization from Local Storage
    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [videos, setVideos] = useState(() => {
        // Version check to force basic refresh if needed, but for now just load
        const savedVideos = localStorage.getItem('videos_v2');
        if (!savedVideos) {
            // If v2 doesn't exist, maybe clear v1 or just ignore
            return INITIAL_VIDEOS;
        }
        return JSON.parse(savedVideos);
    });

    const [users, setUsers] = useState(() => {
        const savedUsers = localStorage.getItem('users_v2');
        return savedUsers ? JSON.parse(savedUsers) : {};
    });

    // Persistence Effects (using v2 keys to separate from old data)
    useEffect(() => {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem('videos_v2', JSON.stringify(videos));
    }, [videos]);

    useEffect(() => {
        localStorage.setItem('users_v2', JSON.stringify(users));
    }, [users]);

    const login = (username) => {
        // Simple mock login
        const user = users[username] || {
            username,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            bio: 'No bio yet.',
            following: 0,
            followers: 0,
            likes: 0,
            posts: []
        };

        if (!users[username]) {
            setUsers(prev => ({ ...prev, [username]: user }));
        }

        setCurrentUser(user);
        return true;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const uploadVideo = (file, caption) => {
        if (!currentUser) return false;

        const newVideo = {
            id: Date.now(),
            username: currentUser.username,
            userAvatar: currentUser.avatar,
            description: caption,
            song: 'Original Sound',
            artist: currentUser.username,
            likes: 0,
            liked: false,
            comments: 0,
            saves: 0,
            shares: 0,
            videoUrl: URL.createObjectURL(file), // Create local object URL for preview
            isLocal: true
        };

        // Add to global feed (at the top)
        setVideos(prev => [newVideo, ...prev]);

        // Update user's post count/list (simplified)
        const updatedUser = { ...currentUser, posts: [newVideo.id, ...currentUser.posts] };
        setCurrentUser(updatedUser);
        setUsers(prev => ({ ...prev, [currentUser.username]: updatedUser }));

        return true;
    };

    const toggleLike = (videoId) => {
        setVideos(prev => prev.map(v => {
            if (v.id === videoId) {
                const newLiked = !v.liked;
                return {
                    ...v,
                    liked: newLiked,
                    likes: v.likes + (newLiked ? 1 : -1)
                };
            }
            return v;
        }));
    };

    const toggleFollow = (targetUsername) => {
        if (!currentUser) return; // Must be logged in
        if (currentUser.username === targetUsername) return; // Can't follow self

        const isFollowing = currentUser.followingList?.includes(targetUsername);

        // Update Current User (follower)
        const updatedCurrentUser = {
            ...currentUser,
            followingList: isFollowing
                ? currentUser.followingList.filter(u => u !== targetUsername)
                : [...(currentUser.followingList || []), targetUsername],
            following: (currentUser.following || 0) + (isFollowing ? -1 : 1)
        };
        setCurrentUser(updatedCurrentUser);
        setUsers(prev => ({ ...prev, [currentUser.username]: updatedCurrentUser }));

        // Update Target User (followed) - if they exist in our mock DB
        // If not in DB (mock video user), we just simulate it locally for UI state if needed, 
        // but ideally we should initialize them in 'users' state if missing.
        setUsers(prev => {
            const targetUser = prev[targetUsername] || {
                username: targetUsername,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUsername}`,
                bio: 'No bio yet.',
                following: 0,
                followers: 0,
                likes: 0,
                posts: []
            };

            return {
                ...prev,
                [targetUsername]: {
                    ...targetUser,
                    followers: (targetUser.followers || 0) + (isFollowing ? -1 : 1)
                }
            };
        });
    };

    return (
        <AppContext.Provider value={{
            currentUser,
            videos,
            login,
            logout,
            uploadVideo,
            toggleLike,
            toggleFollow
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
