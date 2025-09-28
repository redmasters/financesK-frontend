import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankInstitution } from '../models/bank-institution.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BankInstitutionService {
  private readonly baseUrl = `${environment.apiUrl}/bank`;

  // Signal para cache das instituições
  private _bankInstitutions = signal<BankInstitution[]>([]);
  private _isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  get bankInstitutions() {
    return this._bankInstitutions.asReadonly();
  }

  get isLoading() {
    return this._isLoading.asReadonly();
  }

  /**
   * Busca todas as instituições bancárias
   */
  getAllBankInstitutions(): Observable<BankInstitution[]> {
    return this.http.get<BankInstitution[]>(`${this.baseUrl}/all`);
  }

  /**
   * Busca uma instituição bancária por ID
   */
  getBankInstitutionById(id: number): Observable<BankInstitution> {
    return this.http.get<BankInstitution>(`${this.baseUrl}?id=${id}`);
  }

  /**
   * Carrega todas as instituições bancárias e armazena no signal
   */
  loadAllBankInstitutions(): void {
    this._isLoading.set(true);
    this.getAllBankInstitutions().subscribe({
      next: (institutions) => {
        console.log('Instituições bancárias carregadas:', institutions);
        this._bankInstitutions.set(institutions);
        this._isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar instituições bancárias:', error);
        this._bankInstitutions.set([]);
        this._isLoading.set(false);
      }
    });
  }

  /**
   * Busca o nome de uma instituição bancária por ID
   */
  getBankInstitutionName(id: number): string {
    const institution = this._bankInstitutions().find(bank => bank.institutionId === id);
    return institution?.institutionName || `Instituição ${id}`;
  }
}
