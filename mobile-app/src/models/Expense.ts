export interface Expense {
  id: string;
  amount: number;
  description: string;
  created_at: number;
}

export interface Budget {
  monthly_limit: number;
}

export interface FixedExpense {
  id: string;
  amount: number;
  name: string; // Netflix, Celular, etc
  color?: string; // Color para la tarjeta
  icon?: string; // Emoji
}
