import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FinancialData } from './balance.service';
import { PaymentStatus } from '../models/transaction.model';

export interface FinancialStatsParams {
  userId: number;
  status?: PaymentStatus;
  categoryId?: number | null;
  isRecurring?: boolean;
  hasInstallments?: boolean;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinancialApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  /**
   * Busca estatísticas financeiras do backend
   */
  getIncomeExpenseBalance(params: FinancialStatsParams): Observable<FinancialData> {
    let httpParams = new HttpParams()
      .set('userId', params.userId.toString());

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    if (params.categoryId) {
      httpParams = httpParams.set('categoryId', params.categoryId.toString());
    }

    if (params.isRecurring !== undefined) {
      httpParams = httpParams.set('isRecurring', params.isRecurring.toString());
    }

    if (params.hasInstallments !== undefined) {
      httpParams = httpParams.set('hasInstallments', params.hasInstallments.toString());
    }

    if (params.description) {
      httpParams = httpParams.set('description', params.description);
    }

    if (params.minAmount !== undefined) {
      httpParams = httpParams.set('minAmount', params.minAmount.toString());
    }

    if (params.maxAmount !== undefined) {
      httpParams = httpParams.set('maxAmount', params.maxAmount.toString());
    }

    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }

    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }

    if (params.type) {
      httpParams = httpParams.set('type', params.type);
    }

    return this.http.get<FinancialData>(
      `${this.baseUrl}/transactions/stats/income-expense-balance`,
      { params: httpParams }
    );
  }

  /**
   * Busca estatísticas do mês atual
   */
  getCurrentMonthStats(userId: number, status?: PaymentStatus): Observable<FinancialData> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.getIncomeExpenseBalance({
      userId,
      status,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }
}
