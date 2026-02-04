import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatService } from '../services/api';
import Icon from 'react-native-vector-icons/Ionicons';

const ChatListScreen = ({ navigation }: any) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchConversations();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchConversations = async () => {
        try {
            const data = await chatService.getConversationsList();
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        } finally {
            setLoading(false);
        }
    };

    const renderConversation = ({ item }: any) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('ChatDetail', {
                recipientId: (item.sender_id === item.other_id ? item.recipient_id : item.sender_id), // Logic depends on query result
                recipientName: item.other_username,
                recipientAvatar: item.other_avatar
            })}
        >
            <Image source={{ uri: item.other_avatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={styles.username}>{item.other_username}</Text>
                    <Text style={styles.time}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text style={[styles.lastMessage, !item.is_read && styles.unreadMessage]} numberOfLines={1}>
                    {item.content}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                <TouchableOpacity>
                    <Icon name="create-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#fe2c55" />
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderConversation}
                    keyExtractor={(item: any) => item.id}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Icon name="chatbubbles-outline" size={60} color="#333" />
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubtext}>Connect with creators to start chatting</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#333',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    chatItem: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#222',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    username: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    time: {
        color: '#888',
        fontSize: 12,
    },
    lastMessage: {
        color: '#888',
        fontSize: 14,
    },
    unreadMessage: {
        color: '#fff',
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
    },
    emptySubtext: {
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
});

export default ChatListScreen;
