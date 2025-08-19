import {Injectable, inject, signal} from '@angular/core';
import {Observable} from 'rxjs';
import {TransactionApiService} from './transaction-api.service';
import {
  FinancialData,
  Transaction,
  TransactionSearchParams,
  TransactionSearchResponse,
  UpdateTransactionRequest
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionApiService = inject(TransactionApiService);

  // Signals para estado
  private _transactions = signal<Transaction[]>([]);
  private _financialData = signal<FinancialData>({
    totalIncome: 0,
    totalIncomeFormatted: '0',
    totalExpense: 0,
    totalExpenseFormatted: '0',
    balance: 0,
    balanceFormatted: '0',
    currency: 'R$'
  });

  private _loading = signal<boolean>(false);
  private _totalElements = signal<number>(0);
  private _totalPages = signal<number>(0);
  private _currentPage = signal<number>(0);
  private _pageSize = signal<number>(10);

  // Getters read-only para os signals
  get transactions() {
    return this._transactions.asReadonly();
  }

  get financialData() {
    return this._financialData.asReadonly();
  }

  get loading() {
    return this._loading.asReadonly();
  }

  get totalElements() {
    return this._totalElements.asReadonly();
  }

  get totalPages() {
    return this._totalPages.asReadonly();
  }

  get currentPage() {
    return this._currentPage.asReadonly();
  }

  get pageSize() {
    return this._pageSize.asReadonly();
  }

  /**
   * Busca transações com filtros e paginação
   */
  searchTransactions(params: TransactionSearchParams): void {
    this._loading.set(true);

    // Mapeia os parâmetros para o formato esperado pela API
    const apiParams = {
      userId: params.userId,
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page || 0,
      size: params.size || 10,
      sortField: params.sortField || 'DUE_DATE_AND_STATUS',
      sortDirection: params.sortDirection || 'DESC'
    };
    // Adiciona parâmetros opcionais apenas se definidos
    if (params.accountsId && params.accountsId.length > 0) {
      (apiParams as any).accountsId = params.accountsId;
    }
    if (params.type) {
      (apiParams as any).type = params.type;
    }
    if (params.status) {
      (apiParams as any).status = params.status;
    }
    if (params.categoryId) {
      (apiParams as any).categoryId = params.categoryId;
    }
    if (params.isRecurring !== undefined) {
      (apiParams as any).isRecurring = params.isRecurring;
    }
    if (params.hasInstallments !== undefined) {
      (apiParams as any).hasInstallments = params.hasInstallments;
    }
    if (params.description?.trim()) {
      (apiParams as any).description = params.description.trim();
    }
    if (params.minAmount !== undefined) {
      (apiParams as any).minAmount = params.minAmount;
    }
    if (params.maxAmount !== undefined) {
      (apiParams as any).maxAmount = params.maxAmount;
    }

    this.transactionApiService.searchTransactions(apiParams).subscribe({
      next: (response: TransactionSearchResponse | any) => {
        // Nova estrutura da API com dados financeiros integrados
        if (response && response.transactions && Array.isArray(response.transactions.content)) {
          // Estrutura nova: response.transactions.content
          this._transactions.set(response.transactions.content);

          // Dados de paginação da nova estrutura
          if (response.transactions.page) {
            this._totalElements.set(response.transactions.page.totalElements || 0);
            this._totalPages.set(response.transactions.page.totalPages || 0);
            this._currentPage.set(response.transactions.page.number || 0);
            this._pageSize.set(response.transactions.page.size || 20);
          }

          // Dados financeiros da nova estrutura
          const financialData: FinancialData = {
            totalIncome: response.totalIncome || 0,
            totalIncomeFormatted: response.totalIncomeFormatted || 'R$ 0,00',
            totalExpense: response.totalExpense || 0,
            totalExpenseFormatted: response.totalExpenseFormatted || 'R$ 0,00',
            balance: response.balance || 0,
            balanceFormatted: response.balanceFormatted || 'R$ 0,00',
            currency: response.currency || 'R$'
          };
          this._financialData.set(financialData);

        } else if (response && Array.isArray(response.content)) {
          // Estrutura antiga para compatibilidade: response.content
          this._transactions.set(response.content);

          if (response.page) {
            this._totalElements.set(response.page.totalElements || 0);
            this._totalPages.set(response.page.totalPages || 0);
            this._currentPage.set(response.page.number || 0);
            this._pageSize.set(response.page.size || 20);
          } else {
            this._totalElements.set(response.content.length);
            this._totalPages.set(1);
            this._currentPage.set(0);
            this._pageSize.set(20);
          }

          // Verificar se há dados de balanço na estrutura antiga
          if (response.balance) {
            this._financialData.set(response.balance);
          }

        } else if (Array.isArray(response)) {
          // Se a resposta for apenas um array de transações
          this._transactions.set(response);
          this._totalElements.set(response.length);
          this._totalPages.set(1);
          this._currentPage.set(0);
          this._pageSize.set(20);
        } else {
          this._transactions.set([]);
          this._totalElements.set(0);
          this._totalPages.set(0);
          this._currentPage.set(0);
          this._pageSize.set(20);
        }

        this._loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar transações:', error);
        this._transactions.set([]);
        this._totalElements.set(0);
        this._totalPages.set(0);
        this._loading.set(false);
      }
    });
  }

  /**
   * Atualiza uma transação
   */
  updateTransaction(id: number, transaction: UpdateTransactionRequest): Observable<Transaction> {
    return this.transactionApiService.updateTransaction(id, transaction);
  }

  /**
   * Busca uma transação por ID
   */
  getTransactionById(id: number): Observable<Transaction> {
    return this.transactionApiService.getTransactionById(id);
  }

  /**
   * Deleta uma transação
   */
  deleteTransaction(id: number): Observable<void> {
    return this.transactionApiService.deleteTransaction(id);
  }
}
