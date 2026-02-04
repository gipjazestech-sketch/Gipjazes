import React, { useState, useEffect } from 'react';
import { X, Search as SearchIcon, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SearchModal = ({ onClose, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toggleFollow } = useApp();

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length > 1) {
                performSearch();
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            // Assuming API provides a unified search or just video search for now
            // The backend video.ts has /search endpoint for videos
            const res = await fetch(`/api/videos/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100dvh',
            backgroundColor: 'black',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
            {/* Search Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 15px',
                gap: '10px',
                borderBottom: '1px solid #333'
            }}>
                <div style={{
                    flex: 1,
                    backgroundColor: '#222',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px'
                }}>
                    <SearchIcon size={18} color="#888" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search videos, users..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            marginLeft: '10px',
                            flex: 1,
                            outline: 'none',
                            fontSize: '16px'
                        }}
                    />
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#FE2C55',
                        fontWeight: '600',
                        fontSize: '16px'
                    }}
                >
                    Cancel
                </button>
            </div>

            {/* Results */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                {loading && <div style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>Searching...</div>}

                {!loading && results.length === 0 && query.length > 1 && (
                    <div style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>
                        No results found for "{query}"
                    </div>
                )}

                {results.map((video) => (
                    <div key={video.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '15px',
                        cursor: 'pointer'
                    }} onClick={() => {
                        // Navigate to profile or play video
                        // For now, let's navigate to profile if user clicked
                        if (onNavigate) onNavigate(video.user.username);
                        onClose();
                    }}>
                        <img
                            src={video.user.avatar}
                            alt={video.user.username}
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginRight: '15px'
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', color: 'white' }}>{video.user.username}</div>
                            <div style={{ color: '#aaa', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {video.description}
                            </div>
                        </div>
                        {video.thumbnail && (
                            <img
                                src={video.thumbnail}
                                style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchModal;
