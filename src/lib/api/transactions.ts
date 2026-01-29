import { apiClient } from "./client";
import type {
  CreateTransactionRequest,
  Transaction,
  RecentTransactionsResponse,
} from "@/types";

export const transactionsApi = {
  /**
   * Transfer money between accounts
   */
  async transfer(data: CreateTransactionRequest): Promise<Transaction> {
    return apiClient.post<Transaction>("/transactions/transfer", data);
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
  async deposit(data: CreateTransactionRequest): Promise<Transaction> {
    return apiClient.post<Transaction>("/transactions/deposit", data);
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
      `/transactions/get-recent/${accountId}?page=${page}&size=${size}`
    );
  },
};
