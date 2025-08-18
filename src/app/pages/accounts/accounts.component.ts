import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { BankInstitutionService } from '../../core/services/bank-institution.service';
import { NotificationService } from '../../core/services/notification.service';
import { Account, AccountType, CreateAccountRequest } from '../../core/models/account.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  accountForm: FormGroup;
  isFormVisible = signal<boolean>(false);
  editingAccount = signal<Account | null>(null);

  readonly AccountType = AccountType;
  readonly accountTypes = [
    { value: AccountType.CONTA_CORRENTE, label: 'Conta Corrente' },
    { value: AccountType.CARTEIRA, label: 'Carteira' },
    { value: AccountType.CARTAO_CREDITO, label: 'Cartão de Crédito' },
    { value: AccountType.POUPANCA, label: 'Poupança' }
  ];

  constructor(
    private fb: FormBuilder,
    public accountService: AccountService,
    private notificationService: NotificationService,
    private bankInstitutionService: BankInstitutionService
  ) {
    this.accountForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.bankInstitutionService.loadAllBankInstitutions();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      accountName: ['', [Validators.required, Validators.maxLength(100)]],
      accountDescription: ['', [Validators.maxLength(255)]],
      accountCurrentBalance: [0],
      accountCurrency: ['BRL'],
      bankInstitutionId: [null],
      accountType: ['', [Validators.required]],
      accountCreditLimit: [null],
      accountStatementClosingDate: [null],
      accountPaymentDueDate: [null]
    });
  }

  loadAccounts(): void {
    this.accountService.loadAccounts(1); // userId hardcoded como 1
  }

  showForm(): void {
    this.isFormVisible.set(true);
    this.editingAccount.set(null);
    this.accountForm.reset({
      accountCurrentBalance: 0,
      accountCurrency: 'BRL'
    });
  }

  hideForm(): void {
    this.isFormVisible.set(false);
    this.editingAccount.set(null);
    this.accountForm.reset();
  }

  editAccount(account: Account): void {
    this.editingAccount.set(account);
    this.isFormVisible.set(true);

    this.accountForm.patchValue({
      accountName: account.accountName,
      accountDescription: account.accountDescription || '',
      accountCurrentBalance: account.accountCurrentBalance, // Agora já vem formatado corretamente
      accountCurrency: account.accountCurrency,
      bankInstitutionId: null, // Não temos mais o ID, apenas o nome
      accountType: account.accountType,
      accountCreditLimit: account.accountCreditLimit || null,
      accountStatementClosingDate: account.accountStatementClosingDate,
      accountPaymentDueDate: account.accountPaymentDueDate
    });
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      const formValue = this.accountForm.value;

      const accountData: CreateAccountRequest = {
        accountName: formValue.accountName,
        accountDescription: formValue.accountDescription || undefined,
        accountCurrentBalance: formValue.accountCurrentBalance * 100, // Converter para centavos
        accountCurrency: formValue.accountCurrency,
        bankInstitutionId: formValue.bankInstitutionId || undefined,
        accountType: formValue.accountType,
        accountCreditLimit: formValue.accountCreditLimit ? formValue.accountCreditLimit * 100 : undefined,
        accountStatementClosingDate: formValue.accountStatementClosingDate || undefined,
        accountPaymentDueDate: formValue.accountPaymentDueDate || undefined,
        userId: 1
      };

      if (this.editingAccount()) {
        this.updateAccount(accountData);
      } else {
        this.createAccount(accountData);
      }
    }
  }

  private createAccount(accountData: CreateAccountRequest): void {
    this.accountService.createAccount(accountData).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Conta criada com sucesso!');
        this.hideForm();
        this.loadAccounts();
      },
      error: (error) => {
        console.error('Erro ao criar conta:', error);
        this.notificationService.showError('Erro ao criar conta. Tente novamente.');
      }
    });
  }

  private updateAccount(accountData: CreateAccountRequest): void {
    const accountId = this.editingAccount()?.accountId;
    if (accountId) {
      this.accountService.updateAccount(accountId, accountData).subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Conta atualizada com sucesso!');
          this.hideForm();
          this.loadAccounts();
        },
        error: (error) => {
          console.error('Erro ao atualizar conta:', error);
          this.notificationService.showError('Erro ao atualizar conta. Tente novamente.');
        }
      });
    }
  }

  deleteAccount(account: Account): void {
    if (confirm(`Tem certeza que deseja excluir a conta "${account.accountName}"?`)) {
      this.accountService.deleteAccount(account.accountId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Conta excluída com sucesso!');
          this.loadAccounts();
        },
        error: (error) => {
          console.error('Erro ao excluir conta:', error);
          this.notificationService.showError('Erro ao excluir conta. Tente novamente.');
        }
      });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  }

  getAccountTypeLabel(type: AccountType): string {
    const typeMap = {
      [AccountType.CONTA_CORRENTE]: 'Conta Corrente',
      [AccountType.CARTEIRA]: 'Carteira',
      [AccountType.CARTAO_CREDITO]: 'Cartão de Crédito',
      [AccountType.POUPANCA]: 'Poupança'
    };
    return typeMap[type] || type;
  }

  shouldShowCreditFields(): boolean {
    return this.accountForm.get('accountType')?.value === AccountType.CARTAO_CREDITO;
  }

  getBankInstitutionName(id: number): string {
    return this.bankInstitutionService.getBankInstitutionName(id);
  }

  get bankInstitutions() {
    return this.bankInstitutionService.bankInstitutions;
  }
}
