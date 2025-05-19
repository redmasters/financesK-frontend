import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface Category {
  id: number;
  name: string;
  description: string;
}

interface Spend {
  id: number;
  name: string;
  description: string;
  amount: number;
  dueDate: string;
  categoryId: number;
  isDue: boolean;
  isPaid: boolean;
  isRecurring: boolean;
}

interface SpendResponse {
  id: number;
  name: string;
  description: string;
  amount: number;
  dueDate: string;
  categoryName: string;
  isDue: boolean;
  isPaid: boolean;
  isRecurring: boolean;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = "http://localhost:8080/api";

  constructor(private http: HttpClient) {
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/spend-categories`);
  }

  createCategory(name: string, description: string): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/spend-categories`,
      {
        name,
        description
      });
  }

  createSpend(spendData: Omit<Spend, 'id'>): Observable<Spend> {
    return this.http.post<Spend>(`${this.apiUrl}/spend/create`, spendData);
  }

  getSpends(): Observable<SpendResponse[]> {
    return this.http.get<SpendResponse[]>(`${this.apiUrl}/spend/all`);
  }

}
