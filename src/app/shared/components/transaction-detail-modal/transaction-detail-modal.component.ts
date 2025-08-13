import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../../core/services/currency.service';
import { CategoryService } from '../../../core/services/category.service';
import { Transaction, TransactionType, PaymentStatus } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-transaction-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-detail-modal.component.html',
  styleUrls: ['./transaction-detail-modal.component.scss']
})
export class TransactionDetailModalComponent {
  private currencyService = inject(CurrencyService);
  private categoryService = inject(CategoryService);

  // Event emitters
  editRequested = output<Transaction>();
  deleteRequested = output<Transaction>();

  // Controle do modal
  isVisible = signal(false);
  transaction = signal<Transaction | null>(null);

  // Enums para o template
  TransactionType = TransactionType;
  PaymentStatus = PaymentStatus;

  /**
   * Abre o modal com os detalhes da transação
   */
  open(transaction: Transaction): void {
    this.transaction.set(transaction);
    this.isVisible.set(true);
  }

  /**
   * Fecha o modal
   */
  close(): void {
    this.isVisible.set(false);
    this.transaction.set(null);
  }

  /**
   * Solicita edição da transação
   */
  onEdit(): void {
    const currentTransaction = this.transaction();
    if (currentTransaction) {
      this.editRequested.emit(currentTransaction);
      this.close();
    }
  }

  /**
   * Solicita exclusão da transação
   */
  onDelete(): void {
    const currentTransaction = this.transaction();
    if (currentTransaction) {
      this.deleteRequested.emit(currentTransaction);
      this.close();
    }
  }

  /**
   * Formata valores monetários
   */
  formatCurrency(value: number): string {
    return this.currencyService.formatBRL(value);
  }

  /**
   * Formata datas para exibição
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  /**
   * Retorna o label do status traduzido
   */
  getStatusLabel(status: PaymentStatus): string {
    const statusLabels = {
      [PaymentStatus.PENDING]: 'Pendente',
      [PaymentStatus.PAID]: 'Pago',
      [PaymentStatus.FAILED]: 'Falhado'
    };
    return statusLabels[status];
  }

  /**
   * Retorna o label do tipo de transação
   */
  getTypeLabel(type: TransactionType): string {
    return type === TransactionType.INCOME ? 'Receita' : 'Despesa';
  }

  /**
   * Retorna o label do tipo de transação baseado nos dados
   */
  getTransactionTypeLabel(): string {
    const currentTransaction = this.transaction();
    if (!currentTransaction) return '';

    if (currentTransaction.installmentInfo) {
      return 'Parcelado';
    }
    if (currentTransaction.recurrencePattern) {
      return 'Recorrente';
    }
    return 'Avulso';
  }

  /**
   * Retorna a classe CSS para o badge do status
   */
  getStatusBadgeClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PAID:
        return 'badge-success';
      case PaymentStatus.PENDING:
        return 'badge-warning';
      case PaymentStatus.FAILED:
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  /**
   * Retorna a classe CSS para o badge do tipo
   */
  getTypeBadgeClass(type: TransactionType): string {
    return type === TransactionType.INCOME ? 'badge-income' : 'badge-expense';
  }

  /**
   * Retorna a classe CSS para o badge do tipo de transação
   */
  getTransactionTypeBadgeClass(): string {
    const currentTransaction = this.transaction();
    if (!currentTransaction) return '';

    if (currentTransaction.installmentInfo) {
      return 'badge-installment';
    }
    if (currentTransaction.recurrencePattern) {
      return 'badge-recurring';
    }
    return 'badge-single';
  }

  /**
   * Retorna o nome da categoria
   */
  getCategoryName(): string {
    const currentTransaction = this.transaction();
    if (!currentTransaction) return '';

    return currentTransaction.categoryName || 'Categoria não encontrada';
  }

  /**
   * Retorna informações sobre parcelas se aplicável
   */
  getInstallmentInfo(): string {
    const currentTransaction = this.transaction();
    if (!currentTransaction?.installmentInfo) return '';

    const { currentInstallment, totalInstallments } = currentTransaction.installmentInfo;
    return `${currentInstallment}ª de ${totalInstallments} parcelas`;
  }

  /**
   * Retorna o label da recorrência
   */
  getRecurrenceLabel(): string {
    const currentTransaction = this.transaction();
    if (!currentTransaction?.recurrencePattern) return '';

    const labels = {
      'DAILY': 'Diária',
      'WEEKLY': 'Semanal',
      'MONTHLY': 'Mensal',
      'YEARLY': 'Anual'
    };

    return labels[currentTransaction.recurrencePattern] || currentTransaction.recurrencePattern;
  }
}
