import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();
const API_URL = '/api';

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        const savedToken = localStorage.getItem('fs_token');
        const savedUser = localStorage.getItem('fs_user');

        if (savedToken && savedUser) {
            setCurrentUser({
                token: savedToken,
                user: JSON.parse(savedUser)
            });
        }

        fetchVideos();
    }, []); // Only on mount

    useEffect(() => {
        if (currentUser) {
            fetchVideos();
        }
    }, [currentUser]);

    const fetchVideos = async () => {
        try {
            const url = currentUser
                ? `${API_URL}/videos?userId=${currentUser.user?.username || currentUser.username}`
                : `${API_URL}/videos`;
            const headers = {};
            if (currentUser?.token) {
                headers['Authorization'] = `Bearer ${currentUser.token}`;
            }
            const res = await fetch(url, { headers });
            const data = await res.json();
            setVideos(data);
        } catch (err) {
            console.error("Failed to fetch videos", err);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                let errorMsg = 'Login failed';
                try {
                    const contentType = res.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const error = await res.json();
                        errorMsg = error.error || error.message || errorMsg;
                    } else {
                        errorMsg = `Server error (${res.status})`;
                    }
                } catch (e) {
                    console.error("Error parsing error response", e);
                }
                throw new Error(errorMsg);
            }
            const data = await res.json();
            console.log("Login success:", data);
            setCurrentUser(data);
            if (data.token) {
                localStorage.setItem('fs_token', data.token);
                localStorage.setItem('fs_user', JSON.stringify(data.user));
            }
            return { success: true };
        } catch (err) {
            console.error("Login Error Details:", err);
            return { success: false, error: err.message };
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            if (!res.ok) {
                let errorMsg = 'Registration failed';
                try {
                    const contentType = res.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const error = await res.json();
                        errorMsg = error.error || error.message || errorMsg;
                    } else {
                        errorMsg = `Server error (${res.status})`;
                    }
                } catch (e) {
                    console.error("Error parsing error response", e);
                }
                throw new Error(errorMsg);
            }
            const data = await res.json();
            console.log("Registration success:", data);
            setCurrentUser(data);
            if (data.token) {
                localStorage.setItem('fs_token', data.token);
                localStorage.setItem('fs_user', JSON.stringify(data.user));
            }
            return { success: true };
        } catch (err) {
            console.error("Registration Error Details:", err);
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('fs_token');
        localStorage.removeItem('fs_user');
    };

    const uploadVideo = async (file, caption) => {
        if (!currentUser) return false;

        const username = currentUser.user?.username || currentUser.username;
        const formData = new FormData();
        formData.append('video', file);
        formData.append('username', username);
        formData.append('caption', caption);

        try {
            const res = await fetch(`${API_URL}/videos/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                },
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                }
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
            await fetch(`${API_URL}/videos/users/${targetUsername}/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                }
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
            register,
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
