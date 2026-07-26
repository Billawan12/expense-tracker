export interface User {
    id?: number;
    username: string;
    password: string;
    email: string;
}

export interface Expense {
    id?: number;
    amount: number;
    category: string;
    description: string;
    expenseDate: string;
}

export interface AuthResponse {
    token: string;
    username: string;
}

export const CATEGORY_OPTIONS = [
    'FOOD',
    'TRANSPORT',
    'ENTERTAINMENT',
    'SHOPPING',
    'BILLS',
    'HEALTH',
    'EDUCATION',
    'OTHER'
];

export const CATEGORY_LABELS: Record<string, string> = {
    FOOD: 'Food & Dining',
    TRANSPORT: 'Transportation',
    ENTERTAINMENT: 'Entertainment',
    SHOPPING: 'Shopping',
    BILLS: 'Bills & Utilities',
    HEALTH: 'Healthcare',
    EDUCATION: 'Education',
    OTHER: 'Other'
};