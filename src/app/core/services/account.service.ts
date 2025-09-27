import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Account, CreateAccountRequest, CreateAccountResponse } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/accounts';

  // Signals para gerenciar estado
  accounts = signal<Account[]>([]);
  isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  createAccount(accountData: CreateAccountRequest): Observable<CreateAccountResponse> {
    console.log('AccountService: Criando conta:', accountData);
    console.log('AccountService: URL da requisição:', this.baseUrl);

    return this.http.post<CreateAccountResponse>(this.baseUrl, accountData).pipe(
      tap(response => {
        console.log('AccountService: Conta criada com sucesso:', response);
      }),
      catchError(error => {
        console.error('AccountService: Erro ao criar conta:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url || this.baseUrl,
          headers: error.headers,
          error: error.error
        });

        if (error.status === 401) {
          console.error('AccountService: Erro de autenticação - Token JWT pode estar ausente ou inválido');
        }

        return throwError(() => error);
      })
    );
  }

  getAccounts(userId: number): Observable<Account[]> {
    const url = `${this.baseUrl}/user/${userId}`;
    console.log('AccountService: Buscando contas para usuário:', userId);
    console.log('AccountService: URL da requisição:', url);

    return this.http.get<Account[]>(url).pipe(
      tap(accounts => {
        console.log('AccountService: Contas carregadas:', accounts);
      }),
      catchError(error => {
        console.error('AccountService: Erro ao buscar contas:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url || url,
          error: error.error
        });

        if (error.status === 401) {
          console.error('AccountService: Erro de autenticação ao buscar contas');
        }

        return throwError(() => error);
      })
    );
  }

  getAccountById(id: number): Observable<Account> {
    const url = `${this.baseUrl}/${id}`;
    console.log('AccountService: Buscando conta por ID:', id);

    return this.http.get<Account>(url).pipe(
      tap(account => {
        console.log('AccountService: Conta encontrada:', account);
      }),
      catchError(error => {
        console.error('AccountService: Erro ao buscar conta por ID:', error);
        return throwError(() => error);
      })
    );
  }

  updateAccount(id: number, accountData: Partial<CreateAccountRequest>): Observable<Account> {
    const url = `${this.baseUrl}/${id}`;
    console.log('AccountService: Atualizando conta:', id, accountData);

    return this.http.put<Account>(url, accountData).pipe(
      tap(account => {
        console.log('AccountService: Conta atualizada:', account);
      }),
      catchError(error => {
        console.error('AccountService: Erro ao atualizar conta:', error);
        if (error.status === 401) {
          console.error('AccountService: Erro de autenticação ao atualizar conta');
        }
        return throwError(() => error);
      })
    );
  }

  deleteAccount(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    console.log('AccountService: Excluindo conta:', id);

    return this.http.delete<void>(url).pipe(
      tap(() => {
        console.log('AccountService: Conta excluída com sucesso');
      }),
      catchError(error => {
        console.error('AccountService: Erro ao excluir conta:', error);
        if (error.status === 401) {
          console.error('AccountService: Erro de autenticação ao excluir conta');
        }
        return throwError(() => error);
      })
    );
  }

  loadAccounts(userId: number): void {
    console.log('AccountService: Iniciando carregamento de contas para usuário:', userId);
    this.isLoading.set(true);

    this.getAccounts(userId).subscribe({
      next: (accounts) => {
        console.log('AccountService: Contas carregadas com sucesso:', accounts);
        // Garantir que accounts não seja null/undefined
        this.accounts.set(accounts || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('AccountService: Erro ao carregar contas:', error);
        // Em caso de erro, definir como array vazio
        this.accounts.set([]);
        this.isLoading.set(false);
      }
    });
  }

  addAccount(account: Account): void {
    console.log('AccountService: Adicionando conta à lista local:', account);
    this.accounts.update(accounts => [...accounts, account]);
  }

  removeAccount(id: number): void {
    console.log('AccountService: Removendo conta da lista local:', id);
    this.accounts.update(accounts => accounts.filter(account => account.accountId !== id));
  }

  updateAccountInList(updatedAccount: Account): void {
    console.log('AccountService: Atualizando conta na lista local:', updatedAccount);
    this.accounts.update(accounts =>
      accounts.map(account =>
        account.accountId === updatedAccount.accountId ? updatedAccount : account
      )
    );
  }
}
