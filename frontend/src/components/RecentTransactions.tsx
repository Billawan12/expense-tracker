import React from 'react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

interface RecentTransactionsProps {
    expenses: any[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ expenses }) => {
    // Show latest 5 expenses
    const recent = [...expenses]
        .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())
        .slice(0, 5);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Recent Transactions</h3>
            {recent.length === 0 ? (
                <p style={styles.emptyText}>No transactions yet</p>
            ) : (
                recent.map((exp, index) => (
                    <div key={exp.id || index} style={styles.transactionItem}>
                        <div style={styles.transactionLeft}>
                            <div style={{
                                ...styles.icon,
                                backgroundColor: CATEGORY_COLORS[exp.category] || '#DFE6E9',
                            }}>
                                <span style={styles.iconText}>
                                    {exp.category?.charAt(0) || '$'}
                                </span>
                            </div>
                            <div>
                                <div style={styles.transactionDescription}>
                                    {exp.description || 'No description'}
                                </div>
                                <div style={styles.transactionMeta}>
                                    <span style={styles.transactionCategory}>
                                        {CATEGORY_LABELS[exp.category] || exp.category}
                                    </span>
                                    <span style={styles.transactionDate}>{formatDate(exp.expenseDate)}</span>
                                </div>
                            </div>
                        </div>
                        <span style={styles.transactionAmount}>-${exp.amount.toFixed(2)}</span>
                    </div>
                ))
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    },
    title: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#1a1a2e',
        marginTop: 0,
        marginBottom: '1rem',
    },
    transactionItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 0',
        borderBottom: '1px solid #f0f0f0',
    },
    transactionLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    icon: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    iconText: {
        color: 'white',
        fontWeight: '700',
        fontSize: '0.875rem',
    },
    transactionDescription: {
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#1a1a2e',
    },
    transactionMeta: {
        display: 'flex',
        gap: '0.75rem',
        marginTop: '0.125rem',
    },
    transactionCategory: {
        fontSize: '0.75rem',
        color: '#666',
    },
    transactionDate: {
        fontSize: '0.75rem',
        color: '#999',
    },
    transactionAmount: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#f44336',
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
        padding: '1rem 0',
    },
};

export default RecentTransactions;