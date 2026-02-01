import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { videoService } from '../services/api';

interface Comment {
    id: string;
    user_id: string;
    text: string;
    created_at: string;
    username: string;
    avatar_url: string;
}

interface CommentsModalProps {
    isVisible: boolean;
    onClose: () => void;
    videoId: string;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isVisible, onClose, videoId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const data = await videoService.getComments(videoId);
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isVisible) {
            fetchComments();
        }
    }, [isVisible, videoId]);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            await videoService.postComment(videoId, newComment);
            setNewComment('');
            fetchComments(); // Refresh list
        } catch (error) {
            console.error('Failed to post comment', error);
            alert('Failed to post comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderCommentItem = ({ item }: { item: Comment }) => (
        <View style={styles.commentItem}>
            <Image
                source={{ uri: item.avatar_url || 'https://via.placeholder.com/40' }}
                style={styles.commentAvatar}
            />
            <View style={styles.commentTextContainer}>
                <Text style={styles.commentUser}>{item.username}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
                <Text style={styles.commentDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
            <TouchableOpacity style={styles.likeCommentBtn}>
                <Icon name="heart-outline" size={14} color="#888" />
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.dismissArea} onPress={onClose} />
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{comments.length} comments</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator style={styles.loader} color="#fe2c55" />
                    ) : (
                        <FlatList
                            data={comments}
                            renderItem={renderCommentItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>Be the first to comment!</Text>
                                </View>
                            }
                        />
                    )}

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                    >
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Add a comment..."
                                value={newComment}
                                onChangeText={setNewComment}
                                multiline
                            />
                            <TouchableOpacity
                                onPress={handlePostComment}
                                disabled={submitting || !newComment.trim()}
                            >
                                <Text
                                    style={[
                                        styles.postBtn,
                                        (!newComment.trim() || submitting) && styles.postBtnDisabled,
                                    ]}
                                >
                                    {submitting ? '...' : 'Post'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    dismissArea: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        height: '70%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#000',
    },
    loader: {
        marginTop: 50,
    },
    listContent: {
        padding: 15,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 12,
    },
    commentTextContainer: {
        flex: 1,
    },
    commentUser: {
        fontWeight: 'bold',
        fontSize: 13,
        color: '#555',
        marginBottom: 2,
    },
    commentText: {
        fontSize: 14,
        color: '#000',
        lineHeight: 18,
    },
    commentDate: {
        fontSize: 11,
        color: '#888',
        marginTop: 4,
    },
    likeCommentBtn: {
        padding: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        backgroundColor: '#f1f1f2',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        maxHeight: 100,
        fontSize: 14,
    },
    postBtn: {
        color: '#fe2c55',
        fontWeight: 'bold',
        marginLeft: 15,
    },
    postBtnDisabled: {
        color: '#ff8c9f',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: '#888',
    },
});

export default CommentsModal;
