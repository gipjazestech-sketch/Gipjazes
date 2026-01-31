import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Login from '../pages/Login';
import { Menu, Lock, Eye, Bookmark, Heart, ArrowLeft, Grid } from 'lucide-react';

const Profile = ({ username: propUsername, onBack }) => {
    const { currentUser, videos, toggleFollow, getUserProfile } = useApp();
    const [activeTab, setActiveTab] = useState('videos');
    const [profileUser, setProfileUser] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    const targetUsername = propUsername || currentUser?.username;
    const isMe = currentUser && targetUsername === currentUser.username;

    // Determine which user object to display
    const displayUser = isMe ? currentUser : profileUser;

    React.useEffect(() => {
        if (!isMe && targetUsername) {
            setLoadingProfile(true);
            getUserProfile(targetUsername).then(user => {
                setProfileUser(user);
                setLoadingProfile(false);
            });
        }
    }, [targetUsername, isMe]);

    if (!currentUser && !propUsername) {
        return <Login onSuccess={() => { }} />;
    }

    if (loadingProfile || !displayUser) {
        return <div className="flex-center full-size" style={{ color: 'white' }}>Loading...</div>;
    }

    const userVideos = videos.filter(v => v.username === displayUser.username);
    const isFollowing = currentUser?.followingList?.includes(displayUser.username);

    const handleFollow = () => {
        if (currentUser) {
            toggleFollow(displayUser.username);
            // Update local state for immediate feedback if needed, 
            // though context updates currentUser.followingList, profileUser stats won't auto-update unless re-fetched.
            // For now rely on button state change.
            if (!isMe) {
                setProfileUser(prev => ({
                    ...prev,
                    followers: (prev.followers || 0) + (isFollowing ? -1 : 1)
                }));
            }
        }
    };

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            color: 'white',
            overflowY: 'scroll',
            paddingBottom: '60px'
        }} className="no-scrollbar">

            {/* Header / Top Bar */}
            <div style={{
                padding: '10px 20px',
                paddingTop: '30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                backgroundColor: 'black',
                zIndex: 50
            }}>
                {onBack ? (
                    <div onClick={onBack} style={{ cursor: 'pointer' }}><ArrowLeft size={24} /></div>
                ) : (
                    <div style={{ width: 24 }} />
                )}
                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{displayUser.username}</span>
                <Menu size={24} />
            </div>

            {/* Avatar & Stats */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '10px'
            }}>
                {/* Avatar */}
                <div style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginBottom: '10px',
                    border: '1px solid #333'
                }}>
                    <img src={displayUser.avatar} alt="profile" style={{ width: '100%', height: '100%' }} />
                </div>

                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>@{displayUser.username}</h2>

                {/* Stats */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    marginTop: '15px'
                }}>
                    <Stat count={displayUser.following || 0} label="Following" />
                    <Stat count={displayUser.followers || 0} label="Followers" />
                    <Stat count={displayUser.likes || 0} label="Likes" />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                    {isMe ? (
                        <>
                            <button style={{
                                padding: '10px 40px',
                                backgroundColor: '#333',
                                border: '1px solid #444',
                                color: 'white',
                                fontWeight: '600',
                                borderRadius: '4px'
                            }}>Edit Profile</button>
                            <button style={{
                                padding: '10px 10px',
                                backgroundColor: '#333',
                                border: '1px solid #444',
                                color: 'white',
                                borderRadius: '4px'
                            }}>
                                <Bookmark size={20} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleFollow}
                            style={{
                                padding: '10px 60px',
                                backgroundColor: isFollowing ? '#333' : '#FE2C55',
                                border: isFollowing ? '1px solid #444' : 'none',
                                color: 'white',
                                fontWeight: '600',
                                borderRadius: '4px'
                            }}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>

                <p style={{ marginTop: '15px', textAlign: 'center', maxWidth: '80%', fontSize: '0.9rem', color: '#ddd' }}>
                    {displayUser.bio || "No bio yet."}
                </p>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                marginTop: '20px',
                borderBottom: '1px solid #333',
                position: 'sticky',
                top: '60px',
                backgroundColor: 'black',
                zIndex: 40
            }}>
                <Tab icon={Grid} active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} />
                <Tab icon={Lock} active={activeTab === 'private'} onClick={() => setActiveTab('private')} />
                <Tab icon={Heart} active={activeTab === 'liked'} onClick={() => setActiveTab('liked')} />
                <Tab icon={Bookmark} active={activeTab === 'favorited'} onClick={() => setActiveTab('favorited')} />
            </div>

            {/* Grid Content */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2px',
                marginTop: '2px'
            }}>
                {/* Dynamically render user's uploaded videos */}
                {userVideos.length > 0 ? userVideos.map(video => (
                    <div key={video.id} style={{
                        aspectRatio: '3/4',
                        backgroundColor: '#222',
                        position: 'relative'
                    }}>
                        {video.isLocal || video.videoUrl ? (
                            <video src={video.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #333, #666)' }} />
                        )}

                        <div style={{
                            position: 'absolute',
                            bottom: '5px',
                            left: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                        }}>
                            <Eye size={12} fill="white" /> {100 + (video.id % 500)}
                        </div>
                    </div>
                )) : (
                    // Show placeholders if no videos
                    [1, 2, 3].map(id => (
                        <div key={id} style={{
                            aspectRatio: '3/4',
                            backgroundColor: '#1a1a1a',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: '#333'
                        }}>
                            <span style={{ fontSize: '2rem' }}>+</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const Stat = ({ count, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{count}</span>
        <span style={{ color: '#888', fontSize: '0.85rem' }}>{label}</span>
    </div>
);

const Tab = ({ icon: Icon, active, onClick }) => (
    <div onClick={onClick} style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px 0',
        cursor: 'pointer',
        borderBottom: active ? '2px solid white' : '2px solid transparent',
        color: active ? 'white' : '#666'
    }}>
        <Icon size={20} />
    </div>
);

export default Profile;
