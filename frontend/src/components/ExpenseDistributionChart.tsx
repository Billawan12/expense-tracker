import React, { useState, useEffect, useRef } from 'react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

interface ExpenseDistributionChartProps {
    expenses: any[];
}

const ExpenseDistributionChart: React.FC<ExpenseDistributionChartProps> = ({ expenses }) => {
    const [chartReady, setChartReady] = useState(false);
    const chartRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Group expenses by category
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    const labels = Object.keys(categoryTotals);
    const dataValues = Object.values(categoryTotals);
    const backgroundColors = labels.map(cat => CATEGORY_COLORS[cat] || '#DFE6E9');

    // Load Chart.js and react-chartjs-2 dynamically
    useEffect(() => {
        const loadCharts = async () => {
            try {
                // Import chart.js and register components
                const { Chart, ArcElement, Tooltip, Legend } = await import('chart.js');
                Chart.register(ArcElement, Tooltip, Legend);

                // Import react-chartjs-2
                const { Doughnut } = await import('react-chartjs-2');
                chartRef.current = Doughnut;
                setChartReady(true);
            } catch (error) {
                console.error('Failed to load chart libraries:', error);
            }
        };
        loadCharts();
    }, []);

    // If no expenses, show empty state
    if (expenses.length === 0) {
        return (
            <div style={styles.emptyState}>
                <p>No expenses to show yet</p>
                <p style={styles.emptySubtext}>Add some expenses to see your distribution</p>
            </div>
        );
    }

    // If chart libraries not loaded yet, show loading
    if (!chartReady || !chartRef.current) {
        return (
            <div style={styles.container}>
                <h3 style={styles.title}>Expense Distribution</h3>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading chart...
                </div>
            </div>
        );
    }

    // Prepare chart data
    const data = {
        labels: labels.map(cat => CATEGORY_LABELS[cat] || cat),
        datasets: [
            {
                data: dataValues,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#1a1a2e',
            },
        ],
    };

    const options = {
        responsive: true,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#1a1a2e',
                    font: { size: 12 },
                    padding: 12,
                },
            },
        },
    };

    // Render the chart component
    const ChartComponent = chartRef.current;

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Expense Distribution</h3>
            <div style={styles.chartWrapper} ref={containerRef}>
                <div style={styles.centerText}>
                    <div style={styles.centerTotal}>${total.toFixed(0)}</div>
                    <div style={styles.centerLabel}>Total Spent</div>
                </div>
                <ChartComponent data={data} options={options} />
            </div>
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
    chartWrapper: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerText: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 1,
    },
    centerTotal: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1a1a2e',
    },
    centerLabel: {
        fontSize: '0.75rem',
        color: '#666',
    },
    emptyState: {
        textAlign: 'center',
        padding: '2rem',
        color: '#666',
    },
    emptySubtext: {
        fontSize: '0.875rem',
        color: '#999',
        marginTop: '0.5rem',
    },
};

export default ExpenseDistributionChart;