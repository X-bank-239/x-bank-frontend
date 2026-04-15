// API Types generated from OpenAPI schema

// Enums
export type Currency = "RUB" | "USD" | "EUR" | "CNY";
export type AccountType = "CREDIT" | "DEBIT";
export type TransactionType = "PAYMENT" | "TRANSFER" | "DEPOSIT";

// Request types
export interface AuthUserRequest {
  email: string;
  password: string;
}

export interface Verify2FARequest {
  temp_token: string;
  code: string;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  birthdate: string; // ISO date-time
  password: string;
  role?: UserRole;
}

export interface CreateBankAccountRequest {
  currency: Currency;
  account_type: AccountType;
}

export interface CreateTransactionRequest {
  transaction_type: TransactionType;
  amount: number;
  currency: Currency;
  sender_id?: string; // UUID
  receiver_id?: string; // UUID
  comment?: string;
}

// Response types
export interface BankAccountResponse {
  account_id: string; // UUID
  balance: number;
  currency: Currency;
  account_type: AccountType;
  active?: boolean;
}

export interface BankAccount {
  account_id: string; // UUID
  user_id: string; // UUID
  balance: number;
  currency: Currency;
  account_type: AccountType;
  active?: boolean;
}

export type UserRole = "USER" | "ADMIN";

export interface UserProfileResponse {
  user_id: string; // UUID
  first_name: string;
  last_name: string;
  email: string;
  birthdate: string; // ISO date-time
  accounts: BankAccountResponse[];
  role?: UserRole;
  active?: boolean;
  roles?: string[];
  is_admin?: boolean;
}

export interface Transaction {
  transaction_type: TransactionType;
  transaction_id: string; // UUID
  sender_id?: string; // UUID
  receiver_id?: string; // UUID
  amount: number;
  currency: Currency;
  transaction_date: string; // ISO date-time
  comment?: string;
  status?: TransactionStatus;
}

export type TransactionStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED";

export interface TransactionResponse {
  transaction_type: TransactionType;
  sender_name?: string;
  receiver_name?: string;
  sender_id?: string;
  receiver_id?: string;
  amount: number;
  currency: Currency;
  transaction_date: string; // ISO date-time
  comment?: string;
  status?: TransactionStatus;
}

export interface RecentTransactionsResponse {
  total: number;
  page: number;
  size: number;
  transactions: TransactionResponse[];
}

export interface CurrencyRate {
  currency: Currency;
  rate: number;
  date: string;
  createdAt: string;
}

export interface CreateLoanRequest {
  creditAccountId: string;
  principalAmount: number;
  termMonths: number;
}

export interface LoanRepaymentRequest {
  amount: number;
}

export interface LoanPaymentAmountResponse {
  amount: number;
}

export type LoanStatus = "ACTIVE" | "CLOSED";

export interface LoanResponse {
  loanId: string;
  creditAccountId: string;
  serviceAccountId: string;
  currency: Currency;
  principalAmount: number;
  annualInterestRate: number;
  termMonths: number;
  monthlyPayment: number;
  outstandingPrincipal: number;
  nextPaymentDate: string;
  status: LoanStatus;
}

// Auth response (login returns a token)
export interface AuthResponse {
  token: string;
}

// API Error
export interface ApiError {
  message: string;
  status: number;
}
