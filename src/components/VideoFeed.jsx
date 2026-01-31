import React, { useState, useRef, useEffect } from 'react';
import VideoCard from './VideoCard';
import { useApp } from '../context/AppContext';

const VideoFeed = ({ onProfileClick, filterType }) => {
    const { videos, loading, currentUser } = useApp();
    const containerRef = useRef(null);
    const [currentVideoId, setCurrentVideoId] = useState(null);

    // Filter videos based on active tab
    const displayedVideos = (filterType === 'following' && currentUser)
        ? videos.filter(v => currentUser.followingList?.includes(v.username))
        : videos;

    // Initialize currentVideoId when videos load
    useEffect(() => {
        if (displayedVideos.length > 0 && (currentVideoId === null || !displayedVideos.find(v => v.id === currentVideoId))) {
            setCurrentVideoId(displayedVideos[0].id);
        }
    }, [displayedVideos, currentVideoId]);

    // Intersection Observer to detect which video is in view
    useEffect(() => {
        if (!containerRef.current) return;

        const options = {
            root: containerRef.current,
            rootMargin: '0px',
            threshold: 0.6 // Video considered "active" when 60% visible
        };

        const handleIntersection = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = Number(entry.target.getAttribute('data-id'));
                    setCurrentVideoId(id);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, options);

        const videoElements = containerRef.current.querySelectorAll('.video-snap-item');
        videoElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [displayedVideos]); // Re-run when videos list changes (e.g. upload)

    if (loading) {
        return (
            <div className="flex-center full-size" style={{ background: 'black', color: 'white' }}>
                <div style={{
                    width: 40, height: 40, border: '4px solid #333',
                    borderTopColor: '#FE2C55', borderRadius: '50%', animation: 'spin 1s linear infinite'
                }} />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={{
                height: '100%',
                width: '100%',
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
                scrollBehavior: 'smooth',
                position: 'relative',
                backgroundColor: 'black'
            }}
            className="no-scrollbar"
        >
            {displayedVideos.length === 0 && filterType === 'following' && (
                <div className="flex-center full-size" style={{ color: 'white', flexDirection: 'column' }}>
                    <p>Follow some creators to see videos here!</p>
                </div>
            )}

            {displayedVideos.length === 0 && filterType !== 'following' && (
                <div className="flex-center full-size" style={{ color: 'white', flexDirection: 'column' }}>
                    <h2>No videos yet</h2>
                    <p>Be the first to upload!</p>
                </div>
            )}

            {displayedVideos.map((video) => (
                <div
                    key={video.id}
                    data-id={video.id}
                    className="video-snap-item"
                    style={{
                        height: '100%',
                        width: '100%',
                        scrollSnapAlign: 'start',
                        position: 'relative'
                    }}
                >
                    <VideoCard data={video} isActive={currentVideoId === video.id} onProfileClick={onProfileClick} />
                </div>
            ))}
        </div>
    );
};

export default VideoFeed;
