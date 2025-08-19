import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.post<CreateAccountResponse>(this.baseUrl, accountData);
  }

  getAccounts(userId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/user/${userId}`);
  }

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/${id}`);
  }

  updateAccount(id: number, accountData: Partial<CreateAccountRequest>): Observable<Account> {
    return this.http.put<Account>(`${this.baseUrl}/${id}`, accountData);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  loadAccounts(userId: number): void {
    this.isLoading.set(true);
    this.getAccounts(userId).subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar contas:', error);
        this.isLoading.set(false);
      }
    });
  }

  addAccount(account: Account): void {
    this.accounts.update(accounts => [...accounts, account]);
  }

  removeAccount(id: number): void {
    this.accounts.update(accounts => accounts.filter(account => account.accountId !== id));
  }

  updateAccountInList(updatedAccount: Account): void {
    this.accounts.update(accounts =>
      accounts.map(account =>
        account.accountId === updatedAccount.accountId ? updatedAccount : account
      )
    );
  }
}
