import { Injectable, computed, inject, signal } from '@angular/core';
import { FinancialApiService } from './financial-api.service';
import { PaymentStatus } from '../models/transaction.model';

export interface FinancialData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private financialApiService = inject(FinancialApiService);

  // Signal para dados financeiros vindos do backend
  private backendFinancialData = signal<FinancialData>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    currency: 'R$'
  });

  // Dados financeiros formatados para exibição (vindos do backend)
  financialData = computed((): FinancialData => this.backendFinancialData());

  constructor() {
    // Carrega dados iniciais do backend sem status específico
    this.loadFinancialData();
  }

  /**
   * Carrega dados financeiros do backend
   */
  loadFinancialData(userId: number = 1, status?: PaymentStatus): void {
    this.financialApiService.getCurrentMonthStats(userId, status).subscribe({
      next: (data) => {
        this.backendFinancialData.set(data);
      },
      error: (error) => {
        console.error('Erro ao carregar dados financeiros:', error);
        // Mantém dados padrão em caso de erro
      }
    });
  }

  /**
   * Recarrega dados financeiros com parâmetros específicos
   */
  refreshFinancialData(
    userId: number,
    status?: PaymentStatus | 'ALL',
    categoryId?: number | null,
    startDate?: string,
    endDate?: string,
    type?: string
  ): void {
    // Se status for 'ALL', não envia o parâmetro status para a API
    const apiStatus = status === 'ALL' ? undefined : status as PaymentStatus;
    // Se categoryId for 'ALL', não envia o parâmetro categoryId para a API
    const apiCategoryId = categoryId === null ? undefined : categoryId;

    this.financialApiService.getIncomeExpenseBalance({
      userId,
      status: apiStatus,
      categoryId: apiCategoryId,
      startDate,
      endDate,
      type
    }).subscribe({
      next: (data) => {
        this.backendFinancialData.set(data);
      },
      error: (error) => {
        console.error('Erro ao recarregar dados financeiros:', error);
      }
    });
  }

  /**
   * Formata valores monetários em Real Brasileiro
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}
