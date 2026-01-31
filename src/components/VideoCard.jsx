import React, { useRef, useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music } from 'lucide-react';
import { useApp } from '../context/AppContext';

const VideoCard = ({ data, isActive, onProfileClick }) => {
    const videoRef = useRef(null);
    const { toggleLike, toggleFollow, currentUser } = useApp();
    const liked = data.liked;
    const [isPlaying, setIsPlaying] = useState(false);

    // Create a placeholder gradient based on ID if no video URL, to give visual variety
    const bgColors = [
        'linear-gradient(45deg, #12c2e9, #c471ed, #f64f59)',
        'linear-gradient(to top, #09203f 0%, #537895 100%)',
        'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)',
        'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)'
    ];
    const bg = bgColors[data.id % bgColors.length];

    const handleProfileClick = (e) => {
        e.stopPropagation();
        if (onProfileClick) onProfileClick(data.username);
    };

    const handleLike = (e) => {
        e.stopPropagation();
        if (!currentUser) {
            alert("Please login to like videos!");
            return;
        }
        toggleLike(data.id);
    };

    const handleFollowAction = (e) => {
        e.stopPropagation();
        if (!currentUser) {
            alert("Please login to follow creators!");
            return;
        }
        toggleFollow(data.username);
    };

    useEffect(() => {
        if (!videoRef.current) return;

        const attemptPlay = () => {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => setIsPlaying(true))
                    .catch(error => {
                        console.error("Auto-play prevented:", error);
                        setIsPlaying(false);
                        // If blocked, we might need a user interaction
                    });
            }
        };

        if (isActive) {
            // Give it a tiny bit of time to ensure DOM is ready and src is assigned
            const timer = setTimeout(attemptPlay, 100);
            return () => clearTimeout(timer);
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, [isActive, data.videoUrl]); // Re-run if URL changes too

    const togglePlay = (e) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div
            onClick={togglePlay}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                background: data.videoUrl ? 'black' : bg,
                overflow: 'hidden',
                scrollSnapAlign: 'start',
                cursor: 'pointer'
            }}>
            {/* Video / Content Layer */}
            {data.videoUrl ? (
                <>
                    <video
                        ref={videoRef}
                        src={data.videoUrl}
                        loop
                        muted
                        playsInline
                        preload="auto"
                        autoPlay={isActive}
                        onLoadedData={() => {
                            if (isActive) videoRef.current?.play().catch(e => console.log("onLoadedData play error:", e));
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Play Overlay (appears if active but paused) */}
                    {isActive && !isPlaying && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '20px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'
                        }}>
                            <div style={{
                                width: 0, height: 0, borderTop: '20px solid transparent',
                                borderBottom: '20px solid transparent', borderLeft: '30px solid white',
                                marginLeft: '5px'
                            }} />
                        </div>
                    )}
                </>
            ) : (
                <div className="flex-center full-size">
                    <h2 style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{data.contentPlaceholder || "Video Content"}</h2>
                </div>
            )}

            {/* Right Sidebar Actions */}
            <div style={{
                position: 'absolute',
                right: '10px',
                bottom: '100px', // Above the text area
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                zIndex: 10
            }}>
                {/* Profile Avatar */}
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <div
                        onClick={handleProfileClick}
                        style={{
                            width: '48px', height: '48px', borderRadius: '50%', background: 'white', padding: '1px',
                            overflow: 'hidden', cursor: 'pointer'
                        }}
                    >
                        <img
                            src={data.userAvatar || `https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop`}
                            alt="avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Follow "+" Badge */}
                    {!(currentUser?.username === data.username || currentUser?.followingList?.includes(data.username)) && (
                        <div
                            onClick={handleFollowAction}
                            style={{
                                position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)',
                                width: '24px', height: '24px', background: '#FE2C55', borderRadius: '50%',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Plus size={16} color="white" />
                        </div>
                    )}
                </div>

                <ActionIcon icon={Heart} label={data.likes} color={liked ? "#FE2C55" : "white"} fill={liked ? "#FE2C55" : "none"} onClick={handleLike} />
                <ActionIcon icon={MessageCircle} label={data.comments} />
                <ActionIcon icon={Bookmark} label={data.saves} />
                <ActionIcon icon={Share2} label={data.shares} />

                {/* Disc Animation */}
                <div style={{
                    marginTop: '20px',
                    width: '48px', height: '48px', borderRadius: '50%', background: '#222',
                    border: '8px solid #333', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    animation: 'spin 4s linear infinite',
                    animationPlayState: isPlaying ? 'running' : 'paused'
                }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(45deg, #111, #444)' }}></div>
                </div>
            </div>

            {/* Bottom Info Overlay */}
            <div style={{
                position: 'absolute',
                left: '10px',
                bottom: '80px', // Clear of the nav bar
                width: '75%',
                zIndex: 10,
                textAlign: 'left',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
                <h3 onClick={handleProfileClick} style={{ margin: '0 0 8px 0', fontSize: '1.1rem', cursor: 'pointer' }}>@{data.username}</h3>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', lineHeight: '1.2' }}>
                    {data.description} <span style={{ fontWeight: 'bold' }}>#fyp #trending</span>
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Music size={16} />
                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '200px' }}>
                        <span style={{ display: 'inline-block', animation: 'marquee 5s linear infinite' }}>
                            {data.song} - {data.artist} &nbsp;&nbsp;&nbsp;&nbsp; {data.song} - {data.artist}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActionIcon = ({ icon: Icon, label, color = "white", fill = "none", onClick }) => (
    <div onClick={(e) => { e.stopPropagation(); if (onClick) onClick(e); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
        <Icon size={32} color={color} fill={fill} strokeWidth={2} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
        <span style={{ fontSize: '12px', marginTop: '4px', fontWeight: '600', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{label}</span>
    </div>
);

export default VideoCard;
