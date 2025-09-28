import { Component, OnInit, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { BankInstitutionService } from '../../core/services/bank-institution.service';
import { NotificationService } from '../../core/services/notification.service';
import { CurrencyService } from '../../core/services/currency.service';
import { PrivacyService } from '../../core/services/privacy.service';
import { AuthService } from '../../core/services/auth.service';
import { OnboardingService } from '../../core/services/onboarding.service';
import { Account, AccountType, CreateAccountRequest } from '../../core/models/account.model';
import { CurrencyInputDirective } from '../../shared/directives/currency-input.directive';
import { OnboardingTooltipComponent, OnboardingTooltip } from '../../shared/components/onboarding-tooltip/onboarding-tooltip.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyInputDirective, OnboardingTooltipComponent],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  accountForm: FormGroup;
  isFormVisible = signal<boolean>(false);
  editingAccount = signal<Account | null>(null);

  // Onboarding state
  isOnboardingActive = signal<boolean>(false);
  currentOnboardingTooltip = signal<OnboardingTooltip | null>(null);
  showOnboardingTooltip = signal<boolean>(false);

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
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private onboardingService = inject(OnboardingService);

  constructor() {
    this.accountForm = this.createForm();

    // Effect para reagir a mudanças nas contas
    effect(() => {
      const accounts = this.accountService.accounts();
      if (accounts.length > 0) {
        this.groupAccountsByBank();
      }
    });

    // Effect para monitorar o carregamento das instituições bancárias
    effect(() => {
      const institutions = this.bankInstitutions();
      console.log('Instituições bancárias no componente:', institutions);
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.bankInstitutionService.loadAllBankInstitutions();

    // Verifica se está em modo onboarding - melhorado
    this.route.queryParams.subscribe(params => {
      console.log('Query params recebidos:', params);

      const showOnboarding = params['onboarding'] === 'true';
      const step = params['step'];

      console.log('Onboarding ativo:', showOnboarding, 'Step:', step);

      if (showOnboarding && step === 'create-account') {
        console.log('Iniciando tooltip do onboarding...');
        this.isOnboardingActive.set(true);
        this.startAccountCreationTooltip();
      }
    });

    // Escuta mudanças no estado do onboarding
    this.onboardingService.onboardingState$.subscribe(state => {
      console.log('Estado do onboarding mudou:', state);
      this.isOnboardingActive.set(state.isActive);
    });
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
    const currentUser = this.authService.currentUserValue;
    const userId = currentUser ? currentUser.id : 1; // Fallback para 1 se não houver usuário
    this.accountService.loadAccounts(userId);
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
      const currentUser = this.authService.currentUserValue;
      const userId = currentUser ? currentUser.id : 1; // Fallback para 1 se não houver usuário

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
        userId: userId
      };

      if (this.editingAccount()) {
        this.updateAccount(accountData);
      } else {
        this.createAccount(accountData);
      }
    }
  }

  private startAccountCreationTooltip(): void {
    setTimeout(() => {
      const tooltip: OnboardingTooltip = {
        title: 'Criar sua primeira conta bancária',
        description: 'Vamos começar criando sua primeira conta bancária. Clique no botão "Nova Conta" para começar.',
        position: 'bottom',
        targetElement: 'nova-conta-btn',
        showNext: true,
        showSkip: true
      };

      this.currentOnboardingTooltip.set(tooltip);
      this.showOnboardingTooltip.set(true);
    }, 500);
  }

  onTooltipNext(): void {
    if (this.currentOnboardingTooltip()?.title.includes('primeira conta')) {
      // Verifica se já existe pelo menos uma conta
      const hasAccounts = this.accountService.accounts().length > 0;

      if (hasAccounts) {
        // Se já tem contas, completa o passo e vai para home
        this.onboardingService.completeStep('create-account');
        this.showOnboardingTooltip.set(false);
        this.router.navigate(['/home'], {
          queryParams: { onboarding: 'true', step: 'first-transaction' }
        });
      } else {
        // Se não tem contas, mostra o formulário e orienta a criar
        this.showForm();
        this.showFormTooltip();
      }
    } else if (this.currentOnboardingTooltip()?.title.includes('Preencher os dados')) {
      // Verifica se o formulário está válido antes de permitir avançar
      if (this.accountForm.valid) {
        // Orienta o usuário a submeter o formulário
        this.showSubmitTooltip();
      } else {
        // Se o formulário não está válido, mostra mensagem de orientação
        this.notificationService.showWarning('Por favor, preencha pelo menos o nome da conta e o tipo antes de continuar.');
      }
    } else if (this.currentOnboardingTooltip()?.title.includes('Finalizar criação')) {
      // Verifica novamente se tem contas antes de finalizar
      const hasAccounts = this.accountService.accounts().length > 0;

      if (hasAccounts) {
        this.onboardingService.completeStep('create-account');
        this.showOnboardingTooltip.set(false);
        this.router.navigate(['/home'], {
          queryParams: { onboarding: 'true', step: 'first-transaction' }
        });
      } else {
        this.notificationService.showWarning('Você precisa criar pelo menos uma conta antes de continuar.');
      }
    }
  }

  private showSubmitTooltip(): void {
    setTimeout(() => {
      const tooltip: OnboardingTooltip = {
        title: 'Finalizar criação da conta',
        description: 'Agora clique no botão "Criar Conta" para salvar sua primeira conta bancária e continuar.',
        position: 'top',
        showNext: true,
        showPrevious: true,
        showSkip: true
      };

      this.currentOnboardingTooltip.set(tooltip);
      this.showOnboardingTooltip.set(true);
    }, 300);
  }

  private showFormTooltip(): void {
    setTimeout(() => {
      const tooltip: OnboardingTooltip = {
        title: 'Preencher os dados da conta',
        description: 'Preencha os dados da sua conta bancária. No mínimo, você precisa informar o nome e o tipo da conta.',
        position: 'left',
        showNext: true,
        showPrevious: true,
        showSkip: true
      };

      this.currentOnboardingTooltip.set(tooltip);
      this.showOnboardingTooltip.set(true);
    }, 300);
  }

  onTooltipPrevious(): void {
    if (this.currentOnboardingTooltip()?.title.includes('Preencher os dados')) {
      this.hideForm();
      this.startAccountCreationTooltip();
    } else if (this.currentOnboardingTooltip()?.title.includes('Finalizar criação')) {
      this.showFormTooltip();
    }
  }

  onTooltipSkip(): void {
    this.onboardingService.skipOnboarding();
    this.showOnboardingTooltip.set(false);
    this.router.navigate(['/home']);
  }

  onTooltipClose(): void {
    this.showOnboardingTooltip.set(false);
  }

  private createAccount(accountData: CreateAccountRequest): void {
    this.accountService.createAccount(accountData).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Conta criada com sucesso!');
        this.hideForm();
        this.loadAccounts();

        // Se está em onboarding, completa este passo e vai para o próximo
        if (this.isOnboardingActive()) {
          this.onboardingService.completeStep('create-account');
          this.showOnboardingTooltip.set(false);

          setTimeout(() => {
            this.router.navigate(['/home'], {
              queryParams: { onboarding: 'true', step: 'first-transaction' }
            });
          }, 1500);
        }
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

  startOnboarding(): void {
    // Inicia o processo de onboarding
    this.onboardingService.startOnboarding();
  }

  getTargetElement(): HTMLElement | undefined {
    const tooltip = this.currentOnboardingTooltip();
    if (!tooltip || !tooltip.targetElement) return undefined;

    return document.getElementById(tooltip.targetElement) || undefined;
  }
}
