import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: Category[] = [
    { id: 'salary', name: 'Salário', icon: 'money-bill-wave', color: '#10b981', type: 'income' },
    { id: 'housing', name: 'Moradia', icon: 'home', color: '#4361ee', type: 'expense' },
    { id: 'food', name: 'Alimentação', icon: 'utensils', color: '#ef4444', type: 'expense' },
    { id: 'transport', name: 'Transporte', icon: 'bus', color: '#3b82f6', type: 'expense' },
    { id: 'shopping', name: 'Compras', icon: 'shopping-bag', color: '#f59e0b', type: 'expense' },
    { id: 'health', name: 'Saúde', icon: 'heartbeat', color: '#8b5cf6', type: 'expense' },
    { id: 'education', name: 'Educação', icon: 'graduation-cap', color: '#10b981', type: 'expense' },
    { id: 'entertainment', name: 'Entretenimento', icon: 'tv', color: '#f97316', type: 'expense' },
    { id: 'other', name: 'Outros', icon: 'plus-circle', color: '#6b7280', type: 'expense' }
  ];

  constructor() { }

  getAllCategories(): Category[] {
    return this.categories;
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find(c => c.id === id);
  }

  getExpenseCategories(): Category[] {
    return this.categories.filter(c => c.type === 'expense');
  }

  getIncomeCategories(): Category[] {
    return this.categories.filter(c => c.type === 'income');
  }
}
