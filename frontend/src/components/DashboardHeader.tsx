import React from 'react';

interface DashboardHeaderProps {
    username: string;
    totalExpenses: number;
    budget: number;
    expensesCount: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    username,
    totalExpenses,
    budget,
    expensesCount,
}) => {
    const progress = budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0;
    const percentUsed = Math.round(progress);
    const remaining = Math.max(budget - totalExpenses, 0);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <div>
                    <h1 style={styles.greeting}>{getGreeting()}, {username}</h1>
                    <p style={styles.date}>{dateStr}</p>
                </div>
                <div style={styles.statsBadge}>
                    <span style={styles.badgeText}>{expensesCount} Expenses</span>
                </div>
            </div>

            <div style={styles.budgetSection}>
                <div style={styles.budgetHeader}>
                    <span style={styles.budgetLabel}>Monthly Budget</span>
                    <span style={styles.budgetValue}>${budget.toLocaleString()}</span>
                </div>
                <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <div style={styles.progressLabels}>
                        <span style={styles.progressLabel}>${totalExpenses.toLocaleString()} spent</span>
                        <span style={styles.progressLabel}>{percentUsed}% used</span>
                    </div>
                </div>
                <div style={styles.remainingSection}>
                    <span style={styles.remainingLabel}>Remaining this month</span>
                    <span style={styles.remainingValue}>${remaining.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '16px',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem',
    },
    headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.5rem',
    },
    greeting: {
        fontSize: '2rem',
        fontWeight: '700',
        margin: 0,
    },
    date: {
        color: '#a8a8b8',
        fontSize: '0.9rem',
        margin: '0.25rem 0 0 0',
    },
    statsBadge: {
        background: 'rgba(255,255,255,0.1)',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    badgeText: {
        fontSize: '0.875rem',
        color: '#a8a8b8',
    },
    budgetSection: {
        marginTop: '0.5rem',
    },
    budgetHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
    },
    budgetLabel: {
        fontSize: '0.875rem',
        color: '#a8a8b8',
    },
    budgetValue: {
        fontSize: '1rem',
        fontWeight: '600',
    },
    progressContainer: {
        marginBottom: '0.5rem',
    },
    progressBar: {
        width: '100%',
        height: '8px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #00d4ff, #00b8d4)',
        borderRadius: '4px',
        transition: 'width 0.5s ease',
    },
    progressLabels: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '0.25rem',
    },
    progressLabel: {
        fontSize: '0.75rem',
        color: '#a8a8b8',
    },
    remainingSection: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '0.5rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
    },
    remainingLabel: {
        fontSize: '0.875rem',
        color: '#a8a8b8',
    },
    remainingValue: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#00d4ff',
    },
};

export default DashboardHeader;