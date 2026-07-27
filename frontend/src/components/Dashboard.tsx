import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { expenseService } from '../services/api';
import { Expense, CATEGORY_LABELS } from '../types';

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
            // Ensure that response.data is an array
            if (Array.isArray(response.data)) {
                setExpenses(response.data);
            } else {
                console.error('Expenses data is not an array:', response.data);
                setExpenses([]);
            }
        } catch (err) {
            console.error('Error loading expenses:', err);
            setError('Failed to load expenses');
            setExpenses([]); // Reset to empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await expenseService.delete(id);
                await loadExpenses(); // Refresh list
            } catch (err) {
                alert('Failed to delete expense');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Safe helpers to avoid errors if expenses is not an array
    const expenseCount = Array.isArray(expenses) ? expenses.length : 0;
    const totalSpent = Array.isArray(expenses) 
        ? expenses.reduce((sum, e) => sum + (e.amount || 0), 0) 
        : 0;
    const categoriesUsed = Array.isArray(expenses) 
        ? new Set(expenses.map(e => e.category)).size 
        : 0;

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading expenses...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>;
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Welcome, {user}!</h1>
                    <p style={styles.subtitle}>Track your spending and manage your finances</p>
                </div>
                <div style={styles.headerActions}>
                    <Link to="/add" style={styles.addButton}>+ Add Expense</Link>
                    <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
                </div>
            </div>

            {/* Stats */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Total Expenses</div>
                    <div style={styles.statValue}>{expenseCount}</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Total Spent</div>
                    <div style={styles.statValue}>{formatCurrency(totalSpent)}</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Categories Used</div>
                    <div style={styles.statValue}>{categoriesUsed}</div>
                </div>
            </div>

            {/* Expense Table */}
            {expenseCount === 0 ? (
                <div style={styles.emptyState}>
                    <p>No expenses found. Start tracking your spending today!</p>
                    <Link to="/add" style={styles.addButton}>Add Your First Expense</Link>
                </div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(expenses) && expenses.map((expense) => (
                                <tr key={expense.id} style={styles.tableRow}>
                                    <td>{formatDate(expense.expenseDate)}</td>
                                    <td>
                                        <span style={styles.categoryBadge}>
                                            {CATEGORY_LABELS[expense.category] || expense.category}
                                        </span>
                                    </td>
                                    <td>{expense.description || '-'}</td>
                                    <td style={styles.amount}>{formatCurrency(expense.amount)}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleDelete(expense.id!)}
                                            style={styles.deleteButton}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    title: {
        fontSize: '2rem',
        margin: 0,
        color: '#1a1a2e',
    },
    subtitle: {
        color: '#666',
        margin: '0.5rem 0 0 0',
    },
    headerActions: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
    },
    addButton: {
        display: 'inline-block',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#00d4ff',
        color: '#1a1a2e',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        textDecoration: 'none',
        cursor: 'pointer',
    },
    logoutButton: {
        padding: '0.5rem 1.5rem',
        backgroundColor: 'transparent',
        border: '1px solid #f44336',
        color: '#f44336',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    statCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        textAlign: 'center',
    },
    statLabel: {
        fontSize: '0.875rem',
        color: '#666',
    },
    statValue: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1a1a2e',
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        overflowX: 'auto',
        padding: '1rem',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableRow: {
        borderBottom: '1px solid #f0f0f0',
    },
    categoryBadge: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: '#e8f0fe',
        color: '#1a73e8',
    },
    amount: {
        fontWeight: '600',
    },
    deleteButton: {
        padding: '0.25rem 0.75rem',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.875rem',
    },
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
};

export default Dashboard;