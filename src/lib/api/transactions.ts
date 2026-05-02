import { apiClient } from "./client";
import type {
  CreateTransactionRequest,
  TransactionResponse,
  Transaction,
  RecentTransactionsResponse,
} from "@/types";

export const transactionsApi = {
  /**
   * Transfer money between accounts
   */
  async transfer(data: CreateTransactionRequest): Promise<TransactionResponse> {
    // OpenAPI: POST /transactions/transfer -> TransactionResponse
    return apiClient.post<TransactionResponse>("/transactions/transfer", data);
  },

  /**
   * Make a payment
   */
  async payment(data: CreateTransactionRequest): Promise<Transaction> {
    return apiClient.post<Transaction>("/transactions/payment", data);
  },

  /**
   * Deposit money to account
   */
  async deposit(data: CreateTransactionRequest): Promise<TransactionResponse> {
    // OpenAPI: POST /transactions/deposit -> TransactionResponse
    return apiClient.post<TransactionResponse>("/transactions/deposit", data);
  },

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<TransactionResponse> {
    return apiClient.get<TransactionResponse>(`/transactions/${transactionId}`);
  },

  /**
   * Cancel transaction by ID
   */
  async cancel(transactionId: string): Promise<void> {
    return apiClient.put<void>(`/transactions/cancel/${transactionId}`);
  },

  /**
   * Get recent transactions for an account
   */
  async getRecent(
    accountId: string,
    page: number = 0,
    size: number = 5
  ): Promise<RecentTransactionsResponse> {
    return apiClient.get<RecentTransactionsResponse>(
      // OpenAPI: GET /transactions/get/{accountId}?page=&size=
      `/transactions/get/${accountId}?page=${page}&size=${size}`
    );
  },

  /**
   * Транзакции счёта по коду категории
   * OpenAPI: GET /transactions/{accountId}/{categoryCode}
   */
  async getByCategory(
    accountId: string,
    categoryCode: string
  ): Promise<TransactionResponse[]> {
    const enc = encodeURIComponent(categoryCode);
    return apiClient.get<TransactionResponse[]>(
      `/transactions/${accountId}/${enc}`
    );
  },
};
