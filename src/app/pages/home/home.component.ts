import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BalanceService, FinancialData } from '../../core/services/balance.service';
import { TransactionApiService } from '../../core/services/transaction-api.service';
import {
  PaymentStatus,
  TransactionDetail,
  TransactionSearchParams,
  TransactionType,
  SortDirection,
  SortField
} from '../../core/models/transaction.model';
import { TransactionModalComponent } from '../../shared/components/transaction-modal/transaction-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionModalComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private balanceService = inject(BalanceService);
  private transactionApiService = inject(TransactionApiService);

  // Referência ao modal
  @ViewChild(TransactionModalComponent) transactionModal!: TransactionModalComponent;

  // Enums para uso no template
  PaymentStatus = PaymentStatus;

  // Filtros do usuário
  selectedStatus: PaymentStatus | 'ALL' = 'ALL';
  startDate: string = '';
  endDate: string = '';
  userId: number = 1;

  // Propriedades para lista de transações
  transactions: TransactionDetail[] = [];
  isLoadingTransactions = false;
  selectedTransactionType: TransactionType | '' = '';

  // Paginação
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  constructor() {
    // Inicializa as datas com o mês atual
    this.initializeCurrentMonthDates();
    // Carrega dados iniciais
    this.updateFinancialData();
    this.loadTransactions();
  }

  // Usando dados do service em vez de hardcoded
  get financialData(): FinancialData {
    return this.balanceService.financialData();
  }

  // Delegando formatação para o service
  formatCurrency(value: number): string {
    return this.balanceService.formatCurrency(value);
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
    this.transactionModal.open('INCOME');
  }

  /**
   * Abre modal para criar despesa
   */
  openExpenseModal(): void {
    this.transactionModal.open('EXPENSE');
  }

  /**
   * Retorna a data atual formatada em português
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('pt-BR');
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
    this.isLoadingTransactions = true;

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

    this.transactionApiService.searchTransactions(params).subscribe({
      next: (response) => {
        this.transactions = response.content;
        this.totalElements = response.page.totalElements;
        this.totalPages = response.page.totalPages;
        this.isLoadingTransactions = false;
      },
      error: (error) => {
        console.error('Erro ao carregar transações:', error);
        this.isLoadingTransactions = false;
        this.transactions = [];
      }
    });
  }

  /**
   * Callback quando transação é criada com sucesso
   */
  onTransactionCreated(): void {
    // Recarrega os dados financeiros e transações após criar transação
    this.updateFinancialData();
    this.loadTransactions();
  }

  /**
   * Callback quando o tipo de transação é alterado
   */
  onTransactionTypeChange(): void {
    this.currentPage = 0;
    this.loadTransactions();
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
  getTransactionTypeLabel(transaction: TransactionDetail): string {
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
  getTransactionTypeBadgeClass(transaction: TransactionDetail): string {
    if (transaction.installmentInfo) {
      return 'badge-installment';
    }
    if (transaction.recurrencePattern) {
      return 'badge-recurring';
    }
    return 'badge-single';
  }

  /**
   * Edita uma transação (placeholder)
   */
  editTransaction(transaction: TransactionDetail): void {
    // TODO: Implementar edição de transação
    console.log('Editar transação:', transaction);
  }

  /**
   * Exclui uma transação (placeholder)
   */
  deleteTransaction(transaction: TransactionDetail): void {
    // TODO: Implementar exclusão de transação
    console.log('Excluir transação:', transaction);
  }
}
