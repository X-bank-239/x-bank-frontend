import { apiClient } from "./client";
import type {
  CloseSavingsRequest,
  CreateSavingsAccountRequest,
  ProlongSavingsRequest,
  SavingsAccount,
} from "@/types";

/**
 * Вклады (накопительные счета) — пути как в OpenAPI.
 * create: JSON-тело; prolong: query; close: JSON-тело (как на бэкенде).
 */
export interface SavingsInterestParams {
  allowWithdrawal: boolean;
  allowTopUp: boolean;
}

export const savingsApi = {
  getAll(): Promise<SavingsAccount[]> {
    return apiClient.get<SavingsAccount[]>("/savings/list");
  },

  getInterest(params: SavingsInterestParams): Promise<number> {
    const q = new URLSearchParams({
      allowWithdrawal: String(params.allowWithdrawal),
      allowTopUp: String(params.allowTopUp),
    }).toString();
    return apiClient.get<number>(`/savings/interest?${q}`);
  },

  get(accountId: string): Promise<SavingsAccount> {
    return apiClient.get<SavingsAccount>(`/savings/get/${accountId}`);
  },

  /** POST /savings/create — тело JSON (`CreateSavingsAccountRequest`), как в OpenAPI. */
  create(data: CreateSavingsAccountRequest): Promise<SavingsAccount> {
    return apiClient.post<SavingsAccount>("/savings/create", data);
  },

  prolong(accountId: string, data: ProlongSavingsRequest): Promise<SavingsAccount> {
    const q = new URLSearchParams({ new_maturity_date: data.new_maturity_date }).toString();
    return apiClient.post<SavingsAccount>(`/savings/prolong/${accountId}?${q}`);
  },

  close(accountId: string, data: CloseSavingsRequest): Promise<void> {
    return apiClient.delete<void>(`/savings/close/${accountId}`, data);
  },
};
