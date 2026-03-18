export type Department = 'Pathology' | 'ICU' | 'NICU' | 'Dialysis' | 'CT Scan' | 'General Hospital';

export type Category = string;

export interface Expense {
  id: string;
  date: string;
  department: Department;
  category: Category;
  amount: number;
  description: string;
  receiptUrl?: string;
  createdAt: number;
}

export interface CashIn {
  id: string;
  date: string;
  amount: number;
  source: string;
  createdAt: number;
}

export const DEPARTMENTS: Department[] = [
  'Pathology',
  'ICU',
  'NICU',
  'Dialysis',
  'CT Scan',
  'General Hospital'
];

export const DEFAULT_CATEGORIES: Category[] = [
  'Medical Supplies',
  'Stationaries',
  'Maintenance',
  'Emergency Staff Refreshments',
  'Utilities',
  'Miscellaneous'
];
