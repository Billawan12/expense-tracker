import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { expenseService } from '../services/api';
import { CATEGORY_OPTIONS, CATEGORY_LABELS } from '../types';

const EditExpense: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [expense, setExpense] = useState({
        amount: '',
        category: '',
        description: '',
        expenseDate: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadExpense();
    }, [id]);

    const loadExpense = async () => {
        try {
            const response = await expenseService.getById(Number(id));
            const data = response.data;
            setExpense({
                amount: data.amount.toString(),
                category: data.category,
                description: data.description || '',
                expenseDate: data.expenseDate,
            });
        } catch (err) {
            setError('Failed to load expense');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setExpense({ ...expense, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const amount = parseFloat(expense.amount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid amount greater than 0');
                setSaving(false);
                return;
            }

            await expenseService.update(Number(id), {
                amount: amount,
                category: expense.category,
                description: expense.description,
                expenseDate: expense.expenseDate,
            });

            navigate('/dashboard');
        } catch (err) {
            setError('Failed to update expense. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading expense...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Edit Expense</h2>
                <Link to="/dashboard" style={styles.backButton}>← Back</Link>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Amount (USD)</label>
                    <input
                        type="number"
                        name="amount"
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        value={expense.amount}
                        onChange={handleChange}
                        required
                        disabled={saving}
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Category</label>
                    <select
                        name="category"
                        value={expense.category}
                        onChange={handleChange}
                        required
                        disabled={saving}
                        style={styles.input}
                    >
                        <option value="">Select a category</option>
                        {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat} value={cat}>
                                {CATEGORY_LABELS[cat]}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Description (Optional)</label>
                    <input
                        type="text"
                        name="description"
                        placeholder="Brief description"
                        value={expense.description}
                        onChange={handleChange}
                        disabled={saving}
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Date</label>
                    <input
                        type="date"
                        name="expenseDate"
                        value={expense.expenseDate}
                        onChange={handleChange}
                        required
                        disabled={saving}
                        style={styles.input}
                    />
                </div>

                {error && <div style={styles.errorMessage}>{error}</div>}

                <button type="submit" disabled={saving} style={styles.submitButton}>
                    {saving ? 'Updating...' : 'Update Expense'}
                </button>
            </form>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '600px',
        margin: '2rem auto',
        padding: '0 1rem',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '2rem',
        margin: 0,
        color: '#1a1a2e',
    },
    backButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#e0e0e0',
        color: '#1a1a2e',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '500',
    },
    form: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    formGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        fontWeight: '500',
        marginBottom: '0.5rem',
        color: '#1a1a2e',
    },
    input: {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
        boxSizing: 'border-box',
    },
    errorMessage: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '0.75rem',
        borderRadius: '8px',
        fontSize: '0.875rem',
        textAlign: 'center',
        marginBottom: '1rem',
    },
    submitButton: {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#00d4ff',
        color: '#1a1a2e',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
    loading: {
        textAlign: 'center',
        padding: '2rem',
        color: '#666',
    },
    error: {
        textAlign: 'center',
        padding: '2rem',
        color: '#f44336',
    },
};

export default EditExpense;