import { Component, OnInit, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { BankInstitutionService } from '../../core/services/bank-institution.service';
import { NotificationService } from '../../core/services/notification.service';
import { CurrencyService } from '../../core/services/currency.service';
import { PrivacyService } from '../../core/services/privacy.service';
import { Account, AccountType, CreateAccountRequest } from '../../core/models/account.model';
import { CurrencyInputDirective } from '../../shared/directives/currency-input.directive';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyInputDirective],
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

  // Controle de agrupamento
  groupedAccounts = signal<{ [bankName: string]: Account[] }>({});
  expandedBanks = signal<Set<string>>(new Set());

  // Serviços injetados
  private fb = inject(FormBuilder);
  public accountService = inject(AccountService);
  private notificationService = inject(NotificationService);
  private bankInstitutionService = inject(BankInstitutionService);
  private currencyService = inject(CurrencyService);
  private privacyService = inject(PrivacyService);

  constructor() {
    this.accountForm = this.createForm();

    // Effect para reagir a mudanças nas contas
    effect(() => {
      const accounts = this.accountService.accounts();
      if (accounts.length > 0) {
        this.groupAccountsByBank();
      }
    });
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

  /**
   * Agrupa contas por banco
   */
  private groupAccountsByBank(): void {
    const accounts = this.accountService.accounts();
    const grouped: { [bankName: string]: Account[] } = {};

    accounts.forEach(account => {
      const bankName = account.bankInstitutionName || 'Sem Banco';
      if (!grouped[bankName]) {
        grouped[bankName] = [];
      }
      grouped[bankName].push(account);
    });

    this.groupedAccounts.set(grouped);
  }

  /**
   * Retorna as chaves dos bancos (nomes dos bancos)
   */
  getBankNames(): string[] {
    return Object.keys(this.groupedAccounts());
  }

  /**
   * Retorna as contas de um banco específico
   */
  getAccountsByBank(bankName: string): Account[] {
    return this.groupedAccounts()[bankName] || [];
  }

  /**
   * Verifica se um banco está expandido
   */
  isBankExpanded(bankName: string): boolean {
    return this.expandedBanks().has(bankName);
  }

  /**
   * Alterna a expansão de um grupo de banco
   */
  toggleBankExpansion(bankName: string): void {
    const expanded = new Set(this.expandedBanks());
    if (expanded.has(bankName)) {
      expanded.delete(bankName);
    } else {
      expanded.add(bankName);
    }
    this.expandedBanks.set(expanded);
  }

  /**
   * Calcula o saldo total de um banco (excluindo cartões de crédito)
   */
  getBankTotalBalance(bankName: string): number {
    const accounts = this.getAccountsByBank(bankName);
    return accounts.reduce((total, account) => {
      if (account.accountType !== AccountType.CARTAO_CREDITO) {
        return total + account.accountCurrentBalance;
      }
      return total;
    }, 0);
  }

  /**
   * Calcula o limite total disponível de cartões de crédito de um banco
   */
  getBankTotalCreditLimit(bankName: string): number {
    const accounts = this.getAccountsByBank(bankName);
    return accounts.reduce((total, account) => {
      if (account.accountType === AccountType.CARTAO_CREDITO) {
        return total + this.getCreditAvailable(account);
      }
      return total;
    }, 0);
  }

  /**
   * Verifica se um banco tem cartões de crédito
   */
  bankHasCreditCards(bankName: string): boolean {
    const accounts = this.getAccountsByBank(bankName);
    return accounts.some(account => account.accountType === AccountType.CARTAO_CREDITO);
  }

  /**
   * Verifica se um banco tem contas que não são cartão de crédito
   */
  bankHasRegularAccounts(bankName: string): boolean {
    const accounts = this.getAccountsByBank(bankName);
    return accounts.some(account => account.accountType !== AccountType.CARTAO_CREDITO);
  }

  /**
   * Formata o saldo total do banco (sem cartões de crédito)
   */
  formatBankTotalBalance(bankName: string): string {
    const total = this.getBankTotalBalance(bankName);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(total);
  }

  /**
   * Formata o limite total de cartões de crédito do banco
   */
  formatBankTotalCreditLimit(bankName: string): string {
    const total = this.getBankTotalCreditLimit(bankName);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(total);
  }

  /**
   * Retorna um resumo dos tipos de conta de um banco
   */
  getBankAccountTypesSummary(bankName: string): string[] {
    const accounts = this.getAccountsByBank(bankName);
    const types = new Set(accounts.map(account => this.getAccountTypeLabel(account.accountType)));
    return Array.from(types);
  }

  /**
   * Verifica se deve mostrar como grupo (mais de uma conta do mesmo banco)
   */
  shouldShowAsGroup(bankName: string): boolean {
    return this.getAccountsByBank(bankName).length > 1;
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
      accountCurrentBalance: this.currencyService.reaisToCents(account.accountCurrentBalance), // Usar método com arredondamento
      accountCurrency: account.accountCurrency,
      bankInstitutionId: null, // Não temos mais o ID, apenas o nome
      accountType: account.accountType,
      accountCreditLimit: account.accountCreditLimit ? this.currencyService.reaisToCents(account.accountCreditLimit) : null, // Usar método com arredondamento
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
        accountCurrentBalance: formValue.accountCurrentBalance, // A diretiva já envia em centavos
        accountCurrency: formValue.accountCurrency,
        bankInstitutionId: formValue.bankInstitutionId || undefined,
        accountType: formValue.accountType,
        accountCreditLimit: formValue.accountCreditLimit || undefined, // A diretiva já envia em centavos
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

  // Métodos para cartão de crédito
  getCreditUsagePercentage(account: Account): number {
    if (!account.accountCreditLimit || account.accountCreditLimit === 0) {
      return 0;
    }
    // Para cartão de crédito, o saldo negativo representa o valor usado
    const usedAmount = Math.abs(account.accountCurrentBalance);
    return Math.min((usedAmount / account.accountCreditLimit) * 100, 100);
  }

  getCreditAvailable(account: Account): number {
    if (!account.accountCreditLimit) {
      return 0;
    }
    // Limite disponível = limite total - valor usado (saldo negativo)
    const usedAmount = Math.abs(account.accountCurrentBalance);
    return Math.max(account.accountCreditLimit - usedAmount, 0);
  }

  formatCreditAvailable(account: Account): string {
    const available = this.getCreditAvailable(account);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(available);
  }

  getCreditUsageClass(account: Account): string {
    const percentage = this.getCreditUsagePercentage(account);
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'success';
  }

  /**
   * Método para ser usado no template para valores monetários
   */
  getDisplayValue(value: string): string {
    return this.privacyService.getDisplayValue(value);
  }
}
