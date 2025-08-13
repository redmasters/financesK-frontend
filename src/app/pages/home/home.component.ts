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

  // Paginação
  currentPage = 0;
  pageSize = 20;

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
    this.selectedTransactionType = ''; // Também reseta o filtro de tipo de transação
    this.initializeCurrentMonthDates();
    this.currentPage = 0; // Reseta a página
    this.updateFinancialData(); // Isso já vai chamar loadTransactions()
  }

  /**
   * Retorna o label traduzido do status
   */
  getStatusLabel(status: PaymentStatus | 'ALL'): string {
    if (status === 'ALL') return 'Todos';

    const statusLabels = {
      [PaymentStatus.PENDING]: 'Pendente',
      [PaymentStatus.PAID]: 'Pago',
      [PaymentStatus.FAILED]: 'Falhado'
    };
    return statusLabels[status];
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

  /**
   * Retorna a data atual formatada
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('pt-BR');
  }

  /**
   * Método auxiliar para Math.abs no template
   */
  abs(value: number): number {
    return Math.abs(value);
  }

  /**
   * Calcula o progresso do mês atual (porcentagem de dias decorridos)
   */
  getMonthProgress(): number {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const totalDays = endOfMonth.getDate();
    const currentDay = now.getDate();

    return (currentDay / totalDays) * 100;
  }

  /**
   * Calcula a porcentagem de gastos em relação às entradas
   */
  getExpensePercentage(): number {
    if (this.financialData.totalIncome <= 0) return 0;
    return Math.round((this.financialData.totalExpense / this.financialData.totalIncome) * 100);
  }

  // ============= MÉTODOS PARA LISTA DE TRANSAÇÕES =============

  /**
   * Carrega a lista de transações com base nos filtros atuais
   */
  loadTransactions(): void {
    const params: TransactionSearchParams = {
      userId: this.userId,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.selectedStatus === 'ALL' ? undefined : this.selectedStatus,
      type: this.selectedTransactionType || undefined,
      page: this.currentPage,
      size: this.pageSize,
      sortField: SortField.DUE_DATE,
      sortDirection: SortDirection.DESC
    };

    this.transactionService.searchTransactions(params).subscribe({
      next: (response) => {
        // O serviço já atualiza os signals automaticamente
      },
      error: (error) => {
        console.error('Erro ao carregar transações:', error);
      }
    });
  }

  /**
   * Callback quando transação é criada com sucesso
   */
  onTransactionCreated(): void {
    // Recarrega os dados financeiros e transações após criar transação
    this.updateFinancialData();
  }

  /**
   * Callback quando o tamanho da página é alterado
   */
  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadTransactions();
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
   * Retorna as páginas visíveis na paginação
   */
  getVisiblePages(): number[] {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(0, this.currentPage - half);
    let end = Math.min(this.totalPages - 1, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  /**
   * Retorna o range de exibição atual (ex: "1-20 de 100")
   */
  getDisplayRange(): string {
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
    return `${start}-${end}`;
  }

  /**
   * Formata data de transação para exibição
   */
  formatTransactionDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
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
   * Abre o modal de detalhes da transação
   */
  viewTransactionDetails(transaction: Transaction): void {
    // Busca os detalhes completos da transação
    this.transactionService.getTransactionById(transaction.id).subscribe({
      next: (fullTransaction) => {
        this.transactionDetailModal.open(fullTransaction);
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes da transação:', error);
        this.notificationService.error('Erro ao carregar detalhes da transação');
      }
    });
  }

  /**
   * Callback quando edição é solicitada a partir do modal de detalhes
   */
  onEditFromDetails(transaction: Transaction): void {
    this.editTransaction(transaction);
  }

  /**
   * Callback quando exclusão é solicitada a partir do modal de detalhes
   */
  onDeleteFromDetails(transaction: Transaction): void {
    this.deleteTransaction(transaction);
  }
}
