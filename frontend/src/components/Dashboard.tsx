import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { expenseService } from '../services/api';
import { Expense } from '../types';
import DashboardHeader from './DashboardHeader';
import ExpenseDistributionChart from './ExpenseDistributionChart';
import CategoryBreakdown from './CategoryBreakdown';
import RecentTransactions from './RecentTransactions';

const Dashboard: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            const response = await expenseService.getAll();
            if (Array.isArray(response.data)) {
                setExpenses(response.data);
            } else {
                setExpenses([]);
            }
        } catch (err) {
            setError('Failed to load expenses');
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await expenseService.delete(id);
                await loadExpenses();
            } catch (err) {
                alert('Failed to delete expense');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Calculate totals
    const totalExpenses = Array.isArray(expenses) 
        ? expenses.reduce((sum, e) => sum + (e.amount || 0), 0) 
        : 0;

    // Budget: you can make this dynamic or fixed
    const BUDGET = 2000;

    if (loading) {
        return <div style={styles.loading}>Loading dashboard...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    return (
        <div style={styles.container}>
            {/* Dashboard Header with Greeting and Budget */}
            <DashboardHeader 
                username={user || 'User'}
                totalExpenses={totalExpenses}
                budget={BUDGET}
                expensesCount={expenses.length}
            />

            {/* Action Buttons */}
            <div style={styles.actionRow}>
                <Link to="/add" style={styles.addButton}>+ Add Expense</Link>
                <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
            </div>

            {/* Two-column layout: Chart + Category Breakdown */}
            <div style={styles.grid2Col}>
                <ExpenseDistributionChart expenses={expenses} />
                <CategoryBreakdown expenses={expenses} />
            </div>

            {/* Recent Transactions */}
            <RecentTransactions expenses={expenses} onDelete={handleDelete} />
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        background: '#f5f7fa',
        minHeight: '100vh',
    },
    loading: {
        textAlign: 'center',
        padding: '4rem',
        color: '#666',
        background: '#f5f7fa',
        minHeight: '100vh',
    },
    error: {
        textAlign: 'center',
        padding: '4rem',
        color: '#f44336',
        background: '#f5f7fa',
        minHeight: '100vh',
    },
    actionRow: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        justifyContent: 'flex-end',
    },
    addButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#00d4ff',
        color: '#1a1a2e',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        textDecoration: 'none',
        cursor: 'pointer',
        display: 'inline-block',
    },
    logoutButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: 'transparent',
        border: '1px solid #f44336',
        color: '#f44336',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    grid2Col: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
};

export default Dashboard;