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
    return apiClient.get<BankAccountResponse>(`/bank-account/get/${accountId}`);
  },

  /**
   * Get all accounts for a user
   */
  async getByUserId(userId: string): Promise<BankAccountResponse[]> {
    return apiClient.get<BankAccountResponse[]>(`/user/get-accounts/${userId}`);
  },
};
