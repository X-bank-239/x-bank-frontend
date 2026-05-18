// API Types aligned with OpenAPI (X-Bank)

// Enums
export type Currency = "RUB" | "USD" | "EUR" | "CNY";
export type AccountType = "CREDIT" | "DEBIT" | "SAVINGS";
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

export interface UpdatePasswordRequest {
  old_password: string;
  new_password: string;
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
  category?: string;
  commission?: number;
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
  category?: string;
  commission?: number;
}

export interface RecentTransactionsResponse {
  total: number;
  page: number;
  size: number;
  transactions: TransactionResponse[];
}

export interface LoginInitResponse {
  requires2fa?: boolean;
  /** OpenAPI: tempToken */
  tempToken?: string;
  email?: string;
}

export interface CurrencyRate {
  currency: Currency;
  rate: number;
  date: string;
  createdAt: string;
  comment?: string;
}

export interface CreateCurrencyRateRequest {
  currency: Currency;
  rate: number;
  date: string; // YYYY-MM-DD
  comment?: string;
}

export interface UpdateCurrencyRateRequest {
  rate: number;
  comment?: string;
}

/** POST /loans/create (OpenAPI: camelCase). */
export interface CreateLoanRequest {
  debitAccountId: string;
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

/** Кредит наличными (OpenAPI LoanResponse, camelCase). */
export interface LoanResponse {
  loanId: string;
  debitAccountId: string;
  serviceAccountId: string;
  autopayEnabled: boolean;
  currency: Currency;
  principalAmount: number;
  annualInterestRate: number;
  termMonths: number;
  monthlyPayment: number;
  outstandingPrincipal: number;
  nextPaymentDate: string;
  status: LoanStatus;
}

export interface CreateCategoryRequest {
  code: string;
  display_name: string;
  color_code: string;
}

export interface UpdateCategoryRequest {
  display_name?: string;
  color_code?: string;
}

export interface TransactionCategory {
  code: string;
  display_name: string;
  color_code: string;
  is_active?: boolean;
}

export interface CreateKeywordRequest {
  word: string;
  category_code: string;
}

export interface UpdateKeywordRequest {
  word?: string;
  category_code?: string;
}

export interface TransactionKeyword {
  word: string;
  categoryCode: string;
  createdAt?: string;
}

/** POST /savings/prolong/{accountId} (query). */
export interface ProlongSavingsRequest {
  new_maturity_date: string;
}

/** DELETE /savings/close/{accountId} — JSON-тело. */
export interface CloseSavingsRequest {
  target_account_id: string;
}

/** Параметры открытия вклада (на бэке часто маппятся в path-шаблон create/…/…/…/…). */
export interface CreateSavingsAccountRequest {
  account_id: string;
  maturity_date: string;
  allow_withdrawal: boolean;
  allow_top_up: boolean;
}

/** Ответ API вклада (OpenAPI: camelCase). */
export interface SavingsAccount {
  accountId: string;
  accruedInterest: number;
  interestRate: number;
  maturityDate: string;
  lastInterestCalculation: string;
  allowWithdrawal: boolean;
  allowTopUp: boolean;
  earlyWithdrawalPenalty: number;
  status: string;
  autoProlong: boolean;
}

export interface AppSetting {
  setting_key: string;
  setting_value: string;
  description?: string;
  updated_at?: string;
  updated_by: string;
}

export interface UpdateAppSettingRequest {
  setting_value?: string;
  description?: string;
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
