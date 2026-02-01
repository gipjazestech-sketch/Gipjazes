import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Image,
    ActivityIndicator,
} from 'react-native';
import { chatService } from '../services/api';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/useAuthStore';

const ChatDetailScreen = ({ route, navigation }: any) => {
    const { recipientId, recipientName, recipientAvatar } = route.params;
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    const currentUser = useAuthStore(state => state.user);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Polling for demo
        return () => clearInterval(interval);
    }, [recipientId]);

    const fetchMessages = async () => {
        try {
            const data = await chatService.getConversation(recipientId);
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch conversation', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const text = inputText;
        setInputText('');

        try {
            const newMessage = await chatService.sendMessage(recipientId, text);
            setMessages([...messages, newMessage]);
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const renderMessage = ({ item }: any) => {
        const isMe = item.sender_id === currentUser?.id;
        return (
            <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
                <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
                        {item.content}
                    </Text>
                </View>
                <Text style={styles.timestamp}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Image source={{ uri: recipientAvatar || 'https://via.placeholder.com/100' }} style={styles.headerAvatar} />
                    <Text style={styles.headerName}>{recipientName}</Text>
                </View>
                <TouchableOpacity>
                    <Icon name="call-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color="#fe2c55" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item: any) => item.id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Icon name="add-circle-outline" size={28} color="#fff" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Say something nice..."
                        placeholderTextColor="#888"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Icon name="send" size={24} color={inputText.trim() ? "#fe2c55" : "#444"} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#333',
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#222',
    },
    headerName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    messageList: {
        paddingHorizontal: 15,
        paddingVertical: 20,
    },
    messageWrapper: {
        marginBottom: 15,
        maxWidth: '80%',
    },
    myMessageWrapper: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    theirMessageWrapper: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    messageBubble: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
    },
    myBubble: {
        backgroundColor: '#fe2c55',
        borderBottomRightRadius: 2,
    },
    theirBubble: {
        backgroundColor: '#222',
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: 16,
    },
    myText: {
        color: '#fff',
    },
    theirText: {
        color: '#fff',
    },
    timestamp: {
        color: '#666',
        fontSize: 10,
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderTopWidth: 0.5,
        borderTopColor: '#333',
        backgroundColor: '#111',
    },
    attachButton: {
        padding: 5,
    },
    input: {
        flex: 1,
        backgroundColor: '#222',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        color: '#fff',
        maxHeight: 100,
        marginHorizontal: 10,
    },
    sendButton: {
        padding: 5,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatDetailScreen;
