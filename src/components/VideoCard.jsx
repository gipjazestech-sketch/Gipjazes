import React, { useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music } from 'lucide-react';
import { useApp } from '../context/AppContext';

const VideoCard = ({ data, isActive }) => {
    const videoRef = useRef(null);
    const { toggleLike } = useApp();
    const liked = data.liked;

    // Create a placeholder gradient based on ID if no video URL, to give visual variety
    const bgColors = [
        'linear-gradient(45deg, #12c2e9, #c471ed, #f64f59)',
        'linear-gradient(to top, #09203f 0%, #537895 100%)',
        'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)',
        'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)'
    ];
    const bg = bgColors[data.id % bgColors.length];

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background: data.videoUrl ? 'black' : bg,
            overflow: 'hidden',
            scrollSnapAlign: 'start', // Critical for the snap feel
        }}>
            {/* Video / Content Layer */}
            {data.videoUrl ? (
                <video
                    ref={videoRef}
                    src={data.videoUrl}
                    loop
                    muted // Auto-play often requires muted first, user can unmute
                    autoPlay={isActive}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
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
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%', background: 'white', padding: '1px',
                        overflow: 'hidden'
                    }}>
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`} alt="avatar" style={{ width: '100%', height: '100%' }} />
                    </div>

                    {/* Follow "+" Badge */}
                    {/* Hide if it's the current user or already following */}
                    {!(currentUser?.username === data.username || currentUser?.followingList?.includes(data.username)) && (
                        <div
                            onClick={() => toggleFollow(data.username)}
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

                <ActionIcon icon={Heart} label={data.likes} color={liked ? "#FE2C55" : "white"} fill={liked ? "#FE2C55" : "none"} onClick={() => toggleLike(data.id)} />
                <ActionIcon icon={MessageCircle} label={data.comments} />
                <ActionIcon icon={Bookmark} label={data.saves} />
                <ActionIcon icon={Share2} label={data.shares} />

                {/* Disc Animation */}
                <div style={{
                    marginTop: '20px',
                    width: '48px', height: '48px', borderRadius: '50%', background: '#222',
                    border: '8px solid #333', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    animation: 'spin 4s linear infinite'
                }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'url(https://api.dicebear.com/7.x/avataaars/svg?seed=music) center/cover' }}></div>
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
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>@{data.username}</h3>
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
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
        <Icon size={32} color={color} fill={fill} strokeWidth={2} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
        <span style={{ fontSize: '12px', marginTop: '4px', fontWeight: '600', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{label}</span>
    </div>
);

export default VideoCard;
