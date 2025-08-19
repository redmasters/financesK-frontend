import {Component, inject, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TransactionApiService} from '../../../core/services/transaction-api.service';
import {TransactionService} from '../../../core/services/transaction.service';
import {CategoryService} from '../../../core/services/category.service';
import {NotificationService} from '../../../core/services/notification.service';
import {CurrencyService} from '../../../core/services/currency.service';
import {CurrencyInputDirective} from '../../directives/currency-input.directive';
import {BrazilianDateInputDirective} from '../../directives/brazilian-date-input.directive';
import {
  AccountOperationType,
  CreateTransactionRequest,
  PaymentStatus,
  RecurrencePattern,
  Transaction,
  TransactionType,
  UpdateTransactionRequest
} from '../../../core/models/transaction.model';

// Enum local para tipos de transação
enum TransactionTypeLocal {
  SINGLE = 'SINGLE',      // Avulso
  INSTALLMENT = 'INSTALLMENT', // Parcelado
  RECURRENT = 'RECURRENT'      // Recorrente
}

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyInputDirective, BrazilianDateInputDirective],
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.scss']
})
export class TransactionModalComponent {
  private transactionApiService = inject(TransactionApiService);
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);
  private currencyService = inject(CurrencyService);

  // Event emitters
  transactionCreated = output<void>();
  transactionUpdated = output<void>();

  // Enums para o template
  TransactionType = TransactionType;
  AccountOperationType = AccountOperationType;
  RecurrencePattern = RecurrencePattern;
  PaymentStatus = PaymentStatus;
  TransactionTypeLocal = TransactionTypeLocal;

  // Controle do modal
  isVisible = signal(false);
  isLoading = signal(false);
  isEditMode = signal(false);

  // Valor para preview (atualizado apenas no blur)
  previewAmount = signal(0);

  // ID da transação sendo editada
  editingTransactionId: number | null = null;

  // Tipo de transação selecionado (avulso, parcelado, recorrente)
  selectedTransactionType: TransactionTypeLocal = TransactionTypeLocal.SINGLE;

  // Formulário para criação
  transactionForm: CreateTransactionRequest = {
    description: '',
    amount: 0,
    downPayment: 0,
    type: TransactionType.EXPENSE,
    operationType: AccountOperationType.PAYMENT,
    status: PaymentStatus.PENDING,
    categoryId: 1,
    dueDate: '',
    notes: '',
    userId: 1,
    accountId: 1
  };

  // Formulário para edição
  updateForm: UpdateTransactionRequest = {
    description: '',
    amount: 0,
    downPayment: 0,
    type: TransactionType.EXPENSE,
    operationType: AccountOperationType.PAYMENT,
    status: PaymentStatus.PENDING,
    categoryId: 1,
    dueDate: '',
    notes: '',
    currentInstallment: 1,
    accountId: 1
  };

  constructor() {
    // Carrega categorias ao inicializar o componente
    this.categoryService.getAllCategories().subscribe();
  }

  // Getter para acessar categorias
  get categories() {
    return this.categoryService.categories();
  }

  get isLoadingCategories() {
    return this.categoryService.loading();
  }

  /**
   * Retorna apenas as categorias raiz (sem parent)
   */
  get rootCategories() {
    return this.categories.filter((cat: any) => !cat.parentId);
  }

  /**
   * Retorna subcategorias de uma categoria específica
   */
  getSubcategories(parentId: number) {
    return this.categories.filter((cat: any) => cat.parentId === parentId);
  }

  /**
   * Abre o modal
   */
  open(type: TransactionType): void {
    this.transactionForm.type = type;
    this.transactionForm.operationType = type === TransactionType.INCOME ? AccountOperationType.SALARY : AccountOperationType.PAYMENT;
    this.isVisible.set(true);
  }

  /**
   * Abre o modal para edição de transação
   */
  openForEdit(transaction: Transaction): void {
    this.isEditMode.set(true);
    this.editingTransactionId = transaction.id;

    // Preenche o formulário de edição com os dados da transação
    this.updateForm = {
      description: transaction.description,
      amount: transaction.amount * 100, // Converter reais para centavos
      downPayment: (transaction.downPayment || 0) * 100, // Converter reais para centavos
      type: transaction.type,
      operationType: transaction.operationType,
      status: transaction.status,
      categoryId: transaction.categoryId,
      dueDate: transaction.dueDate,
      notes: transaction.notes || '',
      currentInstallment: transaction.installmentInfo?.currentInstallment || 1,
      accountId: transaction.accountId
    };

    // Define o tipo de transação baseado nos dados
    if (transaction.installmentInfo && transaction.installmentInfo.totalInstallments > 1) {
      this.selectedTransactionType = TransactionTypeLocal.INSTALLMENT;
    } else if (transaction.recurrencePattern) {
      this.selectedTransactionType = TransactionTypeLocal.RECURRENT;
    } else {
      this.selectedTransactionType = TransactionTypeLocal.SINGLE;
    }

    this.isVisible.set(true);
  }

  /**
   * Fecha o modal e reseta os formulários
   */
  close(): void {
    this.isVisible.set(false);
    this.isEditMode.set(false);
    this.isLoading.set(false);
    this.editingTransactionId = null;
    this.resetForms();
  }

  /**
   * Submete o formulário (criação ou edição)
   */
  onSubmit(): void {
    if (this.isEditMode()) {
      this.updateTransaction();
    } else {
      this.createTransaction();
    }
  }

  /**
   * Atualiza uma transação existente
   */
  updateTransaction(): void {
    if (!this.editingTransactionId) return;

    this.isLoading.set(true);

    this.transactionService.updateTransaction(this.editingTransactionId, this.updateForm).subscribe({
      next: () => {
        this.notificationService.success('Transação atualizada com sucesso!');
        this.transactionUpdated.emit();
        this.close();
      },
      error: (error) => {
        console.error('Erro ao atualizar transação:', error);
        this.notificationService.error('Erro ao atualizar transação');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Cria uma nova transação
   */
  private createTransaction(): void {
    this.isLoading.set(true);

    // Prepara os dados baseado no tipo de transação selecionado
    const requestData = this.prepareTransactionData();

    this.transactionApiService.createTransaction(requestData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.close();
        this.transactionCreated.emit();
        this.notificationService.showSuccess('Transação criada com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao criar transação:', error);
        this.isLoading.set(false);
        this.notificationService.showError('Erro ao criar transação. Tente novamente.');
      }
    });
  }

  /**
   * Prepara os dados da transação baseado no tipo selecionado
   */
  private prepareTransactionData(): CreateTransactionRequest {
    const baseData = {...this.transactionForm};

    switch (this.selectedTransactionType) {
      case TransactionTypeLocal.SINGLE:
        // Avulso: remove campos de parcelamento e recorrência
        return {
          ...baseData,
          totalInstallments: undefined,
          currentInstallment: undefined,
          recurrencePattern: undefined,
          downPayment: undefined
        };

      case TransactionTypeLocal.INSTALLMENT:
        // Parcelado: mantém todos os campos de parcelamento
        return {
          ...baseData,
          totalInstallments: this.transactionForm.totalInstallments || 1,
          currentInstallment: this.transactionForm.currentInstallment || 1,
          recurrencePattern: this.transactionForm.recurrencePattern,
          downPayment: this.transactionForm.downPayment || undefined
        };

      case TransactionTypeLocal.RECURRENT:
        // Recorrente: apenas frequência, sem parcelas
        return {
          ...baseData,
          totalInstallments: undefined,
          currentInstallment: undefined,
          recurrencePattern: this.transactionForm.recurrencePattern,
          downPayment: undefined
        };

      default:
        return baseData;
    }
  }

  /**
   * Chamado quando o tipo de transação muda
   */
  onTransactionTypeChange(): void {
    // Reset campos específicos quando muda o tipo
    if (this.selectedTransactionType === TransactionTypeLocal.SINGLE) {
      this.transactionForm.totalInstallments = 1;
      this.transactionForm.currentInstallment = 1;
    } else if (this.selectedTransactionType === TransactionTypeLocal.INSTALLMENT) {
      this.transactionForm.totalInstallments = 2; // Mínimo para parcelado
      this.transactionForm.currentInstallment = 1;
    }
  }
  /**
   * Reseta os formulários
   */
  private resetForms(): void {
    this.transactionForm = {
      description: '',
      amount: 0,
      downPayment: 0,
      type: TransactionType.EXPENSE,
      operationType: AccountOperationType.PAYMENT,
      status: PaymentStatus.PENDING,
      categoryId: 1,
      dueDate: '',
      notes: '',
      userId: 1,
      accountId: 1
    };

    this.updateForm = {
      description: '',
      amount: 0,
      downPayment: 0,
      type: TransactionType.EXPENSE,
      operationType: AccountOperationType.PAYMENT,
      status: PaymentStatus.PENDING,
      categoryId: 1,
      dueDate: '',
      notes: '',
      currentInstallment: 1,
      accountId: 1
    };

    this.selectedTransactionType = TransactionTypeLocal.SINGLE;
  }

  /**
   * Retorna o formulário atual baseado no modo
   */
  get currentForm() {
    return this.isEditMode() ? this.updateForm : this.transactionForm;
  }

  /**
   * Retorna o título do modal baseado no modo e tipo
   */
  get modalTitle(): string {
    if (this.isEditMode()) {
      return 'Editar Transação';
    }
    return this.transactionForm.type === TransactionType.INCOME ? 'Nova Receita' : 'Nova Despesa';
  }

  /**
   * Verifica se deve mostrar campos de parcelamento
   */
  get shouldShowInstallments(): boolean {
    return this.selectedTransactionType === TransactionTypeLocal.INSTALLMENT;
  }

  /**
   * Verifica se deve mostrar campo de recorrência
   */
  get shouldShowRecurrence(): boolean {
    return this.selectedTransactionType === TransactionTypeLocal.INSTALLMENT ||
      this.selectedTransactionType === TransactionTypeLocal.RECURRENT;
  }

  /**
   * Verifica se deve mostrar campo de entrada
   */
  get shouldShowDownPayment(): boolean {
    return this.selectedTransactionType === TransactionTypeLocal.INSTALLMENT &&
      this.transactionForm.type === 'EXPENSE';
  }

  /**
   * Retorna o ícone da categoria selecionada
   */
  getSelectedCategoryIcon(): string {
    const selectedCategory = this.categories.find(cat => cat.id === this.currentForm.categoryId);
    return selectedCategory?.icon || 'fas fa-tag';
  }

  /**
   * Retorna a cor da categoria selecionada
   */
  getSelectedCategoryColor(): string {
    const selectedCategory = this.categories.find(cat => cat.id === this.currentForm.categoryId);
    return selectedCategory?.color || '#6b7280';
  }

  /**
   * Retorna o nome da categoria selecionada
   */
  getSelectedCategoryName(): string {
    const selectedCategory = this.categories.find(cat => cat.id === this.currentForm.categoryId);
    if (!selectedCategory) return 'Categoria não encontrada';

    // Se for subcategoria, mostra categoria pai também
    if (selectedCategory.parentId) {
      const parentCategory = this.categories.find(cat => cat.id === selectedCategory.parentId);
      return parentCategory ? `${parentCategory.name} > ${selectedCategory.name}` : selectedCategory.name;
    }

    return selectedCategory.name;
  }

  /**
   * Atualiza o preview quando o usuário sai do campo de valor
   */
  onAmountBlur(): void {
    // Atualiza o preview com o valor atual
    this.previewAmount.set(this.currentForm.amount);
  }

  /**
   * Formata valores monetários para exibição no preview
   */
  formatCurrencyPreview(value: number): string {
    if (value === 0 || !value) {
      return 'R$ 0,00';
    }

    // Para o preview, sempre trata o valor como centavos vindos da diretiva
    // A diretiva sempre envia valores em centavos, mesmo no modo de edição
    const reaisValue = value / 100;
    return `R$ ${reaisValue.toFixed(2).replace('.', ',')}`;
  }

  /**
   * Formata valores monetários para exibição no preview
   */
  formatCurrency(value: number): string {
    if (value === 0 || !value) {
      return 'R$ 0,00';
    }

    // Se estamos no modo de edição e o valor veio do backend, não converte
    if (this.isEditMode() && this.editingTransactionId) {
      // Valores do backend já vêm em reais
      return this.currencyService.formatBRL(value);
    } else {
      // Durante a digitação, a diretiva envia valores em centavos
      // Para o preview, apenas move a vírgula duas casas decimais
      const reaisValue = value / 100;

      // Para o preview, usa formatação simples (sem separador de milhares)
      return `R$ ${reaisValue.toFixed(2).replace('.', ',')}`;
    }
  }
}
