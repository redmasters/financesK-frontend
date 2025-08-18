import {Component, inject, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BalanceService} from '../../core/services/balance.service';
import {FinancialData} from '../../core/models/transaction.model';
import {TransactionService} from '../../core/services/transaction.service';
import {TransactionApiService} from '../../core/services/transaction-api.service';
import {CategoryService} from '../../core/services/category.service';
import {NotificationService} from '../../core/services/notification.service';
import {BrazilianDateInputDirective} from '../../shared/directives/brazilian-date-input.directive';
import {
  PaymentStatus,
  Transaction,
  TransactionSearchParams,
  TransactionType,
  SortDirection,
  SortField
} from '../../core/models/transaction.model';
import {TransactionModalComponent} from '../../shared/components/transaction-modal/transaction-modal.component';
import {CategoryModalComponent} from '../../shared/components/category-modal/category-modal.component';
import {
  TransactionDetailModalComponent
} from '../../shared/components/transaction-detail-modal/transaction-detail-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionModalComponent, CategoryModalComponent,
    TransactionDetailModalComponent, BrazilianDateInputDirective],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private transactionService = inject(TransactionService);
  private transactionApiService = inject(TransactionApiService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);

  // Referência aos modais
  @ViewChild(TransactionModalComponent) transactionModal!: TransactionModalComponent;
  @ViewChild(CategoryModalComponent) categoryModal!: CategoryModalComponent;
  @ViewChild(TransactionDetailModalComponent) transactionDetailModal!: TransactionDetailModalComponent;

  // Enums para uso no template
  PaymentStatus = PaymentStatus;
  TransactionType = TransactionType;
// Filtros do usuário
  selectedStatus: PaymentStatus | 'ALL' = 'ALL';
  startDate: string = '';
  endDate: string = '';
  userId: number = 1;
  accountsId: number[] = [1]; // IDs de contas do usuário, pode ser dinâmico

  // Propriedades para lista de transações
  selectedTransactionType: TransactionType | '' = '';
  selectedCategoryId: number | undefined = undefined;

  // Novos filtros avançados
  selectedIsRecurring: boolean | undefined = undefined;
  selectedHasInstallments: boolean | undefined = undefined;
  selectedDescription: string = '';
  selectedMinAmount: number | undefined = undefined;
  selectedMaxAmount: number | undefined = undefined;

  // Paginação
  currentPage = 0;
  pageSize = 10;

  // Transação sendo editada
  editingTransaction: Transaction | null = null;

  constructor() {
    // Inicializa as datas com o mês atual
    this.initializeCurrentMonthDates();

    // Carrega dados iniciais
    this.updateFinancialData();

    // Carrega categorias para uso nos modais de transação
    this.categoryService.getAllCategories().subscribe();
  }

  // Getters para acessar os signals do serviço
  get financialData(): FinancialData{
    return this.transactionService.financialData();
  }

  get transactions() {
    return this.transactionService.transactions();
  }

  get isLoadingTransactions() {
    return this.transactionService.loading();
  }

  get totalElements() {
    return this.transactionService.totalElements();
  }

  get totalPages() {
    return this.transactionService.totalPages();
  }

  get categories() {
    return this.categoryService.categories();
  }

  get isLoadingCategories() {
    return this.categoryService.loading();
  }

  /**
   * Inicializa as datas com o primeiro e último dia do mês atual
   */
  private initializeCurrentMonthDates(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = lastDay.toISOString().split('T')[0];
  }

  /**
   * Carrega a lista de transações com base nos filtros
   */
  loadTransactions(): void {
    const params: TransactionSearchParams = {
      userId: this.userId,
      accountsId: this.accountsId,
      startDate: this.startDate,
      endDate: this.endDate,
      page: this.currentPage,
      size: this.pageSize,
      sortField: SortField.DUE_DATE_AND_STATUS,
      sortDirection: SortDirection.ASC
    };

    // Adiciona filtros opcionais apenas se definidos
    if (this.selectedTransactionType) {
      params.type = this.selectedTransactionType;
    }
    if (this.selectedStatus !== 'ALL') {
      params.status = this.selectedStatus;
    }
    if (this.selectedCategoryId) {
      params.categoryId = this.selectedCategoryId;
    }
    if (this.selectedIsRecurring !== undefined) {
      params.isRecurring = this.selectedIsRecurring;
    }
    if (this.selectedHasInstallments !== undefined) {
      params.hasInstallments = this.selectedHasInstallments;
    }
    if (this.selectedDescription.trim()) {
      params.description = this.selectedDescription.trim();
    }
    if (this.selectedMinAmount !== undefined) {
      params.minAmount = this.selectedMinAmount;
    }
    if (this.selectedMaxAmount !== undefined) {
      params.maxAmount = this.selectedMaxAmount;
    }

    this.transactionService.searchTransactions(params);
  }

  /**
   * Atualiza os dados financeiros com base nos filtros selecionados
   */
  updateFinancialData(): void {
    this.loadTransactions();
  }

  /**
   * Reseta os filtros para o mês atual
   */
  resetToCurrentMonth(): void {
    this.selectedStatus = 'ALL';
    this.selectedTransactionType = '';
    this.selectedCategoryId = undefined;
    this.selectedIsRecurring = undefined;
    this.selectedHasInstallments = undefined;
    this.selectedDescription = '';
    this.selectedMinAmount = undefined;
    this.selectedMaxAmount = undefined;
    this.initializeCurrentMonthDates();
    this.currentPage = 0;
    this.updateFinancialData();
  }

  /**
   * Retorna o label traduzido do status
   */
  getStatusLabel(status: PaymentStatus | 'ALL' | string): string {
    if (status === 'ALL') return 'Todos';

    const statusLabels: { [key: string]: string } = {
      'PENDING': 'Pendente',
      'PAID': 'Pago',
      'FAILED': 'Falhado',
      'ALL': 'Todos'
    };

    return statusLabels[status as string] || status;
  }
  /**
   * Retorna a data atual formatada
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('pt-BR');
  }

  /**
   * Calcula e retorna o progresso do mês (0-100)
   */
  getMonthProgress(): number {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const totalDays = lastDay.getDate();
    const currentDay = now.getDate();

    return (currentDay / totalDays) * 100;
  }

  /**
   * Calcula a porcentagem de gastos em relação às entradas
   */
  getExpensePercentage(): number {
    const income = this.financialData.totalIncome;
    const expense = this.financialData.totalExpense;

    if (income === 0) return 0;
    return Math.round((expense / income) * 100);
  }

  /**
   * Formata o range de datas
   */
  formatDateRange(): string {
    const start = new Date(this.startDate).toLocaleDateString('pt-BR');
    const end = new Date(this.endDate).toLocaleDateString('pt-BR');
    return `${start} - ${end}`;
  }

  /**
   * Formata data para exibição
   */
  formatDate(dateString: string): string {
    // Ajusta para timezone local antes de formatar
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  }

  /**
   * Abre modal para criar receita
   */
  openIncomeModal(): void {
    this.transactionModal.open(TransactionType.INCOME);
  }

  /**
   * Abre modal para criar despesa
   */
  openExpenseModal(): void {
    this.transactionModal.open(TransactionType.EXPENSE);
  }

  /**
   * Visualiza detalhes de uma transação
   */
  viewTransactionDetails(transaction: Transaction): void {
    this.transactionDetailModal.open(transaction);
  }

  /**
   * Retorna a classe CSS para o badge do tipo de transação baseado nos dados
   */
  getTransactionTypeBadgeClass(transaction: Transaction): string {
    if (transaction.installmentInfo) {
      return 'badge-installment';
    }
    if (transaction.recurrencePattern) {
      return 'badge-recurring';
    }
    return 'badge-single';
  }

  /**
   * Retorna o label do tipo de transação baseado nos dados da transação
   */
  getTransactionTypeLabel(transaction: Transaction): string {
    if (transaction.installmentInfo) {
      return 'Parcelado';
    }
    if (transaction.recurrencePattern) {
      return 'Recorrente';
    }
    return 'Avulso';
  }

  /**
   * Manipula mudança do tamanho da página
   */
  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadTransactions();
  }

  /**
   * Vai para uma página específica
   */
  goToPage(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }

  /**
   * Retorna as páginas visíveis para paginação
   */
  getVisiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i);
    }

    let start = Math.max(0, current - 2);
    let end = Math.min(total - 1, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  /**
   * Retorna o range de exibição atual
   */
  getDisplayRange(): string {
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
    return `${start}-${end}`;
  }

  /**
   * Callback quando uma transação é criada
   */
  onTransactionCreated(): void {
    this.updateFinancialData();
    this.notificationService.success('Transação criada com sucesso!');
  }

  /**
   * Callback quando uma transação é atualizada
   */
  onTransactionUpdated(): void {
    this.updateFinancialData();
    this.notificationService.success('Transação atualizada com sucesso!');
  }

  /**
   * Callback quando uma categoria é alterada
   */
  onCategoryChanged(): void {
    this.categoryService.getAllCategories().subscribe();
  }

  /**
   * Edita transação a partir dos detalhes
   */
  onEditFromDetails(transaction: Transaction): void {
    this.transactionModal.openForEdit(transaction);
  }

  /**
   * Deleta transação a partir dos detalhes
   */
  onDeleteFromDetails(transaction: Transaction): void {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      this.transactionApiService.deleteTransaction(transaction.id).subscribe({
        next: () => {
          this.updateFinancialData();
          this.notificationService.success('Transação excluída com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao excluir transação:', error);
          this.notificationService.error('Erro ao excluir transação');
        }
      });
    }
  }
}
