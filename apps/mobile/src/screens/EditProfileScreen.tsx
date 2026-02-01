import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/api';

const EditProfileScreen = ({ navigation }: any) => {
    const user = useAuthStore((state) => state.user);
    const setAuth = useAuthStore((state) => state.setAuth);
    const token = useAuthStore((state) => state.token);

    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!username.trim()) {
            Alert.alert('Error', 'Username cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const updatedUser = await authService.updateProfile({
                username: username.trim(),
                bio: bio.trim(),
                avatar_url: avatarUrl.trim(),
            });

            setAuth(updatedUser, token!);
            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Failed to update profile', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Icon name="close-outline" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.headerButton}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#fe2c55" />
                    ) : (
                        <Text style={styles.saveText}>Done</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: avatarUrl || 'https://www.gravatar.com/avatar?d=mp' }}
                            style={styles.avatar}
                        />
                        <View style={styles.cameraIconBadge}>
                            <Icon name="camera" size={20} color="#fff" />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.changeAvatarButton}>
                        <Text style={styles.changeAvatarText}>Change photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Username"
                            placeholderTextColor="#666"
                            autoCapitalize="none"
                        />
                        <Text style={styles.helperText}>gipjazes.com/@{username || 'username'}</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Add a bio to your profile"
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={4}
                            maxLength={80}
                        />
                        <Text style={styles.charCount}>{bio.length}/80</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Avatar URL (Direct Link)</Text>
                        <TextInput
                            style={styles.input}
                            value={avatarUrl}
                            onChangeText={setAvatarUrl}
                            placeholder="https://example.com/image.jpg"
                            placeholderTextColor="#666"
                            autoCapitalize="none"
                        />
                    </View>
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#222',
    },
    headerButton: {
        width: 60,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    saveText: {
        color: '#fe2c55',
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'right',
    },
    content: {
        padding: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1a1a1a',
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    changeAvatarButton: {
        paddingVertical: 4,
    },
    changeAvatarText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    section: {
        marginTop: 8,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'transparent',
        borderBottomWidth: 0.5,
        borderBottomColor: '#333',
        paddingVertical: 10,
        color: '#fff',
        fontSize: 16,
    },
    bioInput: {
        textAlignVertical: 'top',
        minHeight: 40,
    },
    helperText: {
        color: '#555',
        fontSize: 12,
        marginTop: 8,
    },
    charCount: {
        color: '#555',
        fontSize: 12,
        textAlign: 'right',
        marginTop: 4,
    },
});

export default EditProfileScreen;
