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

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  birthdate: string; // ISO date-time
  password: string;
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
}

export interface BankAccount {
  account_id: string; // UUID
  user_id: string; // UUID
  balance: number;
  currency: Currency;
  account_type: AccountType;
}

export interface UserProfileResponse {
  user_id: string; // UUID
  first_name: string;
  last_name: string;
  email: string;
  birthdate: string; // ISO date-time
  accounts: BankAccountResponse[];
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
}

export interface TransactionResponse {
  transaction_type: TransactionType;
  sender_name?: string;
  receiver_name?: string;
  amount: number;
  currency: Currency;
  transaction_date: string; // ISO date-time
  comment?: string;
}

export interface RecentTransactionsResponse {
  total: number;
  page: number;
  size: number;
  transactions: TransactionResponse[];
}

// Auth response (login returns a token)
export interface AuthResponse {
  token: string;
  user_id: string;
}

// API Error
export interface ApiError {
  message: string;
  status: number;
}
