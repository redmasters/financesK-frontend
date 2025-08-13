import {Component, inject, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BalanceService, FinancialData} from '../../core/services/balance.service';
import {TransactionService} from '../../core/services/transaction.service';
import {TransactionApiService} from '../../core/services/transaction-api.service';
import {CategoryService} from '../../core/services/category.service';
import {NotificationService} from '../../core/services/notification.service';
import {CurrencyService} from '../../core/services/currency.service';
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
  private balanceService = inject(BalanceService);
  private transactionService = inject(TransactionService);
  private transactionApiService = inject(TransactionApiService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);
  private currencyService = inject(CurrencyService);

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

  // Propriedades para lista de transações
  selectedTransactionType: TransactionType | '' = '';
  selectedCategoryId: number | undefined = undefined;

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
  get financialData(): FinancialData {
    return this.balanceService.financialData();
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
   * Atualiza os dados financeiros com base nos filtros selecionados
   */
  updateFinancialData(): void {
    this.balanceService.refreshFinancialData(
      this.userId,
      this.selectedStatus,
      this.selectedCategoryId,
      this.startDate,
      this.endDate,
      this.selectedTransactionType || undefined
    );
    // Também atualiza a lista de transações quando os filtros mudam
    this.loadTransactions();
  }

  /**
   * Reseta os filtros para o mês atual
   */
  resetToCurrentMonth(): void {
    this.selectedStatus = 'ALL';
    this.selectedTransactionType = '';
    this.selectedCategoryId = undefined; // Reseta também o filtro de categoria
    this.initializeCurrentMonthDates();
    this.currentPage = 0; // Reseta a página
    this.updateFinancialData(); // Isso já vai chamar loadTransactions()
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
   * Formata o range de datas no padrão brasileiro dd/MM/YYYY
   */
  formatDateRange(): string {
    if (!this.startDate || !this.endDate) return '';

    const startFormatted = this.formatDateToBR(this.startDate);
    const endFormatted = this.formatDateToBR(this.endDate);

    return `${startFormatted} até ${endFormatted}`;
  }

  /**
   * Converte data do formato YYYY-MM-DD para dd/MM/YYYY
   */
  private formatDateToBR(dateString: string): string {
    if (!dateString) return '';

    try {
      // Tenta converter usando Date para garantir formatação correta
      const date = new Date(dateString + 'T00:00:00');

      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        // Fallback para split manual
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }

      // Usa toLocaleDateString para formatação brasileira
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      // Fallback para split manual em caso de erro
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
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
   * Abre o modal para editar uma transação
   */
  editTransaction(transaction: Transaction): void {
    this.editingTransaction = transaction;
    this.transactionService.getTransactionById(transaction.id).subscribe({
      next: (fullTransaction) => {
        this.transactionModal.openForEdit(fullTransaction);
      },
      error: (error) => {
        console.error('Erro ao carregar transação para edição:', error);
        this.notificationService.error('Erro ao carregar transação para edição');
      }
    });
  }

  /**
   * Deleta uma transação
   */
  deleteTransaction(transaction: Transaction): void {
    if (confirm(`Tem certeza que deseja deletar a transação "${transaction.description}"?`)) {
      this.transactionService.deleteTransaction(transaction.id).subscribe({
        next: () => {
          this.notificationService.success('Transação deletada com sucesso!');
          this.updateFinancialData(); // Atualiza os saldos
          this.loadTransactions(); // Recarrega a lista
        },
        error: (error) => {
          console.error('Erro ao deletar transação:', error);
          this.notificationService.error('Erro ao deletar transação');
        }
      });
    }
  }

  /**
   * Abre modal para criar categoria
   */
  openCategoryModal(): void {
    this.categoryModal.open();
  }

  /**
   * Callback quando categoria é criada/atualizada
   */
  onCategoryChanged(): void {
    // Recarrega as categorias após mudança
    this.categoryService.getAllCategories().subscribe();
  }

  /**
   * Callback chamado quando uma transação é atualizada no modal
   */
  onTransactionUpdated(): void {
    this.editingTransaction = null;
    this.updateFinancialData(); // Atualiza os saldos
    this.loadTransactions(); // Recarrega a lista
  }

  /**
   * Formata valores monetários para exibição
   */
  formatCurrency(value: number): string {
    // Os valores do backend já vêm em reais, apenas formata
    return this.currencyService.formatBRL(value);
  }

  /**
   * Formata datas para exibição
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      // Adiciona T00:00:00 para evitar problemas de fuso horário
      const date = new Date(dateString + 'T00:00:00');

      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        // Fallback para split manual
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }

      // Usa toLocaleDateString para formatação brasileira
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      // Fallback para split manual em caso de erro
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
  }

  // ========== MÉTODOS PARA O TEMPLATE ==========

  /**
   * Expõe o Math para uso no template
   */
  Math = Math;

  /**
   * Abre o modal de detalhes da transação
   */
  viewTransactionDetails(transaction: Transaction): void {
    this.transactionDetailModal.open(transaction);
  }

  /**
   * Retorna a data atual formatada em português brasileiro
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('pt-BR');
  }

  /**
   * Retorna o progresso do mês atual (0-100%)
   */
  getMonthProgress(): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const totalDays = endOfMonth.getDate();
    const currentDay = now.getDate();

    return Math.min((currentDay / totalDays) * 100, 100);
  }

  /**
   * Retorna a porcentagem de gastos em relação às entradas
   */
  getExpensePercentage(): number {
    if (this.financialData.totalIncome === 0) return 0;
    return Math.round((this.financialData.totalExpense / this.financialData.totalIncome) * 100);
  }

  /**
   * Manipula a edição de transação vinda do modal de detalhes
   */
  onEditFromDetails(transaction: Transaction): void {
    this.transactionModal.openForEdit(transaction);
  }

  /**
   * Manipula a exclusão de transação vinda do modal de detalhes
   */
  onDeleteFromDetails(transaction: Transaction): void {
    if (confirm(`Tem certeza que deseja deletar a transação "${transaction.description}"?`)) {
      this.transactionService.deleteTransaction(transaction.id).subscribe({
        next: () => {
          this.notificationService.success('Transação deletada com sucesso!');
          this.updateFinancialData(); // Atualiza os saldos
          this.loadTransactions(); // Recarrega a lista
        },
        error: (error) => {
          console.error('Erro ao deletar transação:', error);
          this.notificationService.error('Erro ao deletar transação');
        }
      });
    }
  }

  // ========== MÉTODOS PARA LISTA DE TRANSAÇÕES ==========

  /**
   * Carrega a lista de transações com base nos filtros e paginação
   */
  loadTransactions(): void {
    const params: TransactionSearchParams = {
      userId: this.userId,
      startDate: this.startDate,
      endDate: this.endDate,
      page: this.currentPage,
      size: this.pageSize,
      sortField: SortField.DUE_DATE,
      sortDirection: SortDirection.DESC
    };

    // Adiciona filtros opcionais apenas se selecionados
    if (this.selectedTransactionType) {
      params.type = this.selectedTransactionType;
    }

    if (this.selectedStatus && this.selectedStatus !== 'ALL') {
      params.status = this.selectedStatus;
    }

    // Adiciona filtro de categoria se selecionada
    if (this.selectedCategoryId) {
      params.categoryId = this.selectedCategoryId;
    }

    this.transactionService.searchTransactions(params).subscribe({
      error: (error) => {
        console.error('Erro ao carregar transações:', error);
        this.notificationService.error('Erro ao carregar transações');
      }
    });
  }

  /**
   * Navega para uma página específica
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadTransactions();
    }
  }

  /**
   * Manipula mudança no tamanho da página
   */
  onPageSizeChange(): void {
    this.currentPage = 0; // Reseta para primeira página
    this.loadTransactions();
  }

  /**
   * Retorna as páginas visíveis para paginação
   */
  getVisiblePages(): number[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const delta = 2; // Número de páginas para mostrar de cada lado

    const pages: number[] = [];
    const start = Math.max(0, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Retorna o range de itens sendo exibidos
   */
  getDisplayRange(): string {
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
    return `${start}-${end}`;
  }

  /**
   * Retorna o label do tipo de transação
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
   * Retorna a classe CSS para o badge do tipo de transação
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
   * Callback chamado quando uma transação é criada no modal
   */
  onTransactionCreated(): void {
    this.updateFinancialData(); // Atualiza os saldos
    this.loadTransactions(); // Recarrega a lista
  }
}
