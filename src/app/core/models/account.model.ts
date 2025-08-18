export interface Account {
  accountId: number;
  accountName: string;
  accountDescription?: string;
  accountType: AccountType;
  bankInstitutionName?: string;
  accountCreditLimit?: number;
  accountCreditLimitFormatted?: string;
  accountStatementClosingDate?: number | null;
  accountPaymentDueDate?: number | null;
  accountStatementClosingDateFormatted?: string | null;
  accountPaymentDueDateFormatted?: string | null;
  accountCurrentBalance: number;
  accountCurrentBalanceFormatted: string;
  accountCurrency: string;
  userId: number;
  userName?: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export enum AccountType {
  CONTA_CORRENTE = 'CONTA_CORRENTE',
  CARTEIRA = 'CARTEIRA',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  POUPANCA = 'POUPANCA'
}

export interface CreateAccountRequest {
  accountName: string;
  accountDescription?: string;
  accountCurrentBalance?: number;
  accountCurrency?: string;
  bankInstitutionId?: number;
  accountType?: string;
  accountCreditLimit?: number;
  accountStatementClosingDate?: number;
  accountPaymentDueDate?: number;
  userId: number;
}

export interface CreateAccountResponse {
  id: number;
  message: string;
  createdAt: string;
}
