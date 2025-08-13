import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Transaction,
  CreateTransactionRequest,
  CreateTransactionResponse,
  TransactionSearchResponse,
  UpdateTransactionRequest
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/v1/transactions';

  /**
   * Cria uma nova transação
   */
  createTransaction(transaction: CreateTransactionRequest): Observable<CreateTransactionResponse> {
    return this.http.post<CreateTransactionResponse>(this.baseUrl, transaction);
  }

  /**
   * Busca transações com paginação e filtros
   */
  searchTransactions(params: {
    userId: number;
    startDate: string;
    endDate: string;
    type?: string;
    status?: string;
    categoryId?: number;
    isRecurring?: boolean;
    hasInstallments?: boolean;
    description?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    size?: number;
    sortField?: string;
    sortDirection?: string;
  }): Observable<TransactionSearchResponse> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get<TransactionSearchResponse>(`${this.baseUrl}/search`, { params: httpParams });
  }

  /**
   * Busca uma transação por ID
   */
  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/${id}`);
  }

  /**
   * Atualiza uma transação
   */
  updateTransaction(id: number, transaction: UpdateTransactionRequest): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.baseUrl}/${id}`, transaction);
  }

  /**
   * Deleta uma transação
   */
  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
