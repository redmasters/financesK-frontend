import { Injectable, computed, signal, inject } from '@angular/core';
import { TransactionService } from './transaction.service';
import {TransactionType, ExpenseType, Transaction} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private transactionService = inject(TransactionService);
  private transactions = this.transactionService.transactions$;

  // Computed values com tipagem forte
  monthlyIncome = computed(() => this.calculateMonthlyIncome());
  monthlyExpenses = computed(() => this.calculateMonthlyExpenses());
  monthlyBalance = computed(() => this.monthlyIncome() - this.monthlyExpenses());
  recurringExpenses = computed(() => this.calculateRecurringExpenses());
  installmentExpenses = computed(() => this.calculateInstallmentExpenses());
  singleExpenses = computed(() => this.calculateSingleExpenses());

  private calculateMonthlyIncome(): number {
    const now = new Date();
    return this.transactions().filter((t: Transaction) =>
      t.type === TransactionType.INCOME &&
      t.date.getMonth() === now.getMonth() &&
      t.date.getFullYear() === now.getFullYear()
    ).reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  }

  private calculateMonthlyExpenses(): number {
    const now = new Date();
    return this.transactions().filter((t: Transaction) =>
      t.type === TransactionType.EXPENSE &&
      t.date.getMonth() === now.getMonth() &&
      t.date.getFullYear() === now.getFullYear()
    ).reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  }

  private calculateRecurringExpenses(): number {
    const now = new Date();
    return this.transactions().filter((t: Transaction) =>
      t.type === TransactionType.EXPENSE &&
      t.expenseType === ExpenseType.RECURRENT &&
      t.date.getMonth() === now.getMonth() &&
      t.date.getFullYear() === now.getFullYear()
    ).reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  }

  private calculateInstallmentExpenses(): number {
    const now = new Date();
    return this.transactions().filter((t: Transaction) =>
      t.type === TransactionType.EXPENSE &&
      t.expenseType === ExpenseType.INSTALLMENT &&
      t.date.getMonth() === now.getMonth() &&
      t.date.getFullYear() === now.getFullYear()
    ).reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  }

  private calculateSingleExpenses(): number {
    const now = new Date();
    return this.transactions().filter((t: Transaction) =>
      t.type === TransactionType.EXPENSE &&
      (!t.expenseType || t.expenseType === ExpenseType.SINGLE) &&
      t.date.getMonth() === now.getMonth() &&
      t.date.getFullYear() === now.getFullYear()
    ).reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  }

  getSalaryDate(): Date | null {
    const salary = this.transactions().find((t: Transaction) =>
      t.type === TransactionType.INCOME &&
      t.categoryId === 'salary'
    );
    return salary ? salary.date : null;
  }

  getProgressPercentage(): number {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return Math.round((today.getDate() / daysInMonth) * 100);
  }

  getProjectedBalance(): number {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dailyExpense = this.monthlyExpenses() / today.getDate();
    return this.monthlyIncome() - (dailyExpense * daysInMonth);
  }

}
