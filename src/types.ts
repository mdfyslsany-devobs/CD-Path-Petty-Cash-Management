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
  createdBy: string;
}

export interface CashIn {
  id: string;
  date: string;
  amount: number;
  source: string;
  createdAt: number;
  createdBy: string;
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
  'Laboratory Reagents',
  'Cleaning Supplies',
  'Stationaries',
  'Office Supplies',
  'Maintenance',
  'Repairs & Maintenance',
  'Emergency Staff Refreshments',
  'Utilities',
  'IT Support & Software',
  'Laundry Services',
  'Waste Management',
  'Patient Food & Nutrition',
  'Travel & Transport',
  'Printing & Photocopying',
  'Uniforms & Apparel',
  'Security Services',
  'Postage & Courier',
  'Miscellaneous'
];
