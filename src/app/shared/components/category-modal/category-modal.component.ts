import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss']
})
export class CategoryModalComponent {
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);

  // Event emitters
  categoryCreated = output<void>();
  categoryUpdated = output<void>();

  // Controle do modal
  isVisible = signal(false);
  isLoading = signal(false);
  isEditMode = signal(false);

  // ID da categoria sendo editada
  editingCategoryId: number | null = null;

  // Formulário para criação
  createForm: CreateCategoryRequest = {
    name: '',
    icon: '',
    color: '#3B82F6',
    parentId: null
  };

  // Formulário para edição
  updateForm: UpdateCategoryRequest = {
    name: '',
    icon: '',
    color: '#3B82F6',
    parentId: null
  };

  // Lista de cores pré-definidas
  predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#64748B', '#DC2626', '#059669', '#D97706', '#7C3AED'
  ];

  // Lista de ícones pré-definidos (FontAwesome)
  predefinedIcons = [
    'fas fa-utensils',      // Alimentação
    'fas fa-gas-pump',      // Combustível
    'fas fa-home',          // Casa
    'fas fa-car',           // Transporte
    'fas fa-shopping-cart', // Compras
    'fas fa-heart',         // Saúde
    'fas fa-graduation-cap', // Educação
    'fas fa-gamepad',       // Entretenimento
    'fas fa-tshirt',        // Roupas
    'fas fa-plane',         // Viagem
    'fas fa-mobile-alt',    // Telefone
    'fas fa-bolt',          // Energia
    'fas fa-money-bill',    // Salário
    'fas fa-gift',          // Presentes
    'fas fa-paw'            // Pets
  ];

  constructor() {
    // Carrega categorias ao inicializar
    this.categoryService.getAllCategories().subscribe();
  }

  // Getter para categorias disponíveis como parent
  get availableParentCategories() {
    const categories = this.categoryService.categories();
    if (this.isEditMode() && this.editingCategoryId !== null) {
      const currentEditingId = this.editingCategoryId; // Captura o valor não-null
      // Remove a categoria atual e suas filhas da lista de possíveis parents
      return categories.filter(cat =>
        cat.id !== currentEditingId &&
        !this.isDescendant(cat.id, currentEditingId)
      );
    }
    return categories;
  }

  /**
   * Abre o modal para criar categoria
   */
  open(parentId?: number): void {
    this.isEditMode.set(false);
    this.createForm.parentId = parentId || null;
    this.isVisible.set(true);
  }

  /**
   * Abre o modal para edição de categoria
   */
  openForEdit(category: Category): void {
    this.isEditMode.set(true);
    this.editingCategoryId = category.id;

    this.updateForm = {
      name: category.name,
      icon: category.icon,
      color: category.color,
      parentId: category.parentId
    };

    this.isVisible.set(true);
  }

  /**
   * Fecha o modal e reseta os formulários
   */
  close(): void {
    this.isVisible.set(false);
    this.isEditMode.set(false);
    this.isLoading.set(false);
    this.editingCategoryId = null;
    this.resetForms();
  }

  /**
   * Submete o formulário (criação ou edição)
   */
  onSubmit(): void {
    if (this.isEditMode()) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  /**
   * Cria uma nova categoria
   */
  private createCategory(): void {
    if (!this.isFormValid(this.createForm)) return;

    this.isLoading.set(true);

    this.categoryService.createCategory(this.createForm).subscribe({
      next: () => {
        this.notificationService.success('Categoria criada com sucesso!');
        this.categoryCreated.emit();
        this.close();
      },
      error: (error) => {
        console.error('Erro ao criar categoria:', error);
        this.notificationService.error('Erro ao criar categoria');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Atualiza uma categoria existente
   */
  private updateCategory(): void {
    if (!this.editingCategoryId || !this.isFormValid(this.updateForm)) return;

    this.isLoading.set(true);

    this.categoryService.updateCategory(this.editingCategoryId, this.updateForm).subscribe({
      next: () => {
        this.notificationService.success('Categoria atualizada com sucesso!');
        this.categoryUpdated.emit();
        this.close();
      },
      error: (error) => {
        console.error('Erro ao atualizar categoria:', error);
        this.notificationService.error('Erro ao atualizar categoria');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Valida o formulário
   */
  private isFormValid(form: CreateCategoryRequest | UpdateCategoryRequest): boolean {
    return form.name.trim() !== '' && form.icon.trim() !== '' && form.color.trim() !== '';
  }

  /**
   * Reseta os formulários
   */
  private resetForms(): void {
    this.createForm = {
      name: '',
      icon: '',
      color: '#3B82F6',
      parentId: null
    };

    this.updateForm = {
      name: '',
      icon: '',
      color: '#3B82F6',
      parentId: null
    };
  }

  /**
   * Verifica se uma categoria é descendente de outra (para evitar loops)
   */
  private isDescendant(categoryId: number, ancestorId: number): boolean {
    const categories = this.categoryService.categories();
    const category = categories.find(cat => cat.id === categoryId);

    if (!category || !category.parentId) return false;
    if (category.parentId === ancestorId) return true;

    return this.isDescendant(category.parentId, ancestorId);
  }

  /**
   * Retorna o formulário atual baseado no modo
   */
  get currentForm() {
    return this.isEditMode() ? this.updateForm : this.createForm;
  }

  /**
   * Retorna o título do modal
   */
  get modalTitle(): string {
    return this.isEditMode() ? 'Editar Categoria' : 'Nova Categoria';
  }

  /**
   * Seleciona uma cor
   */
  selectColor(color: string): void {
    if (this.isEditMode()) {
      this.updateForm.color = color;
    } else {
      this.createForm.color = color;
    }
  }

  /**
   * Seleciona um ícone
   */
  selectIcon(icon: string): void {
    if (this.isEditMode()) {
      this.updateForm.icon = icon;
    } else {
      this.createForm.icon = icon;
    }
  }
}
