import React, { useRef, useEffect, useState, memo } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons'; // Needs proper icon set

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoDetails {
    id: string;
    uri: string;
    videoWidth: number;
    videoHeight: number;
    likes: number;
    comments: number;
    description: string;
    isLiked?: boolean;
    isFollowing?: boolean;
    thumbnailUrl?: string;
    user: {
        id: string;
        username: string;
        avatar: string;
    };
}

interface VideoItemProps {
    uri: string;
    isActive: boolean;
    details: VideoDetails;
}

import { videoService } from '../services/api';
import CommentsModal from './CommentsModal';

const VideoItem: React.FC<VideoItemProps> = ({ uri, isActive, details }) => {
    const [isPlaying, setIsPlaying] = useState(isActive);
    const [isLiked, setIsLiked] = useState(details.isLiked || false);
    const [isFollowing, setIsFollowing] = useState(details.isFollowing || false);
    const [showComments, setShowComments] = useState(false);
    const videoRef = useRef<any>(null);

    useEffect(() => {
        setIsPlaying(isActive);
        setIsLiked(details.isLiked || false);
        setIsFollowing(details.isFollowing || false);
    }, [isActive, details]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleLike = async () => {
        const previousState = isLiked;
        setIsLiked(!isLiked);

        try {
            if (!previousState) {
                await videoService.likeVideo(details.id);
            } else {
                await videoService.unlikeVideo(details.id);
            }
        } catch (error) {
            console.error('Like action failed', error);
            setIsLiked(previousState);
        }
    };

    const handleFollow = async () => {
        const previousState = isFollowing;
        setIsFollowing(!isFollowing);

        try {
            if (!previousState) {
                await videoService.followUser(details.user.id);
            } else {
                await videoService.unfollowUser(details.user.id);
            }
        } catch (error) {
            console.error('Follow action failed', error);
            setIsFollowing(previousState);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity activeOpacity={1} onPress={togglePlay} style={styles.videoContainer}>
                <Video
                    ref={videoRef as any}
                    source={{ uri }}
                    style={styles.fullScreenVideo}
                    resizeMode="cover"
                    repeat
                    paused={!isPlaying}
                    posterResizeMode="cover"
                    poster={details.thumbnailUrl || "https://via.placeholder.com/1080x1920"}
                    onBuffer={() => console.log('Buffering...')}
                    onError={(e) => console.log('Video Error:', e)}
                />

                {/* Play Icon Overlay */}
                {!isPlaying && (
                    <View style={styles.playButtonOverlay}>
                        <Icon name="play" size={60} color="rgba(255, 255, 255, 0.7)" />
                    </View>
                )}
            </TouchableOpacity>

            {/* Right Sidebar Actions */}
            <View style={styles.actionColumn}>
                <View style={styles.actionItem}>
                    <Image source={{ uri: details.user.avatar }} style={styles.avatar} />
                    {!isFollowing && (
                        <TouchableOpacity style={styles.followBadge} onPress={handleFollow}>
                            <Icon name="add" size={12} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
                    <Icon name={isLiked ? "heart" : "heart-outline"} size={35} color={isLiked ? "#fe2c55" : "#fff"} />
                    <Text style={styles.actionText}>{details.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => setShowComments(true)}>
                    <Icon name="chatbubble-ellipses-outline" size={35} color="#fff" />
                    <Text style={styles.actionText}>{details.comments}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem}>
                    <Icon name="share-social-outline" size={35} color="#fff" />
                    <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Info Overlay */}
            <View style={styles.infoContainer}>
                <TouchableOpacity onPress={() => {/* Navigate to User Profile */ }} style={styles.usernameContainer}>
                    <Text style={styles.username}>@{details.user.username}</Text>
                </TouchableOpacity>
                <Text style={styles.description} numberOfLines={2}>
                    {details.description}
                </Text>
                <View style={styles.musicRow}>
                    <Icon name="musical-notes" size={16} color="#fff" />
                    <View style={styles.musicTextContainer}>
                        <Text style={styles.musicText}>Original Sound - {details.user.username}</Text>
                    </View>
                </View>
            </View>

            <CommentsModal
                isVisible={showComments}
                onClose={() => setShowComments(false)}
                videoId={details.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: '#000',
        position: 'relative',
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    playButtonOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)', // Dim overlay when paused
    },
    actionColumn: {
        position: 'absolute',
        right: 10,
        bottom: 120, // Adjust based on tab bar height
        alignItems: 'center',
    },
    actionItem: {
        alignItems: 'center',
        marginBottom: 20,
    },
    actionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#fff',
        marginBottom: 10,
    },
    followBadge: {
        position: 'absolute',
        bottom: 8,
        backgroundColor: '#fe2c55',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        position: 'absolute',
        bottom: 90,
        left: 12,
        width: '78%',
        paddingBottom: 10,
    },
    usernameContainer: {
        marginBottom: 8,
    },
    username: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    description: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 12,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    musicRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    musicTextContainer: {
        marginLeft: 8,
        width: '80%',
    },
    musicText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default memo(VideoItem);
