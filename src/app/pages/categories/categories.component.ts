import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';
import { Category } from '../../core/models/category.model';
import { CategoryModalComponent } from '../../shared/components/category-modal/category-modal.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryModalComponent],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);

  // Referência ao modal
  @ViewChild(CategoryModalComponent) categoryModal!: CategoryModalComponent;

  // Filtros e busca
  searchTerm = '';
  selectedParentFilter: number | 'ALL' | 'ROOT' = 'ALL';

  constructor() {
    // Carrega categorias ao inicializar
    this.categoryService.getAllCategories().subscribe();
  }

  // Getters para acessar os signals do serviço
  get categories() {
    return this.categoryService.categories();
  }

  get isLoading() {
    return this.categoryService.loading();
  }

  get rootCategories() {
    return this.categoryService.rootCategories();
  }

  /**
   * Categorias filtradas baseado na busca e filtros
   */
  get filteredCategories(): Category[] {
    let filtered = this.categories;

    // Filtro por texto de busca
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter((category: Category) =>
        category.name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por categoria pai
    if (this.selectedParentFilter === 'ROOT') {
      filtered = filtered.filter((category: Category) => !category.parentId);
    } else if (this.selectedParentFilter !== 'ALL') {
      filtered = filtered.filter((category: Category) => category.parentId === this.selectedParentFilter);
    }

    return filtered;
  }

  /**
   * Abre modal para criar nova categoria
   */
  openCreateModal(): void {
    this.categoryModal.open();
  }

  /**
   * Abre modal para criar subcategoria
   */
  openCreateSubcategoryModal(parentId: number): void {
    this.categoryModal.open(parentId);
  }

  /**
   * Edita uma categoria
   */
  editCategory(category: Category): void {
    this.categoryModal.openForEdit(category);
  }

  /**
   * Deleta uma categoria
   */
  deleteCategory(category: Category): void {
    // Verifica se a categoria tem filhas
    const hasChildren = this.categoryService.hasChildren(category.id);

    let confirmMessage = `Tem certeza que deseja deletar a categoria "${category.name}"?`;
    if (hasChildren) {
      confirmMessage += '\n\nAtenção: Esta categoria possui subcategorias que também serão afetadas.';
    }

    if (confirm(confirmMessage)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.notificationService.success('Categoria deletada com sucesso!');
          this.categoryService.refreshCategories();
        },
        error: (error) => {
          console.error('Erro ao deletar categoria:', error);
          this.notificationService.error('Erro ao deletar categoria. Pode haver transações vinculadas.');
        }
      });
    }
  }

  /**
   * Callback quando categoria é criada/atualizada
   */
  onCategoryChanged(): void {
    this.categoryService.refreshCategories();
  }

  /**
   * Limpa os filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedParentFilter = 'ALL';
  }

  /**
   * Retorna o nome da categoria pai
   */
  getParentCategoryName(parentId: number | null): string {
    if (!parentId) return 'Categoria Raiz';

    const parent = this.categories.find((cat: Category) => cat.id === parentId);
    return parent ? parent.name : 'Categoria não encontrada';
  }

  /**
   * Retorna subcategorias de uma categoria
   */
  getSubcategories(parentId: number): Category[] {
    return this.categories.filter((cat: Category) => cat.parentId === parentId);
  }

  /**
   * Verifica se categoria tem subcategorias
   */
  hasSubcategories(categoryId: number): boolean {
    return this.categoryService.hasChildren(categoryId);
  }

  /**
   * Conta o número de subcategorias
   */
  countSubcategories(categoryId: number): number {
    return this.getSubcategories(categoryId).length;
  }
}
