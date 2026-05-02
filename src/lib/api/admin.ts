import { apiClient } from "./client";
import type {
  BankAccountResponse,
  TransactionResponse,
  UserProfileResponse,
} from "@/types";

/**
 * Эндпойнты с ролью ADMIN и связанные операции.
 */
export const adminApi = {
  getUserAccounts(userId: string): Promise<BankAccountResponse[]> {
    return apiClient.get<BankAccountResponse[]>(`/user/get-accounts/${userId}`);
  },

  blockUser(userId: string): Promise<void> {
    return apiClient.delete<void>(`/user/${userId}`);
  },

  /**
   * OpenAPI: POST /user/{userId}/unblock
   */
  unblockUser(userId: string): Promise<void> {
    // Некоторые реализации на бэкенде требуют JSON body даже для "пустых" POST.
    return apiClient.post<void>(`/user/${userId}/unblock`, {});
  },

  getUserProfile(userId: string): Promise<UserProfileResponse> {
    return apiClient.get<UserProfileResponse>(`/user/${userId}`);
  },

  getUserProfileByEmail(email: string): Promise<UserProfileResponse> {
    const enc = encodeURIComponent(email);
    return apiClient.get<UserProfileResponse>(`/user/email/${enc}`);
  },

  getBankAccount(accountId: string): Promise<BankAccountResponse> {
    return apiClient.get<BankAccountResponse>(`/bank-account/${accountId}`);
  },

  /**
   * OpenAPI: POST /bank-account/{accountId}/unblock
   */
  reactivateAccount(accountId: string): Promise<void> {
    // Некоторые реализации на бэкенде требуют JSON body даже для "пустых" POST.
    return apiClient.post<void>(`/bank-account/${accountId}/unblock`, {});
  },

  /**
   * OpenAPI: DELETE /bank-account/{accountId}
   */
  deactivateAccount(accountId: string): Promise<void> {
    return apiClient.delete<void>(`/bank-account/${accountId}`);
  },

  /** OpenAPI: один объект; на практике иногда приходит массив. */
  async getBankAccountsByUserId(userId: string): Promise<BankAccountResponse[]> {
    const data = await apiClient.get<
      BankAccountResponse | BankAccountResponse[]
    >(`/bank-account/list/${userId}`);
    return Array.isArray(data) ? data : [data];
  },

  cancelTransaction(transactionId: string): Promise<void> {
    return apiClient.put<void>(`/transactions/cancel/${transactionId}`);
  },

  getTransaction(transactionId: string): Promise<TransactionResponse> {
    return apiClient.get<TransactionResponse>(`/transactions/${transactionId}`);
  },
};
