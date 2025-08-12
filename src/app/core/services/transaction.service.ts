import { Injectable, signal } from '@angular/core';
import { Transaction, TransactionType, ExpenseType } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactions = signal<Transaction[]>(this.loadInitialData());
  transactions$ = this.transactions.asReadonly();

  private loadInitialData(): Transaction[] {
    return [
      {
        id: '1',
        description: 'Salário',
        amount: 4500,
        date: new Date(),
        type: TransactionType.INCOME,
        categoryId: 'salary'
      },
      {
        id: '2',
        description: 'Aluguel',
        amount: 850,
        date: new Date(),
        type: TransactionType.EXPENSE,
        categoryId: 'housing',
        expenseType: ExpenseType.RECURRENT,
        recurrence: 'monthly'
      },
      {
        id: '3',
        description: 'Supermercado',
        amount: 280.30,
        date: new Date(),
        type: TransactionType.EXPENSE,
        categoryId: 'food',
        expenseType: ExpenseType.SINGLE
      },
      {
        id: '4',
        description: 'Smartphone',
        amount: 120.50,
        date: new Date(),
        type: TransactionType.EXPENSE,
        categoryId: 'shopping',
        expenseType: ExpenseType.INSTALLMENT,
        installments: { current: 5, total: 10 }
      }
    ];
  }

  addTransaction(transaction: Transaction): void {
    this.transactions.update(current => [...current, {
      ...transaction,
      id: Date.now().toString()
    }]);
  }

  deleteTransaction(id: string): void {
    this.transactions.update(current => current.filter(t => t.id !== id));
  }
}
