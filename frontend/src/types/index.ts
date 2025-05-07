export interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface MonthlyReport {
  total_expenses: number;
}

export interface FilterParams {
  category: string;
  start_date: string;
  end_date: string;
}