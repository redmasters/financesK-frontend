import { Injectable, inject, signal } from '@angular/core';
import { TransactionApiService } from './transaction-api.service';
import {
  Transaction,
  CreateTransactionRequest,
  CreateTransactionResponse,
  TransactionSearchResponse,
  UpdateTransactionRequest,
  TransactionSearchParams
} from '../models/transaction.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionApiService = inject(TransactionApiService);

  // Signal para lista de transações
  private transactionsSignal = signal<Transaction[]>([]);
  private totalElementsSignal = signal<number>(0);
  private totalPagesSignal = signal<number>(0);
  private currentPageSignal = signal<number>(0);
  private loadingSignal = signal<boolean>(false);

  // Getters para os signals
  get transactions() {
    return this.transactionsSignal.asReadonly();
  }

  get totalElements() {
    return this.totalElementsSignal.asReadonly();
  }

  get totalPages() {
    return this.totalPagesSignal.asReadonly();
  }

  get currentPage() {
    return this.currentPageSignal.asReadonly();
  }

  get loading() {
    return this.loadingSignal.asReadonly();
  }

  /**
   * Cria uma nova transação
   */
  createTransaction(transaction: CreateTransactionRequest): Observable<CreateTransactionResponse> {
    return this.transactionApiService.createTransaction(transaction);
  }

  /**
   * Busca transações com paginação e filtros
   */
  searchTransactions(params: TransactionSearchParams): Observable<TransactionSearchResponse> {
    this.loadingSignal.set(true);

    return this.transactionApiService.searchTransactions(params).pipe(
      tap(response => {
        this.transactionsSignal.set(response.content);
        this.totalElementsSignal.set(response.page.totalElements);
        this.totalPagesSignal.set(response.page.totalPages);
        this.currentPageSignal.set(response.page.number);
        this.loadingSignal.set(false);
      })
    );
  }

  /**
   * Busca uma transação por ID
   */
  getTransactionById(id: number): Observable<Transaction> {
    return this.transactionApiService.getTransactionById(id);
  }

  /**
   * Atualiza uma transação
   */
  updateTransaction(id: number, transaction: UpdateTransactionRequest): Observable<Transaction> {
    return this.transactionApiService.updateTransaction(id, transaction);
  }

  /**
   * Deleta uma transação
   */
  deleteTransaction(id: number): Observable<void> {
    return this.transactionApiService.deleteTransaction(id).pipe(
      tap(() => {
        // Remove a transação da lista local após deletar
        const currentTransactions = this.transactionsSignal();
        const updatedTransactions = currentTransactions.filter(t => t.id !== id);
        this.transactionsSignal.set(updatedTransactions);

        // Atualiza o total de elementos
        this.totalElementsSignal.set(this.totalElementsSignal() - 1);
      })
    );
  }

  /**
   * Limpa a lista de transações
   */
  clearTransactions(): void {
    this.transactionsSignal.set([]);
    this.totalElementsSignal.set(0);
    this.totalPagesSignal.set(0);
    this.currentPageSignal.set(0);
  }
}
