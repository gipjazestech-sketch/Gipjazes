import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/api';

const LoginScreen = ({ navigation }: any) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const setAuth = useAuthStore((state) => state.setAuth);

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const data = await authService.login({ username, password });
            setAuth(data.user, data.token);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.inner}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>GIPJAZES</Text>
                    <Text style={styles.tagline}>Advanced Agentic Coding</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.title}>Welcome Back</Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="#888"
                        autoCapitalize="none"
                        value={username}
                        onChangeText={setUsername}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Log In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.footerLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logoText: {
        color: '#fff',
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: 4,
    },
    tagline: {
        color: '#fe2c55',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
        letterSpacing: 1,
    },
    form: {
        width: '100%',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#111',
        borderRadius: 8,
        height: 55,
        paddingHorizontal: 15,
        color: '#fff',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#222',
    },
    button: {
        backgroundColor: '#fe2c55',
        height: 55,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#fe2c55',
        marginBottom: 15,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: {
        color: '#888',
    },
    footerLink: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default LoginScreen;
