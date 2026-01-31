import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, ArrowRight } from 'lucide-react';

const Login = ({ onSuccess }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, register } = useApp();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        const action = isLoginMode ? login : register;
        const result = await action(username.trim(), password.trim());

        setIsLoading(false);

        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || 'Authentication failed');
        }
    };

    return (
        <div style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            backgroundColor: 'black',
            color: 'white',
            padding: '20px'
        }}>
            <div style={{
                width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#222',
                display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px'
            }}>
                <User size={40} color="#666" />
            </div>

            <h2 style={{ marginBottom: '10px' }}>{isLoginMode ? 'Log in' : 'Sign up'}</h2>
            <p style={{ color: '#888', marginBottom: '30px' }}>
                {isLoginMode ? 'Welcome back! Please enter your details.' : 'Create an account to start sharing.'}
            </p>

            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '300px' }}>
                <div style={{ position: 'relative', marginBottom: '15px' }}>
                    <User size={20} color="#666" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            width: '100%', padding: '15px 15px 15px 45px', borderRadius: '4px',
                            border: '1px solid #333', background: '#1a1a1a', color: 'white',
                            outline: 'none', fontSize: '1rem'
                        }}
                    />
                </div>

                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <Lock size={20} color="#666" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%', padding: '15px 15px 15px 45px', borderRadius: '4px',
                            border: '1px solid #333', background: '#1a1a1a', color: 'white',
                            outline: 'none', fontSize: '1rem'
                        }}
                    />
                </div>

                {error && (
                    <div style={{ color: '#FE2C55', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: '100%', padding: '15px', borderRadius: '4px', border: 'none',
                        background: isLoading ? '#555' : '#FE2C55', color: 'white',
                        fontSize: '1rem', fontWeight: 'bold', cursor: isLoading ? 'default' : 'pointer',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                    }}
                >
                    {isLoading ? 'Processing...' : (isLoginMode ? 'Log In' : 'Sign Up')}
                    {!isLoading && <ArrowRight size={20} />}
                </button>
            </form>

            <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#888' }}>
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <span
                    onClick={() => {
                        setIsLoginMode(!isLoginMode);
                        setError('');
                    }}
                    style={{ color: '#FE2C55', cursor: 'pointer', fontWeight: '600' }}
                >
                    {isLoginMode ? 'Sign up' : 'Log in'}
                </span>
            </div>

            <div style={{ marginTop: '40px', fontSize: '0.8rem', color: '#444', textAlign: 'center' }}>
                By continuing, you agree to our Terms of Service and confirm that you have read our Privacy Policy.
            </div>
        </div>
    );
};

export default Login;
