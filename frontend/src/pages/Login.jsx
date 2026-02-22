import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('auth_token', data.token); // Store simple token
                localStorage.setItem('username', username);
                toast.success('Login successful!');
                navigate('/dashboard');
            } else {
                toast.error('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Failed to connect to server.');
        }
    };

    return (
        <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card section-card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="form-title" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '2rem' }}>Admin Login</h2>
                <form onSubmit={handleLogin} className="input-group">
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username (admin)"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
