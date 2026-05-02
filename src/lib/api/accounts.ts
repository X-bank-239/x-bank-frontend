import { apiClient } from "./client";
import type {
  BankAccount,
  BankAccountResponse,
  CreateBankAccountRequest,
} from "@/types";

export const accountsApi = {
  /**
   * Create a new bank account
   */
  async create(data: CreateBankAccountRequest): Promise<BankAccount> {
    return apiClient.post<BankAccount>("/bank-account/create", data);
  },

  /**
   * Get bank account by ID
   */
  async getById(accountId: string): Promise<BankAccountResponse> {
    // OpenAPI: GET /bank-account/{accountId}
    return apiClient.get<BankAccountResponse>(`/bank-account/${accountId}`);
  },

  /**
   * Get all accounts for a user
   */
  async getByUserId(userId: string): Promise<BankAccountResponse[]> {
    // OpenAPI: GET /bank-account/list/{userId}
    return apiClient.get<BankAccountResponse[]>(`/bank-account/list/${userId}`);
  },

  /**
   * Get accounts of current user
   */
  async getCurrentUserAccounts(): Promise<BankAccountResponse[]> {
    // OpenAPI: GET /bank-account/list
    return apiClient.get<BankAccountResponse[]>("/bank-account/list");
  },

  /**
   * Deactivate bank account by ID
   */
  async deactivate(accountId: string): Promise<void> {
    // OpenAPI: DELETE /bank-account/{accountId}
    return apiClient.delete<void>(`/bank-account/${accountId}`);
  },

  /**
   * Reactivate (unblock) bank account by ID
   * OpenAPI: POST /bank-account/{accountId}/unblock
   */
  async reactivate(accountId: string): Promise<void> {
    return apiClient.post<void>(`/bank-account/${accountId}/unblock`, {});
  },
};
