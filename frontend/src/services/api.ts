import axios from 'axios';
import { Expense, AuthResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add JWT token to every request if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 errors (token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    register: (user: { username: string; password: string; email: string }) =>
        api.post('/auth/register', user),
    login: (credentials: { username: string; password: string }) =>
        api.post<AuthResponse>('/auth/login', credentials),
};

export const expenseService = {
    getAll: () => api.get<Expense[]>('/expenses'),
    
    //  NEW: Get a single expense by ID
    getById: (id: number) => api.get<Expense>(`/expenses/${id}`),
    
    create: (expense: Omit<Expense, 'id'>) =>
        api.post<Expense>('/expenses', expense),
    
    //  NEW: Update an existing expense
    update: (id: number, expense: Partial<Expense>) =>
        api.put<Expense>(`/expenses/${id}`, expense),
    
    delete: (id: number) => api.delete(`/expenses/${id}`),
};

export default api;