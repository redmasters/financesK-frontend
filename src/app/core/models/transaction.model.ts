export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED'
}

export enum RecurrencePattern {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export enum AccountOperationType {
  INITIAL_BALANCE = 'INITIAL_BALANCE',
  SALARY = 'SALARY',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  INTEREST = 'INTEREST',
  FEE = 'FEE',
  ADJUSTMENT = 'ADJUSTMENT',
  REFUND = 'REFUND',
  PAYMENT = 'PAYMENT',
  REWARD = 'REWARD',
  LOAN_PAYMENT = 'LOAN_PAYMENT',
  LOAN_DISBURSEMENT = 'LOAN_DISBURSEMENT',
  DIVIDEND = 'DIVIDEND',
  TAX = 'TAX',
  OTHER = 'OTHER'
}

// Enum para ordenação
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

// Enum para campos de ordenação
export enum SortField {
  DUE_DATE = 'DUE_DATE',
  CREATED_AT = 'CREATED_AT',
  AMOUNT = 'AMOUNT',
  DESCRIPTION = 'DESCRIPTION'
}

// Interface para informações de parcelas
export interface InstallmentInfo {
  totalInstallments: number;
  currentInstallment: number;
  installmentValue: number;
}

// Interface para transação detalhada (response da busca)
export interface TransactionDetail {
  id: number;
  description: string;
  amount: number;
  amountFormatted: string;
  downPaymentFormatted?: string;
  downPayment?: number;
  type: TransactionType;
  operationType: AccountOperationType;
  status: PaymentStatus;
  categoryId: number;
  categoryName: string;
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  recurrencePattern?: RecurrencePattern;
  installmentInfo?: InstallmentInfo;
  userId: number;
  accountId: number;
  accountName: string;
}

export interface FinancialData {
  totalIncome: number;
  totalIncomeFormatted: string;
  totalExpense: number;
  totalExpenseFormatted: string;
  balance: number;
  balanceFormatted: string;
  currency: string;
}

// Interface para informações de paginação
export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

// Interface para response paginada
export interface TransactionSearchResponse {
  content: TransactionDetail[];
  page: PageInfo;
  balance:  FinancialData;
}

// Interface para parâmetros de busca
export interface TransactionSearchParams {
  userId: number;
  accountsId?: number[];
  startDate: string;
  endDate: string;
  type?: TransactionType;
  status?: PaymentStatus;
  categoryId?: number;
  isRecurring?: boolean;
  hasInstallments?: boolean;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  size?: number;
  sortField?: SortField;
  sortDirection?: SortDirection;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  amountFormatted: string;
  downPayment?: number;
  downPaymentFormatted?: string;
  type: TransactionType;
  operationType: AccountOperationType;
  status: PaymentStatus;
  categoryId: number;
  categoryName?: string;
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  recurrencePattern?: RecurrencePattern;
  installmentInfo?: InstallmentInfo;
  userId: number;
  accountId: number;
  accountName?: string;
}

export interface CreateTransactionRequest {
  description: string;
  amount: number;
  downPayment?: number;
  type: TransactionType;
  operationType: AccountOperationType;
  status: PaymentStatus;
  categoryId: number;
  dueDate: string;
  notes?: string;
  currentInstallment?: number;
  recurrencePattern?: RecurrencePattern;
  totalInstallments?: number;
  userId: number;
  accountId: number;
}

export interface UpdateTransactionRequest {
  description: string;
  amount: number;
  downPayment?: number;
  type: TransactionType;
  operationType: AccountOperationType;
  status: PaymentStatus;
  categoryId: number;
  dueDate: string;
  notes?: string;
  currentInstallment?: number;
  accountId: number;
}

export interface CreateTransactionResponse {
  id: number;
  message: string;
  createdAt: string;
}
