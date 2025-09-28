import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/categories`;

  // Signals para gerenciar estado
  private categoriesSignal = signal<Category[]>([]);
  private rootCategoriesSignal = signal<Category[]>([]);
  private loadingSignal = signal<boolean>(false);

  // Getters para os signals
  get categories() {
    return this.categoriesSignal.asReadonly();
  }

  get rootCategories() {
    return this.rootCategoriesSignal.asReadonly();
  }

  get loading() {
    return this.loadingSignal.asReadonly();
  }

  /**
   * Busca todas as categorias
   */
  getAllCategories(): Observable<Category[]> {
    this.loadingSignal.set(true);

    return this.http.get<Category[]>(this.baseUrl).pipe(
      tap(categories => {
        this.categoriesSignal.set(categories);
        this.loadingSignal.set(false);
      })
    );
  }

  /**
   * Busca categorias raiz (sem parent)
   */
  getRootCategories(): Observable<Category[]> {
    this.loadingSignal.set(true);

    return this.http.get<Category[]>(`${this.baseUrl}/root`).pipe(
      tap(categories => {
        this.rootCategoriesSignal.set(categories);
        this.loadingSignal.set(false);
      })
    );
  }

  /**
   * Busca categorias por parent ID
   */
  getCategoriesByParent(parentId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/parent/${parentId}`);
  }

  /**
   * Busca uma categoria por ID
   */
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  /**
   * Cria uma nova categoria
   */
  createCategory(category: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category).pipe(
      tap(() => {
        // Recarrega as listas após criar
        this.refreshCategories();
      })
    );
  }

  /**
   * Atualiza uma categoria existente
   */
  updateCategory(id: number, category: UpdateCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category).pipe(
      tap(() => {
        // Recarrega as listas após atualizar
        this.refreshCategories();
      })
    );
  }

  /**
   * Deleta uma categoria
   */
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        // Remove a categoria das listas locais
        const currentCategories = this.categoriesSignal();
        const updatedCategories = currentCategories.filter(c => c.id !== id);
        this.categoriesSignal.set(updatedCategories);

        const currentRootCategories = this.rootCategoriesSignal();
        const updatedRootCategories = currentRootCategories.filter(c => c.id !== id);
        this.rootCategoriesSignal.set(updatedRootCategories);
      })
    );
  }

  /**
   * Recarrega todas as categorias
   */
  refreshCategories(): void {
    this.getAllCategories().subscribe();
    this.getRootCategories().subscribe();
  }

  /**
   * Limpa o estado das categorias
   */
  clearCategories(): void {
    this.categoriesSignal.set([]);
    this.rootCategoriesSignal.set([]);
  }

  /**
   * Busca categorias filhas de uma categoria
   */
  getChildCategories(parentId: number): Category[] {
    const allCategories = this.categoriesSignal();
    return allCategories.filter(category => category.parentId === parentId);
  }

  /**
   * Verifica se uma categoria tem filhas
   */
  hasChildren(categoryId: number): boolean {
    const allCategories = this.categoriesSignal();
    return allCategories.some(category => category.parentId === categoryId);
  }

  /**
   * Constrói uma árvore hierárquica de categorias
   */
  buildCategoryTree(): Category[] {
    const allCategories = this.categoriesSignal();
    const rootCategories = allCategories.filter(cat => !cat.parentId);

    return this.buildTreeRecursive(rootCategories, allCategories);
  }

  /**
   * Método auxiliar para construir a árvore recursivamente
   */
  private buildTreeRecursive(categories: Category[], allCategories: Category[]): Category[] {
    return categories.map(category => {
      const children = allCategories.filter(cat => cat.parentId === category.id);
      return {
        ...category,
        children: children.length > 0 ? this.buildTreeRecursive(children, allCategories) : undefined
      } as Category & { children?: Category[] };
    });
  }
}
