import React, { useState, useRef, useEffect } from 'react';
import VideoCard from './VideoCard';
import { useApp } from '../context/AppContext';

const VideoFeed = () => {
    const { videos } = useApp();
    const containerRef = useRef(null);
    const [currentVideoId, setCurrentVideoId] = useState(null);

    // Initialize currentVideoId when videos load
    useEffect(() => {
        if (videos.length > 0 && currentVideoId === null) {
            setCurrentVideoId(videos[0].id);
        }
    }, [videos]);

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
    }, [videos]); // Re-run when videos list changes (e.g. upload)

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
            {videos.map((video) => (
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
                    <VideoCard data={video} isActive={currentVideoId === video.id} />
                </div>
            ))}
        </div>
    );
};

export default VideoFeed;
