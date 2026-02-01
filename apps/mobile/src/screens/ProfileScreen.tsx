import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = SCREEN_WIDTH / COLUMN_COUNT;

import { videoService, authService } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTab] = useState('videos');
    const [userVideos, setUserVideos] = useState([]);
    const { user, logout } = useAuthStore();

    React.useEffect(() => {
        const loadVideos = async () => {
            if (!user?.id) return;
            try {
                const videos = await videoService.getUserVideos(user.id, 1);
                setUserVideos(videos);
            } catch (e) {
                console.error(e);
            }
        };
        loadVideos();
    }, [user?.id]);

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.navBar}>
                <Icon name="person-add-outline" size={24} color="#fff" />
                <Text style={styles.navTitle}>{user?.username || 'Profile'}</Text>
                <TouchableOpacity onPress={logout}>
                    <Icon name="log-out-outline" size={24} color="#fe2c55" />
                </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
                <Image
                    source={{ uri: user?.avatar_url || 'https://www.gravatar.com/avatar?d=mp' }}
                    style={styles.avatar}
                />
                <Text style={styles.username}>@{user?.username}</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{user?.following_count || 0}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{user?.followers_count || 0}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Likes</Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.editProfileButton}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Text style={styles.buttonText}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareButton}>
                        <Icon name="share-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
            </View>

            <View style={styles.tabContainer}>
                {['videos', 'likes', 'private'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tabItem, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Icon
                            name={
                                tab === 'videos' ? 'grid-outline' :
                                    tab === 'likes' ? 'heart-outline' : 'lock-closed-outline'
                            }
                            size={24}
                            color={activeTab === tab ? '#fff' : '#888'}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderVideoItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.gridItem}>
            {/* Fallback to user avatar if no thumbnail, or use ffmpeg generated thumbnail */}
            <Image source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/150' }} style={styles.gridImage} />
            <View style={styles.viewCountOverlay}>
                <Icon name="play-outline" size={12} color="#fff" />
                <Text style={styles.viewCountText}>{item.views || '0'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlashList
                data={activeTab === 'videos' ? userVideos : []}
                renderItem={renderVideoItem}
                ListHeaderComponent={renderHeader}
                numColumns={COLUMN_COUNT}
                estimatedItemSize={ITEM_WIDTH * 1.5}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No videos yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    listContent: {
        paddingBottom: 20,
    },
    headerContainer: {
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    navTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    profileInfo: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#222',
    },
    username: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 40,
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#888',
        fontSize: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    editProfileButton: {
        backgroundColor: '#222',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 4,
        marginRight: 10,
    },
    shareButton: {
        backgroundColor: '#222',
        padding: 10,
        borderRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    bio: {
        color: '#fff',
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#fff',
    },
    gridItem: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.3, // Aspect ratio 3:4 roughly
        padding: 1,
    },
    gridImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#333',
    },
    viewCountOverlay: {
        position: 'absolute',
        bottom: 5,
        left: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewCountText: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#666',
    },
});

export default ProfileScreen;
