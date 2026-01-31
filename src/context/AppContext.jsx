import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();
const API_URL = 'http://localhost:3000/api';

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        fetchVideos();
    }, [currentUser]); // Refetch when user changes (to update liked status)

    const fetchVideos = async () => {
        try {
            const url = currentUser
                ? `${API_URL}/videos?userId=${currentUser.username}`
                : `${API_URL}/videos`;
            const res = await fetch(url);
            const data = await res.json();
            setVideos(data);
        } catch (err) {
            console.error("Failed to fetch videos", err);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const user = await res.json();
            setCurrentUser(user);
            return true;
        } catch (err) {
            console.error("Login failed", err);
            return false;
        }
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const uploadVideo = async (file, caption) => {
        if (!currentUser) return false;

        const formData = new FormData();
        formData.append('video', file);
        formData.append('username', currentUser.username);
        formData.append('caption', caption);

        try {
            const res = await fetch(`${API_URL}/videos`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                // Optimistic update or refetch
                fetchVideos();
                return true;
            }
        } catch (err) {
            console.error("Upload failed", err);
        }
        return false;
    };

    const toggleLike = async (videoId) => {
        if (!currentUser) return; // UI should handle auth check, but safety first

        // Optimistic UI Update
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

        try {
            await fetch(`${API_URL}/videos/${videoId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser.username })
            });
        } catch (err) {
            console.error("Like failed", err);
            // Revert on error would go here
        }
    };

    const toggleFollow = async (targetUsername) => {
        if (!currentUser) return;

        // Optimistic Update
        const isFollowing = currentUser.followingList?.includes(targetUsername);
        const updatedUser = {
            ...currentUser,
            followingList: isFollowing
                ? currentUser.followingList.filter(u => u !== targetUsername)
                : [...(currentUser.followingList || []), targetUsername],
            following: (currentUser.following || 0) + (isFollowing ? -1 : 1)
        };
        setCurrentUser(updatedUser);

        try {
            await fetch(`${API_URL}/users/${targetUsername}/follow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser.username })
            });
        } catch (err) {
            console.error("Follow failed", err);
        }
    };

    const getUserProfile = async (username) => {
        try {
            const res = await fetch(`${API_URL}/users/${username}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.error("Get profile failed", err);
            return null;
        }
    };

    return (
        <AppContext.Provider value={{
            currentUser,
            videos,
            loading,
            login,
            logout,
            uploadVideo,
            toggleLike,
            toggleFollow,
            getUserProfile
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
