import React from 'react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

interface CategoryBreakdownProps {
    expenses: any[];
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ expenses }) => {
    // Group by category
    const categoryData: Record<string, { total: number; count: number }> = {};
    expenses.forEach(exp => {
        if (!categoryData[exp.category]) {
            categoryData[exp.category] = { total: 0, count: 0 };
        }
        categoryData[exp.category].total += exp.amount;
        categoryData[exp.category].count += 1;
    });

    // Sort by total descending
    const sortedCategories = Object.entries(categoryData)
        .sort((a, b) => b[1].total - a[1].total);

    // Find max for progress bar
    const maxTotal = sortedCategories.length > 0 ? sortedCategories[0][1].total : 0;

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Category wise Expenses</h3>
            {sortedCategories.length === 0 ? (
                <p style={styles.emptyText}>No expenses yet</p>
            ) : (
                sortedCategories.map(([category, data]) => (
                    <div key={category} style={styles.categoryItem}>
                        <div style={styles.categoryRow}>
                            <div style={styles.categoryLabel}>
                                <span style={{
                                    ...styles.categoryDot,
                                    backgroundColor: CATEGORY_COLORS[category] || '#DFE6E9',
                                }} />
                                <span style={styles.categoryName}>
                                    {CATEGORY_LABELS[category] || category}
                                </span>
                            </div>
                            <span style={styles.categoryAmount}>
                                ${data.total.toFixed(0)}
                            </span>
                        </div>
                        <div style={styles.barContainer}>
                            <div style={{
                                ...styles.barFill,
                                width: `${(data.total / maxTotal) * 100}%`,
                                backgroundColor: CATEGORY_COLORS[category] || '#DFE6E9',
                            }} />
                        </div>
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
        height: '100%',
    },
    title: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#1a1a2e',
        marginTop: 0,
        marginBottom: '1rem',
    },
    categoryItem: {
        marginBottom: '1rem',
    },
    categoryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.25rem',
    },
    categoryLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    categoryDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        display: 'inline-block',
    },
    categoryName: {
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#1a1a2e',
    },
    categoryAmount: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#1a1a2e',
    },
    barContainer: {
        width: '100%',
        height: '4px',
        background: '#f0f0f0',
        borderRadius: '2px',
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: '2px',
        transition: 'width 0.5s ease',
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
        padding: '1rem 0',
    },
};

export default CategoryBreakdown;