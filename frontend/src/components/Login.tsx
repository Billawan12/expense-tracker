import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Welcome Back</h2>
                <p style={styles.subtitle}>Sign in to track your expenses</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            style={styles.input}
                        />
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don't have an account? <Link to="/register" style={styles.link}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '2rem',
    },
    card: {
        background: 'white',
        padding: '3rem 2.5rem',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '420px',
    },
    title: {
        fontSize: '2rem',
        color: '#1a1a2e',
        marginBottom: '0.5rem',
        textAlign: 'center',
    },
    subtitle: {
        color: '#666',
        textAlign: 'center',
        marginBottom: '2rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    inputGroup: {
        width: '100%',
    },
    input: {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'border-color 0.3s ease',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#00d4ff',
        color: '#1a1a2e',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '0.75rem',
        borderRadius: '8px',
        fontSize: '0.875rem',
        textAlign: 'center',
    },
    footer: {
        textAlign: 'center',
        marginTop: '1.5rem',
        color: '#666',
    },
    link: {
        color: '#00d4ff',
        textDecoration: 'none',
        fontWeight: '600',
    },
};

export default Login;