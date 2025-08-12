export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum ExpenseType {
  SINGLE = 'single',
  RECURRENT = 'recurrent',
  INSTALLMENT = 'installment'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  type: TransactionType;
  categoryId: string;
  expenseType?: ExpenseType;
  recurrence?: string;
  installments?: {
    current: number;
    total: number;
  };
}
