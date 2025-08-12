import {Component, computed, inject, signal} from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { BalanceService } from '../../services/balance.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { SummaryCardComponent } from '../../../shared/components/summary-card.component/summary-card.component';
import { CommonModule, DatePipe } from '@angular/common';
import { CategoryItemComponent } from '../../../shared/components/category-item.component/category-item.component';
import { TransactionListComponent } from '../../../shared/components/transaction-list.component/transaction-list.component';
import { PieChartComponent } from '../../../shared/components/pie-chart.component/pie-chart.component';
import { Transaction } from '../../models/transaction.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyBrlPipe,
    SummaryCardComponent,
    CategoryItemComponent,
    TransactionListComponent,
    PieChartComponent,
    DatePipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  // Expor Math para o template
  public Math = Math;

  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  public balanceService = inject(BalanceService);
// Inicializar propriedades após serviços
  transactions = this.transactionService.transactions$;
  categories = signal<Category[]>(this.categoryService.getAllCategories());
  balanceData = computed(() => this.balanceService.monthlyBalance());
  progressPercentage = computed(() => this.balanceService.getProgressPercentage());
  salaryDate = computed(() => this.balanceService.getSalaryDate());
  projectedBalance = computed(() => this.balanceService.getProjectedBalance());
  today = new Date();

  // Computed signals para porcentagens
  totalExpensesPercentage = computed(() => {
    const income = this.balanceService.monthlyIncome();
    return income ? Math.round((this.balanceService.monthlyExpenses() / income) * 100) : 0;
  });

  recurringExpensesPercentage = computed(() => {
    const income = this.balanceService.monthlyIncome();
    return income ? Math.round((this.balanceService.recurringExpenses() / income) * 100) : 0;
  });

  installmentExpensesPercentage = computed(() => {
    const income = this.balanceService.monthlyIncome();
    return income ? Math.round((this.balanceService.installmentExpenses() / income) * 100) : 0;
  });

  // Computed signal para totais de categorias
  categoryTotals = computed(() => {
    const totals: { [key: string]: number } = {};
    this.transactions()
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const categoryId = transaction.categoryId;
        totals[categoryId] = (totals[categoryId] || 0) + transaction.amount;
      });
    return totals;
  });

  // Computed signal para dados do gráfico
  chartData = computed(() => {
    const data: { labels: string[]; values: number[]; colors: string[] } = {
      labels: [],
      values: [],
      colors: []
    };

    for (const category of this.categories()) {
      if (category.type === 'expense' && this.categoryTotals()[category.id]) {
        data.labels.push(category.name);
        data.values.push(this.categoryTotals()[category.id]);
        data.colors.push(category.color);
      }
    }

    return data;
  });

  get progressBarWidth() {
    return `${this.progressPercentage()}%`;
  }

  getSalaryDateFormatted(): string | null {
    const date = this.salaryDate();
    if (!date) return null;

    // Formatar manualmente sem usar DatePipe
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
