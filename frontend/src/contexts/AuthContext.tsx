import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

interface AuthContextType {
    user: string | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, email: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('username');
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await authService.login({ username, password });
            const { token, username: userName } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('username', userName);
            
            setToken(token);
            setUser(userName);
        } catch (error) {
            throw new Error('Login failed. Please check your credentials.');
        }
    };

    const register = async (username: string, password: string, email: string) => {
        try {
            await authService.register({ username, password, email });
        } catch (error) {
            throw new Error('Registration failed. Please try again.');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};