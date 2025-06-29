import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import { environment } from '../../environments/environment'

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface SpendStatus {
  id: number;
  name: string;
}

export interface Spend {
  id: number;
  name: string;
  description: string;
  amount: number;
  dueDate: string;
  categoryId: number;
  isDue: boolean;
  isPaid: boolean;
  isRecurring: boolean;
  status: SpendStatus
}

export interface SpendSearchParams {
  startDate?: any;
  endDate?: any;
  isPaid?: boolean | null;
  isDue?: boolean | null;
  categoryId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/spend-categories/all`);
  }

  getCategoryById(id: number): Observable<Category> {
   return this.http.get<Category>(`${this.apiUrl}/spend-categories/${id}`);
  }

  getCategoryByName(name: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/spend-categories?name=${name}`);
  }

  updateCategory(id: number, data: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/spend-categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/spend-categories/${id}`);
  }

  createCategory(name: string, description: string): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/spend-categories`,
      {
        name,
        description
      });
  }

  createSpend(spendData: {
    name: string;
    description: string;
    amount: number;
    dueDate: string;
    categoryId: number;
    isDue: boolean;
    isPaid: boolean;
    isRecurring: boolean;
  }): Observable<Spend> {
    return this.http.post<Spend>(`${this.apiUrl}/spend`, spendData);
  }

  getSpends(): Observable<Spend[]> {
    return this.http.get<Spend[]>(`${this.apiUrl}/spend/all`);
  }

  getSpendById(id: number): Observable<Spend> {
    return this.http.get<Spend>(`${this.apiUrl}/spend/${id}`);
  }

  getSpendsByCategoryId(categoryId: number): Observable<Spend[]> {
    return this.http.get<Spend[]>(`${this.apiUrl}/spend/category/${categoryId}`);
  }

  getSpendsByStatus(statusName: string): Observable<Spend[]> {
    return this.http.get<Spend[]>(`${this.apiUrl}/spend/status?name=${statusName}`);
  }

  getAllStatuses(): Observable<SpendStatus[]> {
    return this.http.get<SpendStatus[]>(`${this.apiUrl}/spend/status/all`);
  }

  updateSpend(id: number, spendData: Partial<Spend>): Observable<Spend> {
    return this.http.put<Spend>(`${this.apiUrl}/spend/${id}`, spendData);
  }

  deleteSpend(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/spend/${id}`);
  }

  searchSpends(params: SpendSearchParams): Observable<Spend[]> {
    let httpParams = new HttpParams()
      .set('startDate', params.startDate)
      .set('endDate', params.endDate)

    if(params.isPaid !== undefined && params.isPaid !== null) {
      httpParams = httpParams.set('isPaid', params.isPaid);
    }

    if(params.isDue !== undefined && params.isDue !== null) {
      httpParams = httpParams.set('isDue', params.isDue);
    }

    if(params.categoryId !== undefined && params.categoryId !== null) {
      httpParams = httpParams.set('categoryId', params.categoryId);
    }
    return this.http.get<Spend[]>(`${this.apiUrl}/spend/search`, { params: httpParams });
  }

}
