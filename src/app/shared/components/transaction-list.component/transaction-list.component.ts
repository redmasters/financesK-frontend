import { Component, Input } from '@angular/core';
import { Transaction, TransactionType, ExpenseType } from '../../../core/models/transaction.model';
import { CurrencyBrlPipe } from '../../pipes/currency-brl.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, CurrencyBrlPipe, DatePipe],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss'
})
export class TransactionListComponent {
  constructor(public categoryService: CategoryService) {}
  @Input() transactions: Transaction[] = [];
  activeTab: string = 'all';

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getFilteredTransactions(): Transaction[] {
    switch (this.activeTab) {
      case 'income':
        return this.transactions.filter(t => t.type === TransactionType.INCOME);
      case 'expense':
        return this.transactions.filter(t => t.type === TransactionType.EXPENSE);
      case 'recurrent':
        return this.transactions.filter(t => t.expenseType === ExpenseType.RECURRENT);
      case 'installment':
        return this.transactions.filter(t => t.expenseType === ExpenseType.INSTALLMENT);
      default:
        return this.transactions;
    }
  }

  getExpenseTypeClass(transaction: Transaction): string {
    switch (transaction.expenseType) {
      case ExpenseType.RECURRENT: return 'type-rec';
      case ExpenseType.INSTALLMENT: return 'type-parc';
      default: return 'type-avulso';
    }
  }

  getCategory(id: string) {
    return this.categoryService.getCategoryById(id);
  }
}
