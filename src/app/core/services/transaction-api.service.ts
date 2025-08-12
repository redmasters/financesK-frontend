import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateTransactionRequest,
  CreateTransactionResponse,
  TransactionSearchParams,
  TransactionSearchResponse
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  /**
   * Cria uma nova transação
   */
  createTransaction(request: CreateTransactionRequest): Observable<CreateTransactionResponse> {
    return this.http.post<CreateTransactionResponse>(
      `${this.baseUrl}/transactions`,
      request
    );
  }

  /**
   * Busca transações com paginação e filtros
   */
  searchTransactions(params: TransactionSearchParams): Observable<TransactionSearchResponse> {
    let httpParams = new HttpParams()
      .set('userId', params.userId.toString())
      .set('startDate', params.startDate)
      .set('endDate', params.endDate)
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 20).toString())
      .set('sortField', params.sortField || 'DUE_DATE')
      .set('sortDirection', params.sortDirection || 'DESC');

    // Adiciona parâmetros opcionais apenas se foram fornecidos
    if (params.type) {
      httpParams = httpParams.set('type', params.type);
    }
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

    return this.http.get<TransactionSearchResponse>(
      `${this.baseUrl}/transactions/search`,
      { params: httpParams }
    );
  }
}
