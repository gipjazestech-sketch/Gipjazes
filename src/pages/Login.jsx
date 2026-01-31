import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User } from 'lucide-react';

const Login = ({ onSuccess }) => {
    const [username, setUsername] = useState('');
    const { login } = useApp();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            login(username.trim());
            onSuccess();
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

            <h2 style={{ marginBottom: '10px' }}>Log in to FlowStream</h2>
            <p style={{ color: '#888', marginBottom: '30px' }}>Manage your account, check notifications, comment on videos, and more.</p>

            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '300px' }}>
                <input
                    type="text"
                    placeholder="Username (e.g. cool_user)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '4px',
                        border: '1px solid #333',
                        background: '#1a1a1a',
                        color: 'white',
                        marginBottom: '15px',
                        outline: 'none',
                        fontSize: '1rem'
                    }}
                />

                <button
                    type="submit"
                    disabled={!username.trim()}
                    style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '4px',
                        border: 'none',
                        background: username.trim() ? '#FE2C55' : '#333',
                        color: username.trim() ? 'white' : '#666',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: username.trim() ? 'pointer' : 'default'
                    }}
                >
                    Log In / Sign Up
                </button>
            </form>
        </div>
    );
};

export default Login;
