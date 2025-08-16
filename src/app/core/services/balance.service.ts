import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentStatus, TransactionType } from '../models/transaction.model';

export interface FinancialData {
  totalIncome: number;
  totalIncomeFormatted: string;
  totalExpense: number;
  totalExpenseFormatted: string;
  balance: number;
  balanceFormatted: string;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/transactions';

  // Signal para os dados financeiros
  private _financialData = signal<FinancialData>({
    totalIncome: 0,
    totalIncomeFormatted: "0",
    totalExpense: 0,
    totalExpenseFormatted: "0",
    balance: 0,
    balanceFormatted: "0",
    currency: 'R$'
  });

  // Signal para estado de carregamento
  private _loading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  // Getters para acessar os signals
  get financialData() {
    return this._financialData.asReadonly();
  }

  get loading() {
    return this._loading.asReadonly();
  }

  /**
   * Busca dados financeiros com filtros avançados
   */
  refreshFinancialData(
    userId: number,
    accountsId?: number[],
    status?: PaymentStatus,
    categoryId?: number,
    isRecurring?: boolean,
    hasInstallments?: boolean,
    description?: string,
    minAmount?: number,
    maxAmount?: number,
    startDate?: string,
    endDate?: string,
    type?: TransactionType
  ): void {
    this._loading.set(true);

    this.getIncomeExpenseBalance(
      userId,
      status,
      categoryId,
      isRecurring,
      hasInstallments,
      description,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      type
    ).subscribe({
      next: (data) => {
        // Os valores já vêm em reais do backend, não precisam ser convertidos
        this._financialData.set(data);
        this._loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar dados financeiros:', error);
        this._loading.set(false);
        // Em caso de erro, mantém os dados atuais ou valores padrão
        this._financialData.set({
          totalIncome: 0,
          totalIncomeFormatted: "0",
          totalExpense: 0,
          totalExpenseFormatted: "0",
          balance: 0,
          balanceFormatted: "0",
          currency: 'R$'
        });
      }
    });
  }

  /**
   * Chama o endpoint de saldo com filtros avançados
   */
  private getIncomeExpenseBalance(
    userId: number,
    status?: PaymentStatus,
    categoryId?: number,
    isRecurring?: boolean,
    hasInstallments?: boolean,
    description?: string,
    minAmount?: number,
    maxAmount?: number,
    startDate?: string,
    endDate?: string,
    type?: TransactionType
  ): Observable<FinancialData> {
    let params = new HttpParams()
      .set('userId', userId.toString());

    // Adiciona parâmetros obrigatórios de data se fornecidos
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    // Adiciona parâmetros opcionais apenas se definidos
    if (status) {
      params = params.set('status', status);
    }
    if (type) {
      params = params.set('type', type);
    }
    if (categoryId !== undefined) {
      params = params.set('categoryId', categoryId.toString());
    }
    if (isRecurring !== undefined) {
      params = params.set('isRecurring', isRecurring.toString());
    }
    if (hasInstallments !== undefined) {
      params = params.set('hasInstallments', hasInstallments.toString());
    }
    if (description && description.trim()) {
      params = params.set('description', description.trim());
    }
    if (minAmount !== undefined) {
      params = params.set('minAmount', minAmount.toString());
    }
    if (maxAmount !== undefined) {
      params = params.set('maxAmount', maxAmount.toString());
    }

    return this.http.get<FinancialData>(`${this.baseUrl}/stats/income-expense-balance`, { params });
  }
}
