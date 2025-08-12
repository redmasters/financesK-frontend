import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionApiService } from '../../../core/services/transaction-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  CreateTransactionRequest,
  AccountOperationType,
  RecurrencePattern,
  PaymentStatus
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
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.scss']
})
export class TransactionModalComponent {
  private transactionApiService = inject(TransactionApiService);
  private notificationService = inject(NotificationService);

  // Event emitter para notificar quando transação é criada
  transactionCreated = output<void>();

  // Enums para o template
  AccountOperationType = AccountOperationType;
  RecurrencePattern = RecurrencePattern;
  PaymentStatus = PaymentStatus;
  TransactionTypeLocal = TransactionTypeLocal;

  // Controle do modal
  isVisible = signal(false);
  isLoading = signal(false);

  // Tipo de transação selecionado (avulso, parcelado, recorrente)
  selectedTransactionType: TransactionTypeLocal = TransactionTypeLocal.SINGLE;

  // Formulário
  transactionForm: CreateTransactionRequest = {
    description: '',
    amount: 0,
    downPayment: 0,
    type: 'EXPENSE',
    operationType: AccountOperationType.PAYMENT,
    status: PaymentStatus.PENDING,
    categoryId: 1,
    dueDate: new Date().toISOString().split('T')[0],
    notes: '',
    currentInstallment: 1,
    recurrencePattern: RecurrencePattern.MONTHLY,
    totalInstallments: 1,
    userId: 1,
    accountId: 1
  };

  /**
   * Abre o modal
   */
  open(type: 'INCOME' | 'EXPENSE'): void {
    this.transactionForm.type = type;
    this.transactionForm.operationType = type === 'INCOME' ? AccountOperationType.SALARY : AccountOperationType.PAYMENT;
    this.isVisible.set(true);
  }

  /**
   * Fecha o modal
   */
  close(): void {
    this.isVisible.set(false);
    this.resetForm();
  }

  /**
   * Submete o formulário
   */
  onSubmit(): void {
    if (this.isFormValid()) {
      this.isLoading.set(true);

      // Prepara os dados baseado no tipo de transação selecionado
      const requestData = this.prepareTransactionData();

      this.transactionApiService.createTransaction(requestData).subscribe({
        next: (response) => {
          console.log('Transação criada com sucesso:', response);
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
  }

  /**
   * Prepara os dados da transação baseado no tipo selecionado
   */
  private prepareTransactionData(): CreateTransactionRequest {
    const baseData = { ...this.transactionForm };

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
   * Valida o formulário
   */
  private isFormValid(): boolean {
    return this.transactionForm.description.trim() !== '' &&
           this.transactionForm.amount > 0;
  }

  /**
   * Reseta o formulário
   */
  private resetForm(): void {
    this.transactionForm = {
      description: '',
      amount: 0,
      downPayment: 0,
      type: 'EXPENSE',
      operationType: AccountOperationType.PAYMENT,
      status: PaymentStatus.PENDING,
      categoryId: 1,
      dueDate: new Date().toISOString().split('T')[0],
      notes: '',
      currentInstallment: 1,
      recurrencePattern: RecurrencePattern.MONTHLY,
      totalInstallments: 1,
      userId: 1,
      accountId: 1
    };
    this.selectedTransactionType = TransactionTypeLocal.SINGLE;
  }

  /**
   * Retorna o título do modal baseado no tipo
   */
  get modalTitle(): string {
    return this.transactionForm.type === 'INCOME' ? 'Nova Receita' : 'Nova Despesa';
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
}
