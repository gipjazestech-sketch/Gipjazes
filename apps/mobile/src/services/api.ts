import axios from 'axios';
import { Platform } from 'react-native';

// We'll import the store later to get the token
// For now, we'll use a circular-safe way or just a variable
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
};

// For production, replace with your actual API URL
const PROD_URL = 'https://gipjazes-stream.vercel.app/api';
const DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
});

export const authService = {
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    register: async (userData: any) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    updateProfile: async (profileData: any) => {
        const response = await api.put('/auth/me', profileData);
        return response.data;
    }
};

export const videoService = {
    getFeed: async (page = 1) => {
        try {
            const response = await api.get(`/videos?page=${page}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching feed', error);
            throw error;
        }
    },
    getUserVideos: async (userId: string, page = 1) => {
        try {
            const response = await api.get(`/videos/users/${userId}?page=${page}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user videos', error);
            throw error;
        }
    },

    uploadVideo: async (formData: FormData) => {
        try {
            const response = await api.post('/videos/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading video', error);
            throw error;
        }
    },

    likeVideo: async (videoId: string) => {
        try {
            await api.post(`/videos/${videoId}/like`);
        } catch (error) {
            console.error('Error liking video', error);
            throw error;
        }
    },

    unlikeVideo: async (videoId: string) => {
        try {
            await api.delete(`/videos/${videoId}/like`);
        } catch (error) {
            console.error('Error unliking video', error);
            throw error;
        }
    },

    postComment: async (videoId: string, text: string) => {
        try {
            await api.post(`/videos/${videoId}/comments`, { text });
        } catch (error) {
            console.error('Error posting comment', error);
            throw error;
        }
    },

    getComments: async (videoId: string) => {
        try {
            const response = await api.get(`/videos/${videoId}/comments`);
            return response.data;
        } catch (error) {
            console.error('Error fetching comments', error);
            throw error;
        }
    },

    searchVideos: async (query: string) => {
        try {
            const response = await api.get('/videos/search', { params: { q: query } });
            return response.data;
        } catch (error) {
            console.error('Error searching videos', error);
            throw error;
        }
    },

    followUser: async (userId: string) => {
        try {
            await api.post(`/videos/users/${userId}/follow`);
        } catch (error) {
            console.error('Error following user', error);
            throw error;
        }
    },

    unfollowUser: async (userId: string) => {
        try {
            await api.delete(`/videos/users/${userId}/follow`);
        } catch (error) {
            console.error('Error unfollowing user', error);
            throw error;
        }
    },
};

export const marketplaceService = {
    getProducts: async (category?: string) => {
        const response = await api.get('/marketplace', { params: { category } });
        return response.data;
    },
    createProduct: async (productData: any) => {
        const response = await api.post('/marketplace', productData);
        return response.data;
    },
};

export const chatService = {
    getConversation: async (recipientId: string) => {
        const response = await api.get(`/chat/${recipientId}`);
        return response.data;
    },
    getConversationsList: async () => {
        const response = await api.get('/chat/conversations/list');
        return response.data;
    },
    sendMessage: async (recipientId: string, content: string) => {
        const response = await api.post('/chat', { recipientId, content });
        return response.data;
    },
};

export default api;
